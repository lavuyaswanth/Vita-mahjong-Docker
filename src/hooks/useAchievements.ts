import { useRef, useState } from 'react';
import { achievementsList } from '../skyjong/achievements';
import { soundSynth } from '../skyjong/soundSynth';
import { lsStringArray, lsSetJson } from '../skyjong/storage';

interface AchievementToast {
  name: string;
  desc: string;
}

// Achievement unlocking + the floating toast. Unlocks persist to localStorage;
// the toast dismiss timer restarts per unlock so a rapid follow-up (several
// can land on one victory) gets its full display time.
export function useAchievements() {
  const [achievementToast, setAchievementToast] = useState<AchievementToast | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  /**
   * Returns the badge if this call is what unlocked it, or null if it was
   * already earned (or unknown).
   *
   * Callers need the return value because several achievements can land on a
   * single victory, and the toast only ever shows the LAST one — so anything
   * that wants to report the full set has to collect it here. See
   * triggerVictory, which surfaces them inside the victory dialog.
   */
  const unlockAchievement = (id: string): AchievementToast | null => {
    try {
      // lsStringArray guarantees an array of strings: a stored `{}` here would
      // make `list.includes` throw and lose the unlock.
      const list = lsStringArray('skyjong_achievements');
      if (list.includes(id)) return null;
      lsSetJson('skyjong_achievements', [...list, id]);

      const badgeInfo = achievementsList.find(a => a.id === id);
      if (!badgeInfo) return null;

      soundSynth.playAchievementUnlock();
      const badge = { name: badgeInfo.name, desc: badgeInfo.desc };
      setAchievementToast(badge);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = window.setTimeout(() => setAchievementToast(null), 5000);
      return badge;
    } catch (e) {
      console.warn('Could not save achievement:', e);
      return null;
    }
  };

  return { achievementToast, unlockAchievement };
}
