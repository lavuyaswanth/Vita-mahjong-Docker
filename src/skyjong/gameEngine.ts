// Skyjong Core Solitaire Engine
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

// Generate the complete standard deck (168 tiles: 108 suits + 16 winds +
// 12 dragons + 16 seasons + 16 flowers). Only the set of distinct faces is
// used by the generator — see ALL_FACES below.
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

// The set of distinct tile faces, derived once from the canonical deck. Pairs
// are synthesized two-identical-at-a-time, so only the faces matter here — the
// per-face copy counts in generateStandardDeck() are irrelevant to placement.
type Face = { type: string; value: number };
const ALL_FACES: Face[] = (() => {
  const seen = new Map<string, Face>();
  for (const t of generateStandardDeck()) {
    const key = `${t.type}_${t.value}`;
    if (!seen.has(key)) seen.set(key, { type: t.type, value: t.value });
  }
  return [...seen.values()];
})();

// ---- Blocking index (buildBoard's inner loop) ----------------------------
// The removal simulation asks "is this slot free?" for every active slot on
// every one of the n/2 removal steps, and checkIfTileIsFree scans the whole
// active list — O(n^3) per attempt, up to 20 attempts, on the main thread at
// level start (~2.3M operations for a 132-tile board).
//
// The blocking relationships depend only on layout geometry, which never
// changes, so derive them once per layout and keep three counters per slot.
// Freeness then becomes a pair of integer comparisons, and removing a tile only
// touches the handful of slots it actually blocked.
interface BlockIndex {
  // Counts with every slot still on the board.
  coverCount: number[];  // slots stacked on top of this one
  leftCount: number[];   // same-layer neighbours on its logical left
  rightCount: number[];  // ... and right
  // Reverse edges: removing slot k decrements the counters of these slots.
  uncovers: number[][];
  freesLeft: number[][];
  freesRight: number[][];
}

const blockIndexCache = new Map<LayoutName, BlockIndex>();

function getBlockIndex(layoutName: LayoutName): BlockIndex {
  const cached = blockIndexCache.get(layoutName);
  if (cached) return cached;

  const coords = layouts[layoutName].coords;
  const n = coords.length;
  const idx: BlockIndex = {
    coverCount: new Array<number>(n).fill(0),
    leftCount: new Array<number>(n).fill(0),
    rightCount: new Array<number>(n).fill(0),
    uncovers: Array.from({ length: n }, () => [] as number[]),
    freesLeft: Array.from({ length: n }, () => [] as number[]),
    freesRight: Array.from({ length: n }, () => [] as number[])
  };

  // Mirrors checkIfTileIsFree exactly: covered = any higher layer overlapping
  // the face; a side is blocked by a same-layer tile two units away whose
  // perpendicular offset is under half a tile.
  for (let i = 0; i < n; i++) {
    const a = coords[i];
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const b = coords[k];
      if (b.z > a.z && overlaps(a, b)) {
        idx.coverCount[i]++;
        idx.uncovers[k].push(i);
      } else if (b.z === a.z && Math.abs(b.x - a.x) < 1) {
        if (b.y === a.y - 2) {
          idx.leftCount[i]++;
          idx.freesLeft[k].push(i);
        } else if (b.y === a.y + 2) {
          idx.rightCount[i]++;
          idx.freesRight[k].push(i);
        }
      }
    }
  }

  blockIndexCache.set(layoutName, idx);
  return idx;
}

