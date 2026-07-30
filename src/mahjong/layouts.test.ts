import { describe, it, expect } from 'vitest';
import { LAYOUT_CYCLE, layoutForLevel, layouts, MAX_LEVEL } from './layouts';

// Ages 3+ rotates only the two smallest boards, so this edition's contract is
// deliberately narrower than the Midnight edition's five-board cycle. There is
// no levelForLayout here: a board pick keeps the player's current level.
describe('LAYOUT_CYCLE (ages 3+)', () => {
  it('is the two gentle boards only', () => {
    expect([...LAYOUT_CYCLE]).toEqual(['Garden', 'Pagoda']);
  });

  it('names layouts that actually exist', () => {
    for (const name of LAYOUT_CYCLE) expect(layouts[name]).toBeDefined();
  });

  it('keeps the campaign on the two SMALLEST boards', () => {
    // The whole point of the edition: never a big deep pile.
    const sizes = Object.values(layouts).map(l => l.coords.length).sort((a, b) => a - b);
    const cycleSizes = LAYOUT_CYCLE.map(n => layouts[n].coords.length).sort((a, b) => a - b);
    expect(cycleSizes).toEqual(sizes.slice(0, LAYOUT_CYCLE.length));
  });
});

describe('layoutForLevel', () => {
  // A table, not `LAYOUT_CYCLE[(lvl - 1) % LAYOUT_CYCLE.length]` — restating the
  // implementation passes just as happily when both sides are wrong the same
  // way, which is precisely the bug this guards (the settings dropdown kept its
  // own copy of the cycle and mislabelled every level from 3 up).
  it.each([
    [1, 'Garden'], [2, 'Pagoda'], [3, 'Garden'], [4, 'Pagoda'],
    [5, 'Garden'], [6, 'Pagoda'], [7, 'Garden'], [8, 'Pagoda'],
    [99, 'Garden'], [100, 'Pagoda'], [239, 'Garden'], [240, 'Pagoda']
  ])('level %i is played on %s', (level, expected) => {
    expect(layoutForLevel(level)).toBe(expected);
  });

  it('alternates without ever repeating twice in a row', () => {
    for (let lvl = 2; lvl <= MAX_LEVEL; lvl++) {
      expect(layoutForLevel(lvl), `level ${lvl}`).not.toBe(layoutForLevel(lvl - 1));
    }
  });

  it('never returns a big board', () => {
    for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
      expect(LAYOUT_CYCLE).toContain(layoutForLevel(lvl));
    }
  });

  it('handles out-of-range and fractional levels without throwing', () => {
    for (const lvl of [0, -3, 1.7, 1_000_000]) {
      expect(LAYOUT_CYCLE).toContain(layoutForLevel(lvl));
    }
  });
});
