import { useEffect, useRef, useState } from 'react';
import { lsNumberMap, lsSetJson } from '../mahjong/storage';

export type PowerKey = 'shuffle' | 'magnet' | 'hint' | 'undo';
type PowerCounts = Record<PowerKey, number>;

export const POWER_LABELS: Record<PowerKey, string> = {
  shuffle: 'Shuffle',
  magnet: 'Magnet',
  hint: 'Hint',
  undo: 'Undo'
};

// Booster economy: four powers with numbered counts that persist across
// sessions. Winning levels restocks them via the level reward. The QA bot
// gets a deep stock so it can always finish a board, and never pollutes
// real saves.
export function useBoosters(botMode: boolean) {
  const defaults: PowerCounts = botMode
    ? { shuffle: 999, magnet: 999, hint: 999, undo: 999 }
    : { shuffle: 5, magnet: 3, hint: 5, undo: 5 };

  const [powerCounts, setPowerCounts] = useState<PowerCounts>(() => {
    if (botMode) return { ...defaults };
    // Merge per KEY, not by spreading the parsed object: spreading would let a
    // corrupt entry (a string, or an unknown key) through, and `p.hint - 1` on a
    // non-number yields NaN — which reads as "no boosters left" forever.
    const stored = lsNumberMap('vita_power_counts_v2');
    const counts = { ...defaults };
    for (const key of Object.keys(defaults) as PowerKey[]) {
      const v = stored[key];
      if (v !== undefined && v >= 0) counts[key] = Math.floor(v);
    }
    return counts;
  });

  // Persist on change only. The first run would write back the counts just READ
  // from storage — a no-op that clobbers anything landing between state init and
  // this effect flushing (a second tab, or a restore), for no benefit.
  const hydrated = useRef(false);
  useEffect(() => {
    if (botMode) return;
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    lsSetJson('vita_power_counts_v2', powerCounts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [powerCounts]);

  return { powerCounts, setPowerCounts };
}