// Build a guaranteed-solvable board using the reverse-placement algorithm.
// 1. Repeatedly remove two "free" tiles as a pair until the layout is empty,
//    recording the order — this depends only on geometry, so the reverse of it
//    is always a valid placement order (each placed pair was free when placed).
// 2. Walk that placement order and assign each pair a single face, written to
//    both positions, so every pair is two identical, obviously-matching tiles.
// `maxTypes` (optional) caps how many DISTINCT faces a board uses. Fewer faces
// = more duplicates = easier to spot pairs, so early levels pass a small value
// and it ramps up. Undefined/0 = full variety.
export function buildBoard(layoutName: LayoutName, seed?: number, maxTypes?: number): TileState[] {
  const coords = layouts[layoutName].coords;
  const totalSlots = coords.length;
  const effectiveSeed = seed || Math.floor(Math.random() * 1000000);

  const MAX_ATTEMPTS = 20;

  const assign = (pairs: [number, number][], rng: SeededRandom): TileState[] => {
    // Difficulty ramp: restrict the face pool on smaller (early) boards.
    let pool = ALL_FACES;
    if (totalSlots < 144 && maxTypes) {
      pool = [...ALL_FACES];
      rng.shuffle(pool);
      pool = pool.slice(0, Math.max(2, maxTypes));
    }

    const faces = new Array<Face>(totalSlots);
    for (const [a, b] of pairs) {
      const face = rng.choose(pool);
      faces[a] = face;
      faces[b] = face;
    }

    const tiles: TileState[] = coords.map((coord, i) => ({
      x: coord.x,
      y: coord.y,
      z: coord.z,
      id: `tile_${coord.x}_${coord.y}_${coord.z}`,
      type: (faces[i] ?? ALL_FACES[0]).type,
      value: (faces[i] ?? ALL_FACES[0]).value,
      isFree: false,
      matched: false
    }));
    return recalculateFreeState(tiles);
  };

  const blocks = getBlockIndex(layoutName);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // A fresh RNG stream per attempt so retries explore new removal orderings.
    const rng = new SeededRandom(effectiveSeed + attempt * 7919);

    // Simulate removing free pairs until the board clears (or we get stuck).
    const active = new Array<boolean>(totalSlots).fill(true);
    const cover = blocks.coverCount.slice();
    const left = blocks.leftCount.slice();
    const right = blocks.rightCount.slice();
    const removalOrder: [number, number][] = [];
    let remaining = totalSlots;

    const takeOff = (k: number) => {
      active[k] = false;
      for (const i of blocks.uncovers[k]) cover[i]--;
      for (const i of blocks.freesLeft[k]) left[i]--;
      for (const i of blocks.freesRight[k]) right[i]--;
    };

    while (remaining > 0) {
      // Ascending slot order, matching the original scan, so `rng.shuffle` draws
      // from an identically ordered list and seeded boards stay byte-identical.
      const freeIndices: number[] = [];
      for (let i = 0; i < totalSlots; i++) {
        if (active[i] && cover[i] === 0 && (left[i] === 0 || right[i] === 0)) {
          freeIndices.push(i);
        }
      }

      if (freeIndices.length < 2) break; // stuck — retry with a new ordering

      rng.shuffle(freeIndices);
      const [idxA, idxB] = freeIndices;
      // Both were free against the same board state; the two removals are
      // independent, so order between them doesn't matter.
      takeOff(idxA);
      takeOff(idxB);
      removalOrder.push([idxA, idxB]);
      remaining -= 2;
    }

    if (remaining > 0) continue; // this attempt couldn't clear the board

    // Reverse removal → placement order (deepest pairs placed first), then
    // assign faces with an independent RNG stream.
    const placementOrder = [...removalOrder].reverse();
    return assign(placementOrder, new SeededRandom(effectiveSeed + attempt * 7919 + 1));
  }

  // Effectively unreachable for these symmetric piles: every attempt failed to
  // find a removal sequence. Fall back to pairing coords in order so we always
  // return a full board (not guaranteed solvable, but it never gets here).
  const fallbackPairs: [number, number][] = [];
  for (let i = 0; i + 1 < totalSlots; i += 2) fallbackPairs.push([i, i + 1]);
  return assign(fallbackPairs, new SeededRandom(effectiveSeed));
}

// ---- Neighbour index (recalculateFreeState's inner loop) -------------------
// This runs on every tap, and several handlers call it back-to-back with
// findAvailableMoves. Done naively it is O(n^2): checkIfTileIsFree makes three
// full passes over ~130 active tiles, for each of ~130 tiles.
//
// Geometry is fixed for a given board, so cache each tile's blockers by ARRAY
// POSITION and then only look at those. A tile is covered by at most a handful
// of others and has at most one neighbour per side, so this is O(n) in practice.
//
// Unlike buildBoard there is no LayoutName to key on here — recalculateFreeState
// only ever sees tiles. So key on the geometry itself, and keep the coordinates
// alongside the entry to VERIFY on every hit: a hash collision would otherwise
// hand back an index for a different board and silently mis-compute freeness.
interface NeighbourIndex {
  coords: Int32Array;   // flat [x,y,z, x,y,z, ...] in tile-array order
  covers: number[][];   // positions stacked above position i
  left: number[][];     // same-layer blockers on i's logical left
  right: number[][];    // ... and right
}

const neighbourIndexCache = new Map<string, NeighbourIndex>();
const NEIGHBOUR_CACHE_LIMIT = 32;

