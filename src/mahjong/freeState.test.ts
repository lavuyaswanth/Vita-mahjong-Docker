import { describe, it, expect } from 'vitest';
import {
  buildBoard, recalculateFreeState, checkIfTileIsFree, SeededRandom
} from './gameEngine';
import type { TileState } from './gameEngine';
import { LAYOUT_CYCLE } from './layouts';
import type { LayoutName } from './layouts';

// The pre-index implementation, verbatim.
function naive(tiles: TileState[]): TileState[] {
  const activeTiles = tiles.filter(t => !t.matched);
  return tiles.map(tile => {
    const isFree = tile.matched ? false : checkIfTileIsFree(tile, activeTiles);
    if (isFree === tile.isFree) return tile;
    return { ...tile, isFree };
  });
}

describe('recalculateFreeState: indexed == naive', () => {
  it('agrees at every stage of a full teardown, on every layout', () => {
    for (const layout of LAYOUT_CYCLE as readonly LayoutName[]) {
      const rng = new SeededRandom(31337);
      let tiles = buildBoard(layout, 4242, 0);
      let steps = 0;
      while (tiles.some(t => !t.matched)) {
        const a = recalculateFreeState(tiles);
        const b = naive(tiles);
        expect(a.map(t => t.isFree), `${layout} step ${steps}`).toEqual(b.map(t => t.isFree));
        // Remove a couple of random still-present tiles (not necessarily a legal
        // match — we're testing geometry, and irregular holes are the harder case).
        const present = a.map((t, i) => ({ t, i })).filter(x => !x.t.matched);
        if (present.length === 0) break;
        const victims = new Set<number>();
        for (let k = 0; k < Math.min(3, present.length); k++) {
          victims.add(present[Math.floor(rng.next() * present.length)]!.i);
        }
        tiles = a.map((t, i) => (victims.has(i) ? { ...t, matched: true } : t));
        steps++;
      }
      expect(steps).toBeGreaterThan(5);
    }
  });

  it('agrees when the tile array is reordered (index is keyed by geometry+order)', () => {
    const tiles = buildBoard('Turtle', 99, 0);
    const rng = new SeededRandom(7);
    const shuffled = [...tiles];
    rng.shuffle(shuffled);
    expect(recalculateFreeState(shuffled).map(t => t.isFree))
      .toEqual(naive(shuffled).map(t => t.isFree));
    // ...and the original ordering still computes correctly afterwards, i.e. the
    // two orderings didn't collide onto one cache entry.
    expect(recalculateFreeState(tiles).map(t => t.isFree))
      .toEqual(naive(tiles).map(t => t.isFree));
  });

  it('preserves referential identity for unchanged tiles (React.memo relies on it)', () => {
    const tiles = recalculateFreeState(buildBoard('Pagoda', 5, 0));
    const again = recalculateFreeState(tiles);
    for (let i = 0; i < tiles.length; i++) expect(again[i]).toBe(tiles[i]);
  });

  it('handles an empty board and an all-matched board', () => {
    expect(recalculateFreeState([])).toEqual([]);
    const done = buildBoard('Garden', 1, 0).map(t => ({ ...t, matched: true }));
    expect(recalculateFreeState(done).every(t => !t.isFree)).toBe(true);
  });
});
