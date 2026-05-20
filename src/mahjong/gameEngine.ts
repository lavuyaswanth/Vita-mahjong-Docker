// Vita Mahjong Core Solitaire Engine
// Handles board state, shuffle generation, blockage logic, solver hints, and seeds.

import { layouts, overlaps } from './layouts';
import type { LayoutName, TileCoords } from './layouts';

export interface TileState extends TileCoords {
  type: string;       // e.g. 'bamboo', 'circle', 'character', 'wind', 'dragon', 'season', 'flower'
  value: number;      // e.g. 1 to 9 for suits, or 0,1,2,3 for winds
  iconIndex: number;  // maps to custom SVGs or emojis
  isFree: boolean;    // pre-calculated
  selected: boolean;  // selection state
  revealed: boolean; // used in Memory Mahjong Mode
  matched: boolean;   // true if cleared
}

// Simple seedable random number generator (LCC) for deterministic Daily Challenges
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = Math.abs(seed) || 1;
  }

  // Returns 0.0 to 1.0
  public next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
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

  // 4. Seasons: Spring, Summer, Autumn, Winter (4 tiles, unique values)
  for (let season = 0; season < 4; season++) {
    deck.push({ type: 'season', value: season });
  }

  // 5. Flowers: Plum, Orchid, Bamboo, Chrysanthemum (4 tiles, unique values)
  for (let flower = 0; flower < 4; flower++) {
    deck.push({ type: 'flower', value: flower });
  }

  return deck;
}

// Check if two tiles are matching according to Solitaire rules
export function tilesMatch(a: TileState, b: TileState): boolean {
  if (a.type !== b.type) return false;

  // Seasons and Flowers match with ANY tile of the same type
  if (a.type === 'season' || a.type === 'flower') {
    return true;
  }

  // Other suits/winds/dragons must have exact matching values
  return a.value === b.value;
}

// Check if a specific tile is "free" (unblocked) on a board
export function checkIfTileIsFree(tile: TileCoords, activeTiles: TileCoords[]): boolean {
  // 1. Check if there are any tiles on top of it (higher Z layer that overlaps)
  const topOverlap = activeTiles.some(other => {
    if (other.z !== tile.z + 1) return false;
    return overlaps(tile, other);
  });

  if (topOverlap) return false;

  // 2. Check side blockages (same layer, overlapping Y-axis)
  // Left blocker: tile at same height with x = tile.x - 2 and Y overlapping
  const hasLeftBlocker = activeTiles.some(other => {
    if (other.z !== tile.z) return false;
    return other.x === tile.x - 2 && Math.abs(other.y - tile.y) < 2;
  });

  // Right blocker: tile at same height with x = tile.x + 2 and Y overlapping
  const hasRightBlocker = activeTiles.some(other => {
    if (other.z !== tile.z) return false;
    return other.x === tile.x + 2 && Math.abs(other.y - tile.y) < 2;
  });

  // Free if there is no blocker on the Left OR no blocker on the Right
  return !hasLeftBlocker || !hasRightBlocker;
}

// Generate the initial board state for a given layout and seed
export function buildBoard(layoutName: LayoutName, seed?: number): TileState[] {
  const config = layouts[layoutName];
  const totalSlots = config.coords.length;

  // 1. Create a seedable random generator
  const rng = new SeededRandom(seed || Math.floor(Math.random() * 1000000));

  // 2. Generate a standard pool of tiles, then shuffle it
  let deck = generateStandardDeck();
  rng.shuffle(deck);

  // If the layout needs fewer tiles than 144, we need to choose a balanced subset
  // that ensures matching pairs.
  if (totalSlots < 144) {
    const subset: typeof deck = [];

    // Group the deck by identity to make pairs easily
    const groups: Record<string, typeof deck> = {};
    deck.forEach(t => {
      // Group seasons and flowers as generic types since they match with any season/flower
      const key = (t.type === 'season' || t.type === 'flower') ? t.type : `${t.type}_${t.value}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    const groupKeys = Object.keys(groups);
    let pairCount = Math.floor(totalSlots / 2);

    // Pick pairs dynamically
    while (pairCount > 0 && groupKeys.length > 0) {
      const randomKey = rng.choose(groupKeys);
      const group = groups[randomKey];

      if (group && group.length >= 2) {
        subset.push(group.pop()!);
        subset.push(group.pop()!);
        pairCount--;
      } else {
        // Remove key if no more pairs can be drawn
        const idx = groupKeys.indexOf(randomKey);
        if (idx > -1) groupKeys.splice(idx, 1);
      }
    }

    // Handle odd number of slots (shouldn't happen in symmetrical setups, but fallback safely)
    if (subset.length < totalSlots) {
      const oddKeys = Object.keys(groups).filter(k => groups[k].length > 0);
      if (oddKeys.length > 0) {
        subset.push(groups[oddKeys[0]].pop()!);
      }
    }

    deck = subset;
    // Shuffle subset to avoid placement bias
    rng.shuffle(deck);
  }

  // 3. Assemble the tiles into their final coordinates
  const tiles: TileState[] = config.coords.map((coord, index) => {
    const tileDef = deck[index] || { type: 'bamboo', value: 1 };
    
    // Assign a beautiful icon mapping based on type and value
    let iconIndex = tileDef.value;
    if (tileDef.type === 'season' || tileDef.type === 'flower') {
      iconIndex = tileDef.value; // 0 to 3
    }

    return {
      x: coord.x,
      y: coord.y,
      z: coord.z,
      id: `tile_${coord.x}_${coord.y}_${coord.z}`,
      type: tileDef.type,
      value: tileDef.value,
      iconIndex,
      isFree: false, // will calculate
      selected: false,
      revealed: false,
      matched: false
    };
  });

  // Calculate first round of blockages
  recalculateFreeState(tiles);

  return tiles;
}

// Recalculates the 'isFree' state for all non-matched tiles on the board
export function recalculateFreeState(tiles: TileState[]) {
  const activeTiles = tiles.filter(t => !t.matched);
  tiles.forEach(tile => {
    if (tile.matched) {
      tile.isFree = false;
    } else {
      tile.isFree = checkIfTileIsFree(tile, activeTiles);
    }
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

// Solvable Shuffle: swaps tiles that are NOT matched, checking for valid moves
export function shuffleActiveTiles(tiles: TileState[]): TileState[] {
  const unmatched = tiles.filter(t => !t.matched);
  const matched = tiles.filter(t => t.matched);
  
  if (unmatched.length === 0) return tiles;

  // Extract values and shuffle them
  const values = unmatched.map(t => ({
    type: t.type,
    value: t.value,
    iconIndex: t.iconIndex
  }));

  const rng = new SeededRandom(Math.random() * 999999);
  let attempts = 0;
  let success = false;

  // Shuffle until we find a combination with at least one possible move (or limit to 30 attempts)
  while (attempts < 30 && !success) {
    rng.shuffle(values);

    // Apply values to the unmatched positions
    unmatched.forEach((t, idx) => {
      t.type = values[idx].type;
      t.value = values[idx].value;
      t.iconIndex = values[idx].iconIndex;
      t.selected = false;
    });

    recalculateFreeState(tiles);
    const moves = findAvailableMoves(tiles);

    if (moves.length > 0) {
      success = true;
    }
    attempts++;
  }

  // Combine back
  return [...matched, ...unmatched];
}

// Generate the unique puzzle seed for any calendar date
export function getDailyChallengeSeed(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // Form a unique integer: YYYYMMDD
  return year * 10000 + month * 100 + day;
}
