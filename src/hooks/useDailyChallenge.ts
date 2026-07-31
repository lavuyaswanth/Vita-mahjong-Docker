import { useState } from 'react';
import { lsParse, lsSetJson, isFiniteNumber } from '../skyjong/storage';

// Keys use the LOCAL date to match getDailyChallengeSeed(), so the streak day
// and the daily board itself both roll over at the player's local midnight.
const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const todayKey = () => dateKey(new Date()); // YYYY-MM-DD

type DailyState = { lastCompleted: string; streak: number };

// Daily Challenge streak: one deterministic board per calendar day, with a
// streak that grows on consecutive days played.
export function useDailyChallenge() {
  // A corrupt streak matters: a string would make `d.streak + 1` concatenate
  // ("0" -> "01") and the displayed streak would go nonsensical rather than
  // just wrong.
  const load = (): DailyState => lsParse<DailyState>('skyjong_daily', v => {
    if (!v || typeof v !== 'object') return null;
    const d = v as Record<string, unknown>;
    if (typeof d.lastCompleted !== 'string') return null;
    if (!isFiniteNumber(d.streak) || d.streak < 0) return null;
    return { lastCompleted: d.lastCompleted, streak: Math.floor(d.streak) };
  }, { lastCompleted: '', streak: 0 });
  const [daily, setDaily] = useState<DailyState>(() => load());
  const dailyDoneToday = daily.lastCompleted === todayKey();

  // Record today's win; a completion yesterday extends the streak, else it resets to 1.
  const completeToday = () => {
    const today = todayKey();
    const d = load();
    if (d.lastCompleted === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const streak = d.lastCompleted === dateKey(yesterday) ? d.streak + 1 : 1;
    const next = { lastCompleted: today, streak };
    lsSetJson('skyjong_daily', next);
    setDaily(next);
  };

  return { daily, dailyDoneToday, completeToday };
}
