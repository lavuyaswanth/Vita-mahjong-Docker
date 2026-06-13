// Vita Mahjong Core Solitaire Engine
// Handles board state, shuffle generation, blockage logic, solver hints, and seeds.

import { layouts, overlaps } from './layouts';
import type { LayoutName, TileCoords } from './layouts';

export interface TileState extends TileCoords {
  type: string;       // e.g. 'bamboo', 'circle', 'character', 'wind', 'dragon', 'season', 'flower'
  value: number;      // e.g. 1 to 9 for suits, or 0,1,2,3 for winds
  isFree: boolean;    // pre-calculated
  matched: boolean;   // true if cleared
  wobbling?: boolean; // transitional state for blocked click wobble animation
}

// Seedable random number generator (mulberry32) for deterministic Daily Challenges
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = (Math.abs(Math.floor(seed)) >>> 0) || 1;
  }

  // Returns 0.0 to 1.0
  public next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Choose from array
  public choose<T>(arr: T[]): T {
    const index = Math.floor(this.next() * arr.length);
    return arr[index];
  }

  // Shuffle in place
  public shuffle<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}

// Generate the complete standard deck of 144 tiles
export function generateStandardDeck(): { type: string; value: number }[] {
  const deck: { type: string; value: number }[] = [];

  // 1. Suits: Bamboo, Circle, Character (9 values each, 4 tiles of each value = 36 * 3 = 108 tiles)
  const suits = ['bamboo', 'circle', 'character'];
  suits.forEach(suit => {
    for (let val = 1; val <= 9; val++) {
      for (let i = 0; i < 4; i++) {
        deck.push({ type: suit, value: val });
      }
    }
  });

  // 2. Winds: East, South, West, North (4 values, 4 tiles of each value = 16 tiles)
  for (let wind = 0; wind < 4; wind++) {
    for (let i = 0; i < 4; i++) {
      deck.push({ type: 'wind', value: wind });
    }
  }

  // 3. Dragons: Red, Green, White (3 values, 4 tiles of each value = 12 tiles)
  for (let dragon = 0; dragon < 3; dragon++) {
    for (let i = 0; i < 4; i++) {
      deck.push({ type: 'dragon', value: dragon });
    }
  }

  // 4. Seasons & Flowers (Moon Phases / Poison Plants in the Legends skin).
  //    Classic mahjong uses one of each as a wildcard group, but that leaves
  //    tiles that LOOK unmatched (a lone New Moon + lone Harvest Moon). We make
  //    them ordinary 4-value suits with 4 copies each, so every tile on the
  //    board always has an identical twin — no "these aren't a pair" confusion.
  for (let season = 0; season < 4; season++) {
    for (let i = 0; i < 4; i++) deck.push({ type: 'season', value: season });
  }
  for (let flower = 0; flower < 4; flower++) {
    for (let i = 0; i < 4; i++) deck.push({ type: 'flower', value: flower });
  }

  return deck;
}

// Check if two tiles match: every pair is two identical tiles (same type AND
// value), so a matching pair is always visually obvious to the player.
export function tilesMatch(a: TileState, b: TileState): boolean {
  return a.type === b.type && a.value === b.value;
}

// Check if a specific tile is "free" (unblocked) on a board.
//
// Classic Mahjong free rule: a tile is playable when BOTH
//   1. nothing is stacked on top of it (no higher layer overlaps its face), AND
//   2. at least one long side (left OR right) is open.
//
// A side counts as "blocked" only if a same-layer neighbour overlaps that side
// by MORE THAN 50% — i.e. their faces are aligned on the perpendicular axis
// (centres within one half-tile). A neighbour that only straddles by half a tile
// (the 50% offset stacking) does NOT block. The "left/right" axis here is the
// board's logical Y, which is the horizontal (left↔right) axis as the player
// sees it in portrait (the renderer transposes X↔Y for portrait).
export function checkIfTileIsFree(tile: TileCoords, activeTiles: TileCoords[]): boolean {
  // 1. Covered from above?
  const topOverlap = activeTiles.some(other => other.z > tile.z && overlaps(tile, other));
  if (topOverlap) return false;

  // 2. Blocked on a side? A neighbour two units away on the same layer blocks
  //    only when it overlaps the perpendicular axis by >50% (|Δx| < 1).
  const sideOverlaps = (o: TileCoords) => o.z === tile.z && Math.abs(o.x - tile.x) < 1;
  const leftBlocked = activeTiles.some(o => sideOverlaps(o) && o.y === tile.y - 2);
  const rightBlocked = activeTiles.some(o => sideOverlaps(o) && o.y === tile.y + 2);

  // Free if at least one side is open.
  return !leftBlocked || !rightBlocked;
}

