import { describe, it, expect } from 'vitest';
import { LAYOUT_CYCLE, layoutForLevel, layouts } from './layouts';

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
  it('alternates the two boards across the whole campaign', () => {
    for (let lvl = 1; lvl <= 240; lvl++) {
      expect(layoutForLevel(lvl)).toBe(LAYOUT_CYCLE[(lvl - 1) % LAYOUT_CYCLE.length]);
    }
    expect(layoutForLevel(1)).toBe('Garden');
    expect(layoutForLevel(2)).toBe('Pagoda');
    expect(layoutForLevel(3)).toBe('Garden');
  });

  it('never returns a big board', () => {
    for (let lvl = 1; lvl <= 240; lvl++) {
      expect(LAYOUT_CYCLE).toContain(layoutForLevel(lvl));
    }
  });

  it('handles out-of-range and fractional levels without throwing', () => {
    for (const lvl of [0, -3, 1.7, 1_000_000]) {
      expect(LAYOUT_CYCLE).toContain(layoutForLevel(lvl));
    }
  });
});
