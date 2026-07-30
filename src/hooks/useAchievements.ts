import { useRef, useState } from 'react';
import { achievementsList } from '../mahjong/achievements';
import { soundSynth } from '../mahjong/soundSynth';
import { lsStringArray, lsSetJson } from '../mahjong/storage';

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

  const unlockAchievement = (id: string) => {
    try {
      // lsStringArray guarantees an array of strings: a stored `{}` here would
      // make `list.includes` throw and lose the unlock.
      const list = lsStringArray('vita_achievements');
      if (list.includes(id)) return;
      lsSetJson('vita_achievements', [...list, id]);

      const badgeInfo = achievementsList.find(a => a.id === id);
      if (badgeInfo) {
        soundSynth.playAchievementUnlock();
        setAchievementToast({ name: badgeInfo.name, desc: badgeInfo.desc });
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = window.setTimeout(() => setAchievementToast(null), 5000);
      }
    } catch (e) {
      console.warn('Could not save achievement:', e);
    }
  };

  return { achievementToast, unlockAchievement };
}
