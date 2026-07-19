import { useState } from 'react';

// Keys use the LOCAL date to match getDailyChallengeSeed(), so the streak day
// and the daily board itself both roll over at the player's local midnight.
export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const todayKey = () => dateKey(new Date()); // YYYY-MM-DD

type DailyState = { lastCompleted: string; streak: number };

// Daily Challenge streak: one deterministic board per calendar day, with a
// streak that grows on consecutive days played.
export function useDailyChallenge() {
  const load = (): DailyState => {
    try { return JSON.parse(localStorage.getItem('vita_daily') || '{"lastCompleted":"","streak":0}'); }
    catch { return { lastCompleted: '', streak: 0 }; }
  };
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
    try { localStorage.setItem('vita_daily', JSON.stringify(next)); } catch { /* ignore */ }
    setDaily(next);
  };

  return { daily, dailyDoneToday, completeToday };
}