// Build a guaranteed-solvable board using the reverse-placement algorithm.
// 1. Start with all layout positions filled (conceptually).
// 2. Repeatedly find two "free" tiles, remove them as a pair, and record the order.
// 3. Reverse the removal order → valid placement order (each placed pair was free).
// 4. Assign shuffled tile face values to each pair.
export function buildSolvableBoard(layoutName: LayoutName, seed?: number): TileState[] {
  const config = layouts[layoutName];
  const coords = config.coords;
  const totalSlots = coords.length;
  const effectiveSeed = seed || Math.floor(Math.random() * 1000000);

  const MAX_ATTEMPTS = 20;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Use a different RNG stream per attempt so retries explore new orderings
    const rng = new SeededRandom(effectiveSeed + attempt * 7919);

    // --- Phase 1: Simulate removal of free pairs ---
    // Track which positions are still "active" in the simulated board
    const active = new Array<boolean>(totalSlots).fill(true);
    // Record removal order as pairs of indices into coords[]
    const removalOrder: [number, number][] = [];

    let remaining = totalSlots;

    while (remaining > 0) {
      // Build the list of currently active coordinates for free-check
      // checkIfTileIsFree expects TileCoords (with id), so attach placeholder ids
      const activeCoordsWithIndex: { coord: TileCoords; idx: number }[] = [];
      for (let i = 0; i < totalSlots; i++) {
        if (active[i]) {
          activeCoordsWithIndex.push({
            coord: { ...coords[i], id: `sim-${i}` },
            idx: i
          });
        }
      }

      const activeCoordsList = activeCoordsWithIndex.map(a => a.coord);

      // Find all free tiles among active ones
      const freeTileIndices: number[] = [];
      for (const entry of activeCoordsWithIndex) {
        if (checkIfTileIsFree(entry.coord, activeCoordsList)) {
          freeTileIndices.push(entry.idx);
        }
      }

      if (freeTileIndices.length < 2) {
        // Stuck — can't form a pair; break and retry
        break;
      }

      // Shuffle free tiles to randomize which pair we pick
      rng.shuffle(freeTileIndices);

      // Pick the first two free tiles as a removal pair
      const idxA = freeTileIndices[0];
      const idxB = freeTileIndices[1];

      active[idxA] = false;
      active[idxB] = false;
      removalOrder.push([idxA, idxB]);
      remaining -= 2;
    }

    if (remaining > 0) {
      // This attempt failed to clear all tiles — retry
      continue;
    }

    // --- Phase 2: Build a balanced deck for this layout ---
    const deckRng = new SeededRandom(effectiveSeed + attempt * 7919 + 1);
    let deck = generateStandardDeck();
    deckRng.shuffle(deck);

    // For layouts with fewer than 144 tiles, select a balanced subset of pairs
    if (totalSlots < 144) {
      const subset: typeof deck = [];

      // Group the deck by exact identity so every selected pair is identical
      const groups: Record<string, typeof deck> = {};
      deck.forEach(t => {
        const key = `${t.type}_${t.value}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
      });

      const groupKeys = Object.keys(groups);
      let pairCount = Math.floor(totalSlots / 2);

      while (pairCount > 0 && groupKeys.length > 0) {
        const randomKey = deckRng.choose(groupKeys);
        const group = groups[randomKey];

        if (group && group.length >= 2) {
          subset.push(group.pop()!);
          subset.push(group.pop()!);
          pairCount--;
        } else {
          const idx = groupKeys.indexOf(randomKey);
          if (idx > -1) groupKeys.splice(idx, 1);
        }
      }

      // Odd-slot fallback (shouldn't happen)
      if (subset.length < totalSlots) {
        const oddKeys = Object.keys(groups).filter(k => groups[k].length > 0);
        if (oddKeys.length > 0) {
          subset.push(groups[oddKeys[0]].pop()!);
        }
      }

      deck = subset;
      deckRng.shuffle(deck);
    }

    // --- Phase 3: Assign tile faces using reversed removal order ---
    // Reverse the removal order → placement order (pairs placed first are deepest)
    const placementOrder = [...removalOrder].reverse();

    // Consume deck in pairs, assigning matching faces to each pair of positions
    const tileAssignments = new Array<{ type: string; value: number }>(totalSlots);
    let deckIndex = 0;

    for (const [posA, posB] of placementOrder) {
      const tileA = deck[deckIndex++] || { type: 'bamboo', value: 1 };
      deckIndex++; // consume the paired slot; both positions take tileA's face

      // Assign the SAME face to both positions so the pair is two identical tiles
      tileAssignments[posA] = { type: tileA.type, value: tileA.value };
      tileAssignments[posB] = { type: tileA.type, value: tileA.value };
    }

    // --- Phase 4: Build the final TileState array ---
    const tiles: TileState[] = coords.map((coord, index) => {
      const tileDef = tileAssignments[index] || { type: 'bamboo', value: 1 };

      return {
        x: coord.x,
        y: coord.y,
        z: coord.z,
        id: `tile_${coord.x}_${coord.y}_${coord.z}`,
        type: tileDef.type,
        value: tileDef.value,
        isFree: false,
        matched: false
      };
    });

    return recalculateFreeState(tiles);
  }

  // Fallback: all attempts failed — use legacy random placement (should be extremely rare)
  return buildBoardLegacy(layoutName, effectiveSeed);
}

// Legacy random board builder (original algorithm, kept as fallback)
function buildBoardLegacy(layoutName: LayoutName, seed: number): TileState[] {
  const config = layouts[layoutName];
  const totalSlots = config.coords.length;

  const rng = new SeededRandom(seed);

  let deck = generateStandardDeck();
  rng.shuffle(deck);

  if (totalSlots < 144) {
    const subset: typeof deck = [];

    const groups: Record<string, typeof deck> = {};
    deck.forEach(t => {
      const key = `${t.type}_${t.value}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    const groupKeys = Object.keys(groups);
    let pairCount = Math.floor(totalSlots / 2);

    while (pairCount > 0 && groupKeys.length > 0) {
      const randomKey = rng.choose(groupKeys);
      const group = groups[randomKey];

      if (group && group.length >= 2) {
        subset.push(group.pop()!);
        subset.push(group.pop()!);
        pairCount--;
      } else {
        const idx = groupKeys.indexOf(randomKey);
        if (idx > -1) groupKeys.splice(idx, 1);
      }
    }

    if (subset.length < totalSlots) {
      const oddKeys = Object.keys(groups).filter(k => groups[k].length > 0);
      if (oddKeys.length > 0) {
        subset.push(groups[oddKeys[0]].pop()!);
      }
    }

    deck = subset;
    rng.shuffle(deck);
  }

  const tiles: TileState[] = config.coords.map((coord, index) => {
    const tileDef = deck[index] || { type: 'bamboo', value: 1 };

    return {
      x: coord.x,
      y: coord.y,
      z: coord.z,
      id: `tile_${coord.x}_${coord.y}_${coord.z}`,
      type: tileDef.type,
      value: tileDef.value,
      isFree: false,
      matched: false
    };
  });

  return recalculateFreeState(tiles);
}

// Generate the initial board state for a given layout and seed
export function buildBoard(layoutName: LayoutName, seed?: number): TileState[] {
  return buildSolvableBoard(layoutName, seed);
}

// Recalculates the 'isFree' state for all non-matched tiles on the board.
// Pure: returns a new array, cloning only the tiles whose state changed, so
// unchanged tiles keep their identity (lets React.memo skip re-rendering them).
export function recalculateFreeState(tiles: TileState[]): TileState[] {
  const activeTiles = tiles.filter(t => !t.matched);
  return tiles.map(tile => {
    const isFree = tile.matched ? false : checkIfTileIsFree(tile, activeTiles);
    if (isFree === tile.isFree) return tile;
    return { ...tile, isFree };
  });
}

// Calculate the number of possible matching pairs among free tiles
export function findAvailableMoves(tiles: TileState[]): [TileState, TileState][] {
  const freeTiles = tiles.filter(t => t.isFree && !t.matched);
  const moves: [TileState, TileState][] = [];

  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      if (tilesMatch(freeTiles[i], freeTiles[j])) {
        moves.push([freeTiles[i], freeTiles[j]]);
      }
    }
  }

  return moves;
}

// Solvable Shuffle: swaps tiles that are NOT matched, checking for valid moves.
// Pure: works on clones so the caller's previous board state is never mutated.
export function shuffleActiveTiles(tiles: TileState[]): TileState[] {
  const working = tiles.map(t => t.matched ? t : { ...t });
  const unmatched = working.filter(t => !t.matched);

  if (unmatched.length === 0) return tiles;

  // Extract values and shuffle them
  const values = unmatched.map(t => ({
    type: t.type,
    value: t.value
  }));

  const rng = new SeededRandom(Math.random() * 999999);
  let result = working;

  // Shuffle until we find a combination with at least one possible move (or limit to 30 attempts)
  for (let attempts = 0; attempts < 30; attempts++) {
    rng.shuffle(values);

    // Apply values to the unmatched positions (mutating our local clones only)
    unmatched.forEach((t, idx) => {
      t.type = values[idx].type;
      t.value = values[idx].value;
    });

    result = recalculateFreeState(working);
    if (findAvailableMoves(result).length > 0) break;
  }

  return result;
}
