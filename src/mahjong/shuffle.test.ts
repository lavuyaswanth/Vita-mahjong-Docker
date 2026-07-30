import { describe, it, expect } from 'vitest';
import {
  buildBoard, shuffleActiveTiles, recalculateFreeState,
  findAvailableMoves, checkIfTileIsFree, SeededRandom
} from './gameEngine';
import type { TileState } from './gameEngine';
import { LAYOUT_CYCLE } from './layouts';
import type { LayoutName } from './layouts';

// Independent freeness oracle (the pre-index implementation).
const naiveFree = (tiles: TileState[]): boolean[] => {
  const active = tiles.filter(t => !t.matched);
  return tiles.map(t => (t.matched ? false : checkIfTileIsFree(t, active)));
};

// Partially clear a board so the shuffle runs against irregular holes.
const partiallyCleared = (layout: LayoutName, seed: number, removals: number): TileState[] => {
  const rng = new SeededRandom(seed);
  let tiles = recalculateFreeState(buildBoard(layout, seed, 0));
  for (let n = 0; n < removals; n++) {
    const free = tiles.map((t, i) => ({ t, i })).filter(x => x.t.isFree && !x.t.matched);
    if (free.length === 0) break;
    const victim = free[Math.floor(rng.next() * free.length)]!.i;
    tiles = recalculateFreeState(tiles.map((t, i) => (i === victim ? { ...t, matched: true } : t)));
  }
  return tiles;
};

describe('shuffleActiveTiles', () => {
  it('reports freeness identically to a full recompute', () => {
    // The hoisted free-state must agree with computing it from scratch on the
    // shuffled result — the whole premise is that a shuffle can't change it.
    for (const layout of LAYOUT_CYCLE as readonly LayoutName[]) {
      for (const removals of [0, 6, 30]) {
        const before = partiallyCleared(layout, 777 + removals, removals);
        const after = shuffleActiveTiles(before);
        expect(after.map(t => t.isFree), `${layout}/${removals}`).toEqual(naiveFree(after));
        // ...and it must match what the board had before the shuffle, too.
        expect(after.map(t => t.isFree)).toEqual(before.map(t => t.isFree));
      }
    }
  });

  it('preserves the face multiset and every position/matched flag', () => {
    for (const layout of LAYOUT_CYCLE as readonly LayoutName[]) {
      const before = partiallyCleared(layout, 99, 12);
      const after = shuffleActiveTiles(before);
      expect(after.length).toBe(before.length);
      expect(after.map(t => `${t.type}_${t.value}`).sort())
        .toEqual(before.map(t => `${t.type}_${t.value}`).sort());
      for (let i = 0; i < before.length; i++) {
        expect([after[i]!.x, after[i]!.y, after[i]!.z]).toEqual([before[i]!.x, before[i]!.y, before[i]!.z]);
        expect(after[i]!.matched).toBe(before[i]!.matched);
        expect(after[i]!.id).toBe(before[i]!.id);
      }
    }
  });

  it('leaves a playable board (the retry loop\'s actual goal)', () => {
    // 40 runs per layout, since the shuffle is Math.random-seeded.
    for (const layout of LAYOUT_CYCLE as readonly LayoutName[]) {
      for (let run = 0; run < 40; run++) {
        const before = partiallyCleared(layout, 1234 + run, 10);
        const after = shuffleActiveTiles(before);
        expect(findAvailableMoves(after).length, `${layout} run ${run}`).toBeGreaterThan(0);
      }
    }
  });

  it('never mutates the input array or its tiles', () => {
    const before = partiallyCleared('Turtle', 31337, 20);
    const snapshot = before.map(t => ({ ...t }));
    shuffleActiveTiles(before);
    expect(before.map(t => ({ ...t }))).toEqual(snapshot);
  });

  it('is a no-op for a fully cleared board', () => {
    const done = buildBoard('Garden', 5, 0).map(t => ({ ...t, matched: true }));
    expect(shuffleActiveTiles(done)).toBe(done);
  });

  it('handles a board with a single unmatched tile left', () => {
    const tiles = recalculateFreeState(buildBoard('Garden', 8, 0));
    const one = tiles.map((t, i) => (i === 0 ? t : { ...t, matched: true }));
    const after = shuffleActiveTiles(one);
    expect(after.filter(t => !t.matched).length).toBe(1);
    expect(after.map(t => t.isFree)).toEqual(naiveFree(after));
  });
});
