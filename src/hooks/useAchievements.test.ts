import { describe, it, expect } from 'vitest';
import { achievementsList } from '../skyjong/achievements';

// useAchievements is a React hook and there is no renderer in devDependencies,
// so its unlock/return behaviour is covered by the browser checks rather than
// re-implemented here — a test that copies the logic can drift from it and
// still pass. What IS checkable in isolation is the data the hook depends on.
describe('achievement catalogue', () => {
  // Every id App passes to unlockAchievement. unlockAchievement writes the id to
  // storage and only THEN looks the badge up, so a typo here would permanently
  // mark the achievement earned while returning null — no toast, and nothing
  // listed in the victory dialog. Silent, and unrecoverable without clearing
  // storage.
  const USED_BY_APP = [
    'zen_beginner',
    'speedy_thinker',
    'mindful_path',
    'trophy_collector',
    'combo_master'
  ];

  it('defines every achievement the game tries to unlock', () => {
    for (const id of USED_BY_APP) {
      expect(achievementsList.find(a => a.id === id), `missing badge: ${id}`).toBeDefined();
    }
  });

  it('gives every badge a name and description', () => {
    // Both are rendered into the victory dialog's aria-describedby text, so a
    // blank one becomes a dangling "Achievement unlocked: —" for a screen reader.
    for (const a of achievementsList) {
      expect(a.name?.trim(), `${a.id} name`).toBeTruthy();
      expect(a.desc?.trim(), `${a.id} desc`).toBeTruthy();
    }
  });

  it('has no duplicate ids', () => {
    const ids = achievementsList.map(a => a.id);
    expect(new Set(ids).size, JSON.stringify(ids)).toBe(ids.length);
  });

  it('has no duplicate names', () => {
    // VictoryModal lists a batch of unlocks keyed by name, so two badges
    // sharing one would collide as React keys — dropping a row that a player
    // just earned, and only when both unlock on the same victory.
    const names = achievementsList.map(a => a.name);
    expect(new Set(names).size, JSON.stringify(names)).toBe(names.length);
  });
});
