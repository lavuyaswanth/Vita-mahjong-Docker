import { useEffect, useState } from 'react';

export type PowerKey = 'shuffle' | 'magnet' | 'hint' | 'undo';
export type PowerCounts = Record<PowerKey, number>;

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
    try {
      const stored = localStorage.getItem('vita_power_counts_v2');
      return stored ? { ...defaults, ...JSON.parse(stored) } : { ...defaults };
    } catch { return { ...defaults }; }
  });

  useEffect(() => {
    if (botMode) return;
    try { localStorage.setItem('vita_power_counts_v2', JSON.stringify(powerCounts)); } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [powerCounts]);

  return { powerCounts, setPowerCounts };
}
