import { describe, it, expect } from 'vitest';
import { LAYOUT_CYCLE, layoutForLevel, levelForLayout, layouts } from './layouts';

describe('layoutForLevel', () => {
  it('cycles the five boards every 5 levels', () => {
    for (let lvl = 1; lvl <= 240; lvl++) {
      expect(layoutForLevel(lvl)).toBe(LAYOUT_CYCLE[(lvl - 1) % LAYOUT_CYCLE.length]);
    }
  });

  it('handles out-of-range levels without throwing', () => {
    expect(LAYOUT_CYCLE).toContain(layoutForLevel(0));
    expect(LAYOUT_CYCLE).toContain(layoutForLevel(-3));
    expect(LAYOUT_CYCLE).toContain(layoutForLevel(1_000_000));
  });
});

describe('levelForLayout', () => {
  // The invariant that matters: the picker must open a level actually played on
  // the chosen board, must never advance the player, and must stay >= 1.
  it('always lands on a level that uses the chosen layout', () => {
    for (let cur = 1; cur <= 240; cur++) {
      for (const layout of LAYOUT_CYCLE) {
        const lvl = levelForLayout(layout, cur);
        expect(layoutForLevel(lvl), `${layout} from ${cur} -> ${lvl}`).toBe(layout);
        expect(lvl).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('never skips the player forward once past the first cycle', () => {
    for (let cur = LAYOUT_CYCLE.length; cur <= 240; cur++) {
      for (const layout of LAYOUT_CYCLE) {
        expect(levelForLayout(layout, cur)).toBeLessThanOrEqual(cur);
      }
    }
  });

  it('rewinds rather than resetting to levels 1-5', () => {
    // The bug this replaced sent a level-87 player back to level 2.
    expect(levelForLayout('Garden', 87)).toBe(86);
    expect(levelForLayout('Pagoda', 87)).toBe(87);
    expect(levelForLayout('Pyramids', 87)).toBe(83);
    expect(levelForLayout('Butterfly', 87)).toBe(84);
    expect(levelForLayout('Turtle', 87)).toBe(85);
  });

  it('clamps up to the first level on that board in the opening cycle', () => {
    expect(levelForLayout('Garden', 1)).toBe(1);
    expect(levelForLayout('Pagoda', 1)).toBe(2);
    expect(levelForLayout('Pyramids', 1)).toBe(3);
    expect(levelForLayout('Butterfly', 1)).toBe(4);
    expect(levelForLayout('Turtle', 1)).toBe(5);
  });

  it('is stable under junk input', () => {
    expect(levelForLayout('Garden', 0)).toBeGreaterThanOrEqual(1);
    expect(levelForLayout('Garden', -10)).toBeGreaterThanOrEqual(1);
    expect(levelForLayout('Turtle', 1.7)).toBe(5);
  });

  it('round-trips: picking the current level\'s own board is a no-op', () => {
    for (let cur = 1; cur <= 240; cur++) {
      expect(levelForLayout(layoutForLevel(cur), cur)).toBe(cur);
    }
  });
});

describe('LAYOUT_CYCLE', () => {
  it('covers every defined layout exactly once', () => {
    expect([...LAYOUT_CYCLE].sort()).toEqual(Object.keys(layouts).sort());
  });
});
