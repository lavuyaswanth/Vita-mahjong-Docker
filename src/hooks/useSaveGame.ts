import { useEffect, useRef, useState } from 'react';
import { layouts, MAX_LEVEL } from '../mahjong/layouts';
import type { LayoutName } from '../mahjong/layouts';
import { lsParse, lsRemove, lsSetJson, isFiniteNumber } from '../mahjong/storage';
import { todayKey } from './useDailyChallenge';

const SAVE_KEY = 'vita_saved_game';

export type SavedTile = {
  x: number; y: number; z: number;
  id: string; type: string; value: number;
  matched: boolean;
};

export type SavedGame = {
  level: number;
  layout: LayoutName;
  dailyMode: boolean;
  dailyRealmId: string | null;
  savedDate: string;    // dailies resume only on the same local day
  tiles: SavedTile[];
  trayIds: string[];    // order matters: Undo/Magnet pull from the end
  timer: number;
  iq: number;
  comboBonus: number;
  moveCount: number;
  hintsUsed: number;
  shufflesUsed: number;
};

// A tile is only usable if every field the board maths reads is present and
// numeric. Mobile browsers can kill the tab mid-setItem, and a truncated write
// parses fine as JSON while leaving tiles with no x/y/z — which then crashes
// recalculateFreeState on resume instead of at the write.
const isValidSavedTile = (t: unknown): t is SavedTile => {
  if (!t || typeof t !== 'object') return false;
  const c = t as Record<string, unknown>;
  return isFiniteNumber(c.x) && isFiniteNumber(c.y) && isFiniteNumber(c.z) &&
    typeof c.id === 'string' && c.id.length > 0 &&
    typeof c.type === 'string' &&
    isFiniteNumber(c.value) &&
    typeof c.matched === 'boolean';
};

// Narrowed from `unknown`, so the returned type is EARNED by these checks
// rather than asserted with a cast the compiler cannot verify.
const narrowSavedGame = (value: unknown): SavedGame | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const s = value as Record<string, unknown>;

  if (typeof s.layout !== 'string' || !(s.layout in layouts)) return null;
  if (!Array.isArray(s.tiles) || s.tiles.length === 0) return null;
  if (!s.tiles.every(isValidSavedTile)) return null;
  if (s.tiles.every(t => t.matched)) return null;
  if (!Array.isArray(s.trayIds) || !s.trayIds.every((id): id is string => typeof id === 'string')) return null;
  // Scalars feed the timer, IQ and star rating; a bad one would silently poison
  // the record for this level.
  if (!isFiniteNumber(s.timer) || !isFiniteNumber(s.iq) ||
      !isFiniteNumber(s.comboBonus) || !isFiniteNumber(s.moveCount) ||
      !isFiniteNumber(s.hintsUsed) || !isFiniteNumber(s.shufflesUsed)) return null;
  // `level` is RANGE-checked, not merely finite: every other path clamps it
  // (lsInt('vita_current_level', 1, 1, MAX_LEVEL)), so a hand-edited save was
  // the one way an out-of-range level could reach setCurrentLevel — and from
  // there "Next Level", and back into storage via lsSet. Reject rather than
  // clamp: a level outside the campaign means the save is not one we wrote.
  if (!isFiniteNumber(s.level) || s.level < 1 || s.level > MAX_LEVEL ||
      !Number.isInteger(s.level)) return null;
  if (typeof s.dailyMode !== 'boolean') return null;
  if (typeof s.savedDate !== 'string') return null;
  if (s.dailyRealmId !== null && typeof s.dailyRealmId !== 'string') return null;
  if (s.dailyMode && s.savedDate !== todayKey()) return null; // yesterday's daily board

  return {
    level: s.level,
    layout: s.layout as LayoutName,
    dailyMode: s.dailyMode,
    dailyRealmId: s.dailyRealmId,
    savedDate: s.savedDate,
    tiles: s.tiles,
    trayIds: s.trayIds,
    timer: s.timer,
    iq: s.iq,
    comboBonus: s.comboBonus,
    moveCount: s.moveCount,
    hintsUsed: s.hintsUsed,
    shufflesUsed: s.shufflesUsed
  };
};

export const loadSavedGame = (): SavedGame | null =>
  lsParse<SavedGame | null>(SAVE_KEY, narrowSavedGame, null);

/**
 * Save & resume: a mid-level game survives closing the app.
 *
 * Mobile browsers kill background tabs freely, so the board, tray, timer and
 * scoring are persisted after every move and again on backgrounding — the menu
 * then offers "Continue" instead of silently discarding the run.
 *
 * `buildSave` is read through a ref, so the lifecycle listener registers ONCE
 * instead of tearing down and re-registering every time the board changes.
 */
export function useSaveGame(buildSave: () => SavedGame | null) {
  // Drives the menu's Continue button; refreshed when returning to the menu.
  const [savedGame, setSavedGame] = useState<SavedGame | null>(() => loadSavedGame());

  const buildSaveRef = useRef(buildSave);
  useEffect(() => { buildSaveRef.current = buildSave; });

  const persistSave = () => {
    const save = buildSaveRef.current();
    if (save) lsSetJson(SAVE_KEY, save);
  };

  const clearSavedGame = () => {
    lsRemove(SAVE_KEY);
    setSavedGame(null);
  };

  /** Re-read storage so the menu's Continue button reflects the latest run. */
  const refreshSavedGame = () => setSavedGame(loadSavedGame());

  // Flush before a mobile browser suspends or kills the tab. The stopwatch
  // pauses itself inside <GameClock> and keeps its elapsed ref current on every
  // tick, so there is no ordering dependency between a timer listener and this.
  useEffect(() => {
    const flush = () => persistSave();
    const onVisibility = () => { if (document.hidden) flush(); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
    };
  }, []);

  return { savedGame, persistSave, clearSavedGame, refreshSavedGame };
}