const flattenCoords = (tiles: TileState[]): Int32Array => {
  const flat = new Int32Array(tiles.length * 3);
  for (let i = 0; i < tiles.length; i++) {
    flat[i * 3] = tiles[i].x;
    flat[i * 3 + 1] = tiles[i].y;
    flat[i * 3 + 2] = tiles[i].z;
  }
  return flat;
};

const coordsEqual = (a: Int32Array, b: Int32Array): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

function getNeighbourIndex(tiles: TileState[]): NeighbourIndex {
  const flat = flattenCoords(tiles);

  // FNV-1a over the coordinates. Only a cache key — correctness comes from the
  // coordsEqual check below, not from this being collision-free.
  let hash = 0x811c9dc5;
  for (let i = 0; i < flat.length; i++) {
    hash ^= flat[i]! + 0x9e3779b9;
    hash = Math.imul(hash, 0x01000193);
  }
  const key = `${tiles.length}:${hash >>> 0}`;

  const cached = neighbourIndexCache.get(key);
  if (cached && coordsEqual(cached.coords, flat)) return cached;

  const n = tiles.length;
  const idx: NeighbourIndex = {
    coords: flat,
    covers: Array.from({ length: n }, () => [] as number[]),
    left: Array.from({ length: n }, () => [] as number[]),
    right: Array.from({ length: n }, () => [] as number[])
  };

  // Mirrors checkIfTileIsFree exactly.
  for (let i = 0; i < n; i++) {
    const a = tiles[i];
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const b = tiles[k];
      if (b.z > a.z && overlaps(a, b)) {
        idx.covers[i]!.push(k);
      } else if (b.z === a.z && Math.abs(b.x - a.x) < 1) {
        if (b.y === a.y - 2) idx.left[i]!.push(k);
        else if (b.y === a.y + 2) idx.right[i]!.push(k);
      }
    }
  }

  // Bounded so a long session across many boards can't grow this without limit.
  if (neighbourIndexCache.size >= NEIGHBOUR_CACHE_LIMIT) {
    const oldest = neighbourIndexCache.keys().next();
    if (!oldest.done) neighbourIndexCache.delete(oldest.value);
  }
  neighbourIndexCache.set(key, idx);
  return idx;
}

// Recalculates the 'isFree' state for all non-matched tiles on the board.
// Pure: returns a new array, cloning only the tiles whose state changed, so
// unchanged tiles keep their identity (lets React.memo skip re-rendering them).
export function recalculateFreeState(tiles: TileState[]): TileState[] {
  if (tiles.length === 0) return tiles;
  const idx = getNeighbourIndex(tiles);
  const anyActive = (positions: number[]): boolean => {
    for (const p of positions) if (!tiles[p]!.matched) return true;
    return false;
  };

  return tiles.map((tile, i) => {
    const isFree = tile.matched
      ? false
      : !anyActive(idx.covers[i]!) && (!anyActive(idx.left[i]!) || !anyActive(idx.right[i]!));
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

  // Freeness depends only on coordinates and `matched` — a shuffle moves FACES
  // between positions and touches neither. So it is computed once here rather
  // than re-derived on each of up to 30 retries, where every call recomputed the
  // identical answer.
  const freeState = recalculateFreeState(working);
  const freeUnmatched: TileState[] = [];
  freeState.forEach((t, i) => {
    if (t.isFree && !t.matched) freeUnmatched.push(working[i]!);
  });

  // Shuffle until at least one pair is playable (or give up after 30 attempts).
  for (let attempts = 0; attempts < 30; attempts++) {
    rng.shuffle(values);

    // Apply values to the unmatched positions (mutating our local clones only)
    unmatched.forEach((t, idx) => {
      t.type = values[idx]!.type;
      t.value = values[idx]!.value;
    });

    // Same test as findAvailableMoves, over the free set computed above: is any
    // face duplicated among the free tiles?
    const seen = new Set<string>();
    let playable = false;
    for (const t of freeUnmatched) {
      const key = `${t.type}_${t.value}`;
      if (seen.has(key)) { playable = true; break; }
      seen.add(key);
    }
    if (playable) break;
  }

  // Publish the free flags onto the returned board. Built here rather than
  // reusing `freeState`, whose clones were made before the faces were shuffled.
  return working.map((t, i) => {
    const isFree = freeState[i]!.isFree;
    return isFree === t.isFree ? t : { ...t, isFree };
  });
}

// Deterministic seed for a calendar date (YYYYMMDD) — used by the Daily
// Challenge so everyone plays the same board each day.
export function getDailyChallengeSeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}
