import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  buildBoard,
  recalculateFreeState,
  findAvailableMoves,
  shuffleActiveTiles,
  tilesMatch,
  getDailyChallengeSeed
} from './mahjong/gameEngine';
import type { TileState } from './mahjong/gameEngine';
import { layouts } from './mahjong/layouts';
import type { LayoutName } from './mahjong/layouts';
import { soundSynth } from './mahjong/soundSynth';
import { haptics } from './mahjong/haptics';
import { useAchievements } from './hooks/useAchievements';
import { useBoosters, POWER_LABELS } from './hooks/useBoosters';
import type { PowerKey } from './hooks/useBoosters';
import { useDailyChallenge, todayKey } from './hooks/useDailyChallenge';
import { realmForLevel, nextRealmChange, realms } from './mahjong/realms';
import type { RealmId } from './mahjong/realms';
import MahjongBoard from './components/MahjongBoard';
import { TileGlyph } from './components/Tile';
import MainMenu from './components/MainMenu';
import SettingsModal from './components/SettingsModal';
import './App.css';
import {
  BackIcon,
  UndoIcon,
  HintIcon,
  ShuffleIcon,
  MagnetIcon,
  RestartIcon,
  EarnedStampIcon,
  SettingsIcon,
  PlayIcon
} from './components/SvgIcons';


// Holder tray capacity — collect tiles here; fill it with no match and you lose
const TRAY_CAPACITY = 4;

// Star rating thresholds
const computeStarRating = (time: number, hintsUsed: number, shufflesUsed: number, tileCount: number): number => {
  const timeThreshold3 = Math.max(60, tileCount * 1.5); // e.g. 144 tiles = 216s for 3 stars
  const timeThreshold2 = timeThreshold3 * 2;
  if (hintsUsed === 0 && shufflesUsed === 0 && time <= timeThreshold3) return 3;
  if (hintsUsed <= 1 && shufflesUsed <= 1 && time <= timeThreshold2) return 2;
  return 1;
};

// Bump this whenever the build changes so it's easy to confirm the deploy updated
const APP_VERSION = 'v0.1.0-legends';

export const App: React.FC = () => {
  // Auto-play bot flag (?bot=1) — drives the game itself for QA / simulator demos.
  // Optional ?level=N deep-link jumps straight into that campaign level (QA spec
  // references "Launch Level 5 (Golden Turtle)" etc.).
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const botMode = urlParams.has('bot');
  const dailyParam = urlParams.has('daily'); // ?daily=1 deep-links the Daily Challenge
  const levelParam = (() => {
    const raw = urlParams.get('level');
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n >= 1 && n <= 240 ? n : null;
  })();
  const autoStart = botMode || levelParam !== null || dailyParam;

  // Navigation State. There is one play screen (the holder tray); `isPlaying`
  // toggles between the menu and that board.
  const [isPlaying, setIsPlaying] = useState<boolean>(autoStart);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Layout and Tiles State (default = portrait, large-tile Garden for seniors)
  const [activeLayout, setActiveLayout] = useState<LayoutName>('Garden');
  const [tiles, setTiles] = useState<TileState[]>([]);

  // Holder tray (tray mode): tapped tiles land here; matching pairs auto-clear
  const [tray, setTray] = useState<TileState[]>([]);
  const [showGameOver, setShowGameOver] = useState(false);

  // First-run tutorial (shown once, then remembered). Skipped for QA deep-links
  // and the auto-play bot so the board is visible immediately.
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    if (autoStart) return false;
    try { return localStorage.getItem('vita_tutorial_seen') !== 'true'; } catch { return true; }
  });
  const dismissTutorial = () => {
    soundSynth.playClick();
    setShowTutorial(false);
    try { localStorage.setItem('vita_tutorial_seen', 'true'); } catch { /* ignore */ }
  };

  // Game Helpers
  const [hintedPair, setHintedPair] = useState<[string, string] | null>(null);
  const [possibleMovesCount, setPossibleMovesCount] = useState<number>(0);
  const [showWinScreen, setShowWinScreen] = useState(false);

  // Redesign Active States
  const [score, setScore] = useState(100); // IQ starts at an average 100

  // Combo Streak System (#1)
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [comboPopup, setComboPopup] = useState<{ text: string; key: number; mult: number } | null>(null);
  const [shaking, setShaking] = useState(false); // board shake on big combos
  const lastMatchTimeRef = useRef<number>(0);
  const comboBonusRef = useRef<number>(0); // accumulated combo IQ bonus this game
  const scoreRef = useRef<number>(100);    // live IQ (triggerVictory reads this, not stale state)
  const comboPopupTimeoutRef = useRef<number | null>(null);
  const shakeTimeoutRef = useRef<number | null>(null);
  const hintTimeoutRef = useRef<number | null>(null);

  // Move Counter (#23)
  const [moveCount, setMoveCount] = useState(0);

  // Star Rating (#2)
  const [earnedStars, setEarnedStars] = useState(0);

  // Per-level best records (IQ / time / stars) — the reason to replay a board.
  type LevelRecord = { iq: number; time: number; stars: number };
  const loadRecords = (): Record<string, LevelRecord> => {
    try { return JSON.parse(localStorage.getItem('vita_records') || '{}'); } catch { return {}; }
  };
  const [bestRecord, setBestRecord] = useState<LevelRecord | null>(null); // for the active level
  const [isNewBest, setIsNewBest] = useState(false);

  // Daily Challenge state lives in its hook; these two are play-session state.
  const [dailyMode, setDailyMode] = useState(false);
  const [dailyRealmId, setDailyRealmId] = useState<string | null>(null);
  const { daily, dailyDoneToday, completeToday } = useDailyChallenge();
  const hintsUsedRef = useRef(0);
  const shufflesUsedRef = useRef(0);

  // Booster economy (Shuffle, Magnet, Hint, Undo) — see useBoosters.
  const { powerCounts, setPowerCounts } = useBoosters(botMode);

  // End-of-level reward: clearing a level grants a random power-up to carry
  // into the next level.
  const [levelReward, setLevelReward] = useState<{ power: PowerKey; amount: number } | null>(null);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const claimReward = () => {
    if (!levelReward || rewardClaimed) return;
    setPowerCounts(p => ({ ...p, [levelReward.power]: p[levelReward.power] + levelReward.amount }));
    setRewardClaimed(true);
    soundSynth.playAchievementUnlock();
  };

  // 240 Levels Progression (R4)
  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    if (levelParam !== null) return levelParam;
    try {
      const stored = localStorage.getItem('vita_current_level');
      return stored ? parseInt(stored) : 1;
    } catch { return 1; }
  });
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('vita_max_unlocked_level');
      return stored ? parseInt(stored) : 1;
    } catch { return 1; }
  });

  // Derived unlocked levels (1 to 5) for settings board options
  const unlockedLevels = Array.from({ length: Math.min(5, maxUnlockedLevel) }).map((_, i) => i + 1);

  // Achievement unlocking + toast — see useAchievements.
  const { achievementToast, unlockAchievement } = useAchievements();

  // Total tile count for progress bar (#17)
  const [totalTileCount, setTotalTileCount] = useState(0);

  // Settings preferences (synced to LocalStorage). The visual theme is driven by
  // the campaign realm (see realms.ts), so there is no manual theme setting.
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('vita_high_contrast') === 'true';
  });
  const [sfxVolume, setSfxVolume] = useState<number>(() => {
    const val = localStorage.getItem('vita_sfx_vol');
    return val !== null ? parseFloat(val) : 0.5;
  });
  const [ambientVolume, setAmbientVolume] = useState<number>(() => {
    const val = localStorage.getItem('vita_ambient_vol');
    return val !== null ? parseFloat(val) : 0.3;
  });
  const [isAmbientEnabled, setIsAmbientEnabled] = useState<boolean>(() => {
    return localStorage.getItem('vita_ambient_enabled') === 'true';
  });

  // Stopwatch state
  const [timer, setTimer] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // Sync settings to localstorage
  useEffect(() => {
    localStorage.setItem('vita_high_contrast', String(highContrast));
    localStorage.setItem('vita_sfx_vol', String(sfxVolume));
    localStorage.setItem('vita_ambient_vol', String(ambientVolume));
    localStorage.setItem('vita_ambient_enabled', String(isAmbientEnabled));
    soundSynth.configure(true, sfxVolume, ambientVolume);
  }, [highContrast, sfxVolume, ambientVolume, isAmbientEnabled]);

  // Start stopwatch timer (from 0, or from a resumed save's elapsed time)
  const startTimer = (initialSeconds = 0) => {
    stopTimer();
    setTimer(initialSeconds);
    timerRef.current = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Stop the stopwatch when the app unmounts
  useEffect(() => stopTimer, []);

  // Pause the stopwatch while the app is hidden — background time shouldn't
  // count against star ratings or best times (phone calls, app switches).
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        stopTimer();
      } else if (isPlaying && !showWinScreen && !showGameOver && timerRef.current === null) {
        // Resume counting from the preserved elapsed value
        timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [isPlaying, showWinScreen, showGameOver]);

  // ---- Save & resume: a mid-level game survives closing the app ----
  // Mobile browsers kill background tabs freely, so the board, tray, timer and
  // scoring are persisted after every move (and on backgrounding). The menu
  // then offers "Continue" instead of silently discarding the run.
  const SAVE_KEY = 'vita_saved_game';
  type SavedTile = { x: number; y: number; z: number; id: string; type: string; value: number; matched: boolean };
  type SavedGame = {
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
  const loadSavedGame = (): SavedGame | null => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as SavedGame;
      if (!s || !Array.isArray(s.tiles) || s.tiles.length === 0 || !layouts[s.layout]) return null;
      if (!Array.isArray(s.trayIds) || s.tiles.every(t => t.matched)) return null;
      if (s.dailyMode && s.savedDate !== todayKey()) return null; // yesterday's daily board
      return s;
    } catch { return null; }
  };
  const clearSavedGame = () => { try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ } };
  // Drives the menu's Continue button; refreshed when returning to the menu.
  const [savedGame, setSavedGame] = useState<SavedGame | null>(() => loadSavedGame());

  // Mirror the live timer into a ref so saving doesn't re-run every second.
  const timerValRef = useRef(0);
  useEffect(() => { timerValRef.current = timer; }, [timer]);

  const buildSave = (): SavedGame | null => {
    if (!isPlaying || botMode || showWinScreen || tiles.length === 0) return null;
    if (tiles.every(t => t.matched)) return null;
    return {
      level: currentLevel,
      layout: activeLayout,
      dailyMode,
      dailyRealmId,
      savedDate: todayKey(),
      tiles: tiles.map(({ x, y, z, id, type, value, matched }) => ({ x, y, z, id, type, value, matched })),
      trayIds: tray.map(t => t.id),
      timer: timerValRef.current,
      iq: scoreRef.current,
      comboBonus: comboBonusRef.current,
      moveCount,
      hintsUsed: hintsUsedRef.current,
      shufflesUsed: shufflesUsedRef.current
    };
  };

  // Persist after every board/tray change, plus on backgrounding (captures the
  // latest timer right before a mobile browser suspends or kills the tab).
  useEffect(() => {
    const persist = () => {
      const save = buildSave();
      if (save) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* ignore */ } }
    };
    persist();
    document.addEventListener('visibilitychange', persist);
    window.addEventListener('pagehide', persist);
    return () => {
      document.removeEventListener('visibilitychange', persist);
      window.removeEventListener('pagehide', persist);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, tray, isPlaying, showWinScreen]);

  // Rebuild full game state from a save and jump straight into play.
  const resumeGame = (save: SavedGame) => {
    const board = recalculateFreeState(save.tiles.map(t => ({ ...t, isFree: false })));
    const byId = new Map(board.map(t => [t.id, t]));
    const trayTiles = save.trayIds
      .map(id => byId.get(id))
      .filter((t): t is TileState => t !== undefined);

    setIsPlaying(true);
    setCurrentLevel(save.level);
    setActiveLayout(save.layout);
    setDailyMode(save.dailyMode);
    setDailyRealmId(save.dailyRealmId);
    setShowWinScreen(false);
    // A full tray always means game over (a match would have auto-cleared)
    setShowGameOver(trayTiles.length >= TRAY_CAPACITY);
    setLevelReward(null);
    setRewardClaimed(false);
    setTiles(board);
    setTray(trayTiles);
    setHintedPair(null);
    setScore(save.iq);
    scoreRef.current = save.iq;
    comboBonusRef.current = save.comboBonus;
    setComboMultiplier(1);
    setComboPopup(null);
    setMoveCount(save.moveCount);
    setEarnedStars(0);
    setIsNewBest(false);
    setBestRecord(save.dailyMode ? null : (loadRecords()[save.level] ?? null));
    lastMatchTimeRef.current = 0;
    hintsUsedRef.current = save.hintsUsed;
    shufflesUsedRef.current = save.shufflesUsed;
    setTotalTileCount(save.tiles.length);
    startTimer(save.timer);
    setPossibleMovesCount(findAvailableMoves(board).length);
  };

  // Set up board state when starting or restarting. `daily=true` builds today's
  // shared Daily Challenge board instead of a campaign level.
  const layoutsList: LayoutName[] = ['Garden', 'Pagoda', 'Pyramids', 'Butterfly', 'Turtle'];
  const initGame = (target: number | LayoutName, daily = false) => {
    let levelNum: number;
    let layout: LayoutName;
    let seed: number;
    let maxTypes: number;

    if (daily) {
      const dseed = getDailyChallengeSeed(new Date());
      layout = layoutsList[dseed % layoutsList.length];
      levelNum = currentLevel;            // campaign progress untouched
      seed = dseed;
      maxTypes = 0;                        // daily uses full variety (a fair test)
      const dRealm = realmForLevel(dseed); // a themed realm for the day
      setDailyMode(true);
      setDailyRealmId(dRealm.id);
    } else {
      setDailyMode(false);
      setDailyRealmId(null);
      if (typeof target === 'number') {
        levelNum = target;
        layout = layoutsList[(levelNum - 1) % layoutsList.length];
      } else {
        // Picking a board by name: layouts cycle every 5 levels, so walk BACK to
        // the most recent level that uses this layout. Going back keeps the
        // campaign difficulty you've earned and can't be used to skip ahead;
        // mapping to a fixed level 1–5 instead would knock a level-87 player
        // down to level 2 and persist it, wiping their progress.
        layout = target;
        const cycle = layoutsList.length;
        // Levels using this layout are those ≡ offset+1 (mod cycle).
        const offset = layoutsList.indexOf(layout);
        const stepsBack = (((currentLevel - 1 - offset) % cycle) + cycle) % cycle;
        levelNum = currentLevel - stepsBack;
        if (levelNum < 1) levelNum += cycle; // below level 1: take the first one instead
      }
      seed = levelNum * 12345 + 42;
      // Difficulty ramp: few distinct tile faces early, full variety by ~level 30.
      maxTypes = levelNum >= 30 ? 0 : 10 + levelNum;
    }

    setIsPlaying(true);
    setCurrentLevel(levelNum);
    setActiveLayout(layout);

    // Save level state (campaign only)
    if (!daily) {
      try {
        localStorage.setItem('vita_current_level', String(levelNum));
      } catch (e) {
        console.warn("Could not save current level:", e);
      }
    }

    setShowWinScreen(false);
    setShowGameOver(false);
    setLevelReward(null);
    setRewardClaimed(false);
    setTray([]);
    setHintedPair(null);
    setScore(100);
    comboBonusRef.current = 0;
    scoreRef.current = 100;
    setComboMultiplier(1);
    setComboPopup(null);
    setMoveCount(0);
    setEarnedStars(0);
    setIsNewBest(false);
    setBestRecord(daily ? null : (loadRecords()[levelNum] ?? null));
    lastMatchTimeRef.current = 0;
    hintsUsedRef.current = 0;
    shufflesUsedRef.current = 0;

    const newTiles = buildBoard(layout, seed, maxTypes);
    setTotalTileCount(newTiles.length);

    setTiles(newTiles);
    startTimer();

    // Check possible moves
    const moves = findAvailableMoves(newTiles);
    setPossibleMovesCount(moves.length);
  };

  // Auto-start a board if we entered a play mode with no tiles (e.g. ?bot=1)
  useEffect(() => {
    if (isPlaying && tiles.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      initGame(currentLevel, dailyParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // Handle ambient audio on initial mount / page actions
  useEffect(() => {
    if (isAmbientEnabled && isPlaying) {
      soundSynth.startAmbient();
    } else {
      soundSynth.stopAmbient();
    }
    return () => soundSynth.stopAmbient();
  }, [isAmbientEnabled, isPlaying]);

  // Emits global custom event to trigger canvas sparkles. Carries tile ids so
  // the board can burst particles at the tiles' actual on-screen positions
  // (which depend on zoom/pan/orientation, not just grid coordinates).
  const triggerSparkMatchEvent = (t1: TileState, t2: TileState, mult = 1) => {
    const event = new CustomEvent('tile-match', {
      detail: { id1: t1.id, id2: t2.id, mult }
    });
    window.dispatchEvent(event);
  };

  // Shared scoring for a cleared pair. Score is modelled as an IQ that starts at
  // an average 100. Simply clearing the board earns up to +CLEAR_IQ (≈160 total);
  // the remaining points up to the genius ceiling of 200 come from fast combo
  // streaks. So a careful clear ≈160, a fast combo-heavy run approaches 200 —
  // the final IQ reflects skill, giving players a score worth beating on replay.
  const IQ_BASE = 100;
  const IQ_MAX = 200;
  const CLEAR_IQ = 60;
  const scoreMatch = (t1: TileState, t2: TileState) => {
    const now = Date.now();
    const elapsed = now - lastMatchTimeRef.current;
    let newMultiplier = 1;
    if (lastMatchTimeRef.current > 0 && elapsed < 3000) {
      newMultiplier = Math.min(comboMultiplier + 1, 10);
    }
    lastMatchTimeRef.current = now;
    setComboMultiplier(newMultiplier);
    if (newMultiplier >= 5) unlockAchievement('combo_master');

    const matchedPairs = moveCount + 1;            // this pair included
    const totalPairs = Math.max(1, totalTileCount / 2);
    comboBonusRef.current += Math.max(0, newMultiplier - 1); // persistent combo reward
    const prevScore = scoreRef.current;
    const progressIQ = IQ_BASE + Math.round(CLEAR_IQ * (matchedPairs / totalPairs));
    const newScore = Math.min(IQ_MAX, progressIQ + comboBonusRef.current);
    scoreRef.current = newScore;
    const gain = newScore - prevScore;

    setMoveCount(matchedPairs);
    setScore(newScore);

    // Floating popup only for combo streaks (single matches read via the spark
    // burst + the live header IQ). Set OUTSIDE the score updater so a final
    // match that triggers victory can have its popup cleared by triggerVictory.
    // At the IQ cap the gain is 0, so just show the streak (avoids "+0 IQ").
    if (newMultiplier > 1) {
      setComboPopup({
        text: gain > 0 ? `+${gain} IQ · x${newMultiplier}` : `x${newMultiplier} 🔥`,
        key: now,
        mult: newMultiplier
      });
      if (comboPopupTimeoutRef.current) clearTimeout(comboPopupTimeoutRef.current);
      comboPopupTimeoutRef.current = window.setTimeout(() => setComboPopup(null), 1200);
    }

    // Combo crunch: at x5+ the board shakes and the burst gets bigger.
    // (Skipped for players who prefer reduced motion.)
    if (newMultiplier >= 5 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShaking(true);
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = window.setTimeout(() => setShaking(false), 500);
    }

    if (newMultiplier > 1) {
      soundSynth.playComboChime(newMultiplier);
      haptics.combo(newMultiplier);
    } else {
      soundSynth.playMatch();
      haptics.match();
    }
    triggerSparkMatchEvent(t1, t2, newMultiplier);
  };

  // Victory! Compute stars, persist progress, unlock achievements, show win screen.
  const triggerVictory = () => {
    {
      stopTimer();
      // Clear any lingering combo popup/streak so it doesn't float over the modal
      if (comboPopupTimeoutRef.current) clearTimeout(comboPopupTimeoutRef.current);
      setComboPopup(null);
      setComboMultiplier(1);
      soundSynth.playVictory();
      haptics.win();
      // The run is complete — nothing left to resume.
      clearSavedGame();
      setSavedGame(null);
      const finalIQ = scoreRef.current;
      // Extra flourish for a genius-level finish
      if (finalIQ >= 180) setTimeout(() => soundSynth.playAchievementUnlock(), 250);

      // Star Rating computation (#2)
      const stars = computeStarRating(
        timer,
        hintsUsedRef.current,
        shufflesUsedRef.current,
        totalTileCount
      );
      setEarnedStars(stars);

      // ---- Daily Challenge: update the streak, don't touch campaign progress ----
      if (dailyMode) {
        completeToday();
        setBestRecord(null);
        setIsNewBest(false);
      } else {
      // Save best stars per layout (#2)
      try {
        const stored = localStorage.getItem('vita_best_stars');
        const bestStars: Record<string, number> = stored ? JSON.parse(stored) : {};
        const currentBest = bestStars[activeLayout] || 0;
        if (stars > currentBest) {
          bestStars[activeLayout] = stars;
          localStorage.setItem('vita_best_stars', JSON.stringify(bestStars));
        }
      } catch (e) {
        console.warn("Could not save star rating:", e);
      }

      // Per-level best record (IQ ↑, time ↓, stars ↑). Drives the "beat your
      // best" replay loop. `score` here is the final IQ for this run.
      const prevBest = loadRecords()[currentLevel] ?? null;
      const beat = !prevBest || finalIQ > prevBest.iq || stars > prevBest.stars ||
        (finalIQ === prevBest.iq && timer < prevBest.time);
      const merged: LevelRecord = {
        iq: Math.max(finalIQ, prevBest?.iq ?? 0),
        stars: Math.max(stars, prevBest?.stars ?? 0),
        time: prevBest ? Math.min(timer, prevBest.time) : timer
      };
      try {
        const recs = loadRecords();
        recs[currentLevel] = merged;
        localStorage.setItem('vita_records', JSON.stringify(recs));
      } catch { /* ignore */ }
      setBestRecord(merged);
      setIsNewBest(beat);

      // Progressive Level Unlock (Up to 240 Levels, R4)
      const nextLevel = currentLevel + 1;
      if (nextLevel <= 240 && nextLevel > maxUnlockedLevel) {
        setMaxUnlockedLevel(nextLevel);
        try {
          localStorage.setItem('vita_max_unlocked_level', String(nextLevel));
        } catch (e) {
          console.warn("Could not save max unlocked level:", e);
        }
      }
      }

      // Roll a random power-up reward to carry into the next level.
      const rewardPools: { power: PowerKey; min: number; max: number }[] = [
        { power: 'shuffle', min: 2, max: 5 },
        { power: 'magnet', min: 1, max: 2 },
        { power: 'hint', min: 2, max: 5 },
        { power: 'undo', min: 2, max: 5 }
      ];
      const pick = rewardPools[Math.floor(Math.random() * rewardPools.length)];
      // Star-gated bonus: better play (more stars) yields a bigger booster reward.
      const baseAmount = pick.min + Math.floor(Math.random() * (pick.max - pick.min + 1));
      const amount = baseAmount * stars;
      setLevelReward({ power: pick.power, amount });
      setRewardClaimed(false);

      setShowWinScreen(true);

      // --- Zen Achievements Validation ---
      unlockAchievement('zen_beginner');

      if (timer <= 180) {
        unlockAchievement('speedy_thinker');
      }

      if (hintsUsedRef.current === 0 && shufflesUsedRef.current === 0) {
        unlockAchievement('mindful_path');
      }

      try {
        const stored = localStorage.getItem('vita_best_stars');
        const bestStars = stored ? JSON.parse(stored) : {};
        const solvedLayouts = Object.keys(bestStars).filter(layout => bestStars[layout] > 0);
        if (!solvedLayouts.includes(activeLayout)) {
          solvedLayouts.push(activeLayout);
        }
        if (solvedLayouts.length >= 5) {
          unlockAchievement('trophy_collector');
        }
      } catch (e) {
        console.warn("Could not check layout collector achievement:", e);
      }
    }
  };

  // Shuffles the remaining board tiles into new positions (consumes a Shuffle)
  const handleShuffle = () => {
    if (powerCounts.shuffle <= 0) { soundSynth.playClick(); return; }
    soundSynth.playShuffle();
    const shuffled = shuffleActiveTiles([...tiles]);
    setTiles(shuffled);
    setHintedPair(null);
    shufflesUsedRef.current += 1;
    setPowerCounts(p => ({ ...p, shuffle: p.shuffle - 1 }));
    setComboMultiplier(1);
    lastMatchTimeRef.current = 0;
    setPossibleMovesCount(findAvailableMoves(shuffled).length);
  };

  // Magnet power: pull the last few collected tiles out of the tray and back
  // onto the board — a strong recovery when the tray is getting crowded.
  const handleMagnet = () => {
    if (powerCounts.magnet <= 0 || tray.length === 0) { soundSynth.playClick(); return; }
    soundSynth.playShuffle();
    const count = Math.min(3, tray.length);
    const returning = tray.slice(tray.length - count);
    const returningIds = new Set(returning.map(t => t.id));
    const restored = recalculateFreeState(
      tiles.map(t => returningIds.has(t.id) ? { ...t, matched: false } : t)
    );
    setTiles(restored);
    setTray(prev => prev.slice(0, prev.length - count));
    setHintedPair(null);
    setShowGameOver(false);
    setPowerCounts(p => ({ ...p, magnet: p.magnet - 1 }));
    setComboMultiplier(1);
    lastMatchTimeRef.current = 0;
    setPossibleMovesCount(findAvailableMoves(restored).length);
  };

  // Handle tapping a board tile (routes to the active mode)
  const handleTileClick = (clicked: TileState) => {
    if (showWinScreen || showGameOver) return;

    // Blocked tiles can't be taken — wobble feedback (both modes)
    if (!clicked.isFree) {
      soundSynth.playClick();
      haptics.blocked();
      setTiles(prev => prev.map(t => t.id === clicked.id ? { ...t, wobbling: true } : t));
      setTimeout(() => {
        setTiles(prev => prev.map(t => t.id === clicked.id ? { ...t, wobbling: false } : t));
      }, 400);
      return;
    }



    // ===== TRAY (Rush): collect into the holder, matching pairs auto-clear =====
    if (tray.length >= TRAY_CAPACITY) {
      soundSynth.playClick();
      return;
    }
    const updatedBoard = recalculateFreeState(
      tiles.map(t => t.id === clicked.id ? { ...t, matched: true } : t)
    );
    setTiles(updatedBoard);
    setHintedPair(null);
    setPossibleMovesCount(findAvailableMoves(updatedBoard).length);

    const matchIdx = tray.findIndex(t => tilesMatch(t, clicked));
    if (matchIdx >= 0) {
      const partner = tray[matchIdx];
      const newTray = tray.filter((_, i) => i !== matchIdx);
      setTray(newTray);
      scoreMatch(clicked, partner);
      if (updatedBoard.every(t => t.matched) && newTray.length === 0) {
        triggerVictory();
      }
    } else {
      const newTray = [...tray, clicked];
      setTray(newTray);
      soundSynth.playSelect();
      // NOTE: don't reset the combo here. In tray mode you nearly always park a
      // tile before matching its partner, so resetting on collect made combos
      // almost impossible. The streak is driven purely by match-to-match timing
      // (the 3s window in scoreMatch), so it lapses on its own if you slow down.
      if (newTray.length >= TRAY_CAPACITY) {
        soundSynth.playClick();
        haptics.lose();
        stopTimer();
        if (comboPopupTimeoutRef.current) clearTimeout(comboPopupTimeoutRef.current);
        setComboPopup(null);
        setShowGameOver(true);
      }
    }
  };

  // Stable wrapper so memoized tiles never receive a new onClick prop, while
  // always invoking the latest handler (avoids stale-closure bugs).
  const handleTileClickRef = useRef(handleTileClick);
  useEffect(() => {
    handleTileClickRef.current = handleTileClick;
  });
  const stableTileClick = useCallback((t: TileState) => handleTileClickRef.current(t), []);

  // --- AUTO-PLAY BOT (debug/QA) ---
  // Enable with ?bot=1. Paced by a tick; one tap per tick using fresh state.
  // Tray loop: tap a free tile matching one already in the tray (instant clear),
  // else park a free tile whose partner is also free (cleared next tick).
  // Useful for solvability testing and for demoing on the simulator.
  const [botTick, setBotTick] = useState(0);
  useEffect(() => {
    if (!botMode) return;
    const iv = window.setInterval(() => setBotTick(t => t + 1), 550);
    return () => clearInterval(iv);
  }, [botMode]);
  useEffect(() => {
    if (!botMode || !isPlaying || showWinScreen || showGameOver) return;
    const active = tiles.filter(t => !t.matched);
    if (active.length === 0) return;
    const freeTiles = active.filter(t => t.isFree);

    // Wrap the bot action in a setTimeout to avoid synchronous setState inside useEffect lint error
    const timerId = setTimeout(() => {
      // Tray mode (the single unified game mode)
      const clearer = freeTiles.find(ft => tray.some(tt => tilesMatch(tt, ft)));
      if (clearer) { handleTileClick(clearer); return; }
      const moves = findAvailableMoves(active);
      if (moves.length > 0) { handleTileClick(moves[0][0]); return; }
      // Dig: with only one free tile there can never be a board-to-board pair,
      // so a human parks it to uncover what's underneath. Without this the bot
      // shuffles forever (shuffleActiveTiles can't create a pair from one free
      // tile either). Keep two slots spare so digging can't lose the run.
      if (freeTiles.length > 0 && tray.length < TRAY_CAPACITY - 2) {
        handleTileClick(freeTiles[0]);
        return;
      }
      handleShuffle();
    }, 0);

    return () => clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botTick]);




  // Undo power: return the most recently collected tile to the board (consumes an Undo)
  const handleUndo = () => {
    if (tray.length === 0 || powerCounts.undo <= 0) { soundSynth.playClick(); return; }
    soundSynth.playShuffle();
    const returning = tray[tray.length - 1];
    const restored = recalculateFreeState(
      tiles.map(t => t.id === returning.id ? { ...t, matched: false } : t)
    );
    setTiles(restored);
    setTray(prev => prev.slice(0, -1));
    setHintedPair(null);
    setShowGameOver(false);
    setPowerCounts(p => ({ ...p, undo: p.undo - 1 }));
    setComboMultiplier(1);
    lastMatchTimeRef.current = 0;
    setPossibleMovesCount(findAvailableMoves(restored).length);
  };

  // Hint power: highlight a safe tile — one that matches a tray tile (instant clear),
  // otherwise two free board tiles that match each other. Consumes a Hint.
  const handleHint = () => {
    if (showGameOver) return;
    if (powerCounts.hint <= 0) { soundSynth.playClick(); return; }

    const showHint = (pair: [string, string]) => {
      soundSynth.playSelect();
      setHintedPair(pair);
      hintsUsedRef.current += 1;
      setPowerCounts(p => ({ ...p, hint: p.hint - 1 }));
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = window.setTimeout(() => setHintedPair(null), 3000);
    };

    // 1. A free board tile that matches something already in the tray = instant clear
    const freeTiles = tiles.filter(t => t.isFree && !t.matched);
    const trayClear = freeTiles.find(ft => tray.some(tt => tilesMatch(tt, ft)));
    if (trayClear) {
      showHint([trayClear.id, trayClear.id]);
      return;
    }

    // 2. Otherwise two free board tiles that match each other
    const moves = findAvailableMoves(tiles);
    if (moves.length > 0) {
      showHint([moves[0][0].id, moves[0][1].id]);
    } else {
      soundSynth.playClick();
    }
  };

  const handleBackToMenu = () => {
    soundSynth.playClick();
    stopTimer();
    setIsPlaying(false);
    // Refresh the menu's Continue button with the just-persisted run
    setSavedGame(loadSavedGame());
  };

  // Render stopwatch helper (MM:SS)
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };




  // The active realm (visual world). Driven by the campaign level, or by the
  // Daily Challenge's themed realm when playing the daily board.
  const currentRealm = (dailyMode && dailyRealmId && realms[dailyRealmId as RealmId])
    ? realms[dailyRealmId as RealmId]
    : realmForLevel(currentLevel);
  const themeClass = `app-theme-${currentRealm.particleTheme} app-realm-${currentRealm.id}`;
  // Filter-based realms borrow another realm's tile art (recolored via CSS)
  const artRealmId = currentRealm.artRealm ?? currentRealm.id;

  const boardLeft = tiles.filter(t => !t.matched).length; // tiles still on the board
  const inPlay = boardLeft + tray.length;                 // not yet cleared (board + tray)
  const clearedCount = Math.max(0, totalTileCount - inPlay);
  const progressPercent = totalTileCount > 0 ? Math.round((clearedCount / totalTileCount) * 100) : 0;

  // A hint is also available when a free board tile matches a tile waiting in
  // the tray (instant clear), even if no two free board tiles match each other.
  const trayClearAvailable = tray.length > 0 &&
    tiles.some(t => t.isFree && !t.matched && tray.some(tt => tilesMatch(tt, t)));

  // One slot left and no tile on the board matches anything in the tray: the
  // next tap fills the tray and ends the run. (Two matching FREE board tiles
  // don't save you here — taking the first one already fills the last slot.)
  // Parking with no board match is normal play, so we only warn at this point.
  const lastSlotDanger = tray.length === TRAY_CAPACITY - 1 && !trayClearAvailable &&
    boardLeft > 0 && !showWinScreen && !showGameOver;

  // Star display helper
  // Brain-tier label for the final IQ (genius ceiling = 200)
  const iqTier = (iq: number): string => {
    if (iq >= 200) return '🧠 Genius';
    if (iq >= 180) return '🧠 Brilliant';
    if (iq >= 160) return '✨ Sharp';
    if (iq >= 130) return '👍 Clever';
    return '🌱 Warming Up';
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 3 }).map((_, i) => (
      <span key={i} className={`star-icon ${i < count ? 'star-earned' : 'star-empty'}`}>
        {i < count ? '⭐' : '☆'}
      </span>
    ));
  };

  return (
    <div className={`app-root ${themeClass}`}>
      {/* Dynamic particles in background header */}
      <div className="relaxing-canopy"></div>

      {/* Build version tag (confirms the deploy updated) */}
      <div className="version-badge">{APP_VERSION}</div>

      {/* --- MENU LAYER --- */}
      {!isPlaying && (
        <MainMenu
          // PLAY resumes the campaign where the player left off. (Passing a
          // LayoutName here instead would restart at that layout's level 1–5 AND
          // overwrite vita_current_level, wiping campaign progress.)
          onStartGame={() => initGame(currentLevel)}
          currentLevel={currentLevel}
          onStartDaily={() => initGame(0, true)}
          continueInfo={savedGame ? { level: savedGame.level, daily: savedGame.dailyMode } : null}
          onContinue={() => { if (savedGame) resumeGame(savedGame); }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          unlockedLevels={unlockedLevels}
          menuBg={currentRealm.menuBg}
          realmName={currentRealm.name}
          dailyStreak={daily.streak}
          dailyDoneToday={dailyDoneToday}
        />
      )}

      {/* --- SOLITAIRE GAMEBOARD LAYER --- */}
      {isPlaying && (
        <div className="gameplay-wrapper">
          {/* Premium Dark Jade Felt Status Header */}
          <header className="game-header">
            <button className="header-icon-btn back-menu-btn" onClick={handleBackToMenu} title="Main Menu" aria-label="Back to main menu">
              <BackIcon size={20} />
            </button>

            <div className="header-iq-row">
              <span className="iq-display" aria-label={`IQ score ${score}`}>
                <span className="iq-label">IQ:</span>
                <span className="iq-value">{score.toLocaleString()}</span>
              </span>
              <span className="header-timer" aria-label={`Elapsed time ${formatTime(timer)}`}>
                {formatTime(timer)}
              </span>
              {bestRecord && (
                <span className="header-best" aria-label={`Best IQ ${bestRecord.iq}`}>
                  ★ {bestRecord.iq}
                </span>
              )}
            </div>

            <button className="header-icon-btn settings-menu-btn" onClick={() => { soundSynth.playClick(); setIsSettingsOpen(true); }} title="Settings Menu" aria-label="Settings Menu">
              <SettingsIcon size={20} />
            </button>
          </header>

          {/* Tray bar — collected tiles; matching pairs auto-clear */}
          <div className="tray-bar">
            {comboMultiplier > 1 && (
              <span className="combo-inline-chip tray-combo">
                <span className="combo-fire">🔥</span>
                <span>x{comboMultiplier}</span>
              </span>
            )}
            <div className={`tray-slots ${tray.length >= TRAY_CAPACITY ? 'tray-danger' : ''} ${tray.length === TRAY_CAPACITY - 1 ? 'tray-warn' : ''}`} aria-label="Tile tray">
              {Array.from({ length: TRAY_CAPACITY }).map((_, i) => {
                const t = tray[i];
                return (
                  <div key={i} className={`tray-slot ${t ? 'filled' : ''}`}>
                    {t && (
                      <div className="tray-tile" key={t.id}>
                        <TileGlyph type={t.type} value={t.value} realm={artRealmId} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>



          {/* Progress bar (#17) */}
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            <span className="progress-bar-text">
              {dailyMode ? 'Daily' : `Level ${currentLevel}`} · {inPlay} / {totalTileCount} left · {currentRealm.name} · {layouts[activeLayout].displayName}
            </span>
          </div>

          {/* Last-slot warning: the next tap loses unless the board is changed.
              Say so instead of letting the player walk into "Tray Full". */}
          {lastSlotDanger && (
            <div className="stuck-banner" role="status">
              ⚠️ Last tray slot and no match on the board —{' '}
              {powerCounts.shuffle > 0
                ? 'Shuffle to rearrange it.'
                : powerCounts.undo > 0 || powerCounts.magnet > 0
                ? 'use Undo or Magnet to return a tile.'
                : 'no boosters left — the next tile ends the run.'}
            </div>
          )}

          {/* Combo popup floating text — scales up as the streak climbs */}
          {comboPopup && (
            <div className={`combo-popup ${comboPopup.mult >= 8 ? 'combo-huge' : comboPopup.mult >= 5 ? 'combo-big' : ''}`} key={comboPopup.key}>
              {comboPopup.text}
            </div>
          )}

          {/* Gameplay Canvas Container */}
          <main className={`game-board-area ${shaking ? 'combo-shake' : ''}`}>
            {tiles.length > 0 && (
              <MahjongBoard
                tiles={tiles}
                realm={artRealmId}
                highContrast={highContrast}
                hintedPair={hintedPair}
                onTileClick={stableTileClick}
                bgTheme={currentRealm.particleTheme}
              />
            )}
          </main>

          {/* Warm Wooden Deck Action Footer Toolbar — game powers */}
          <footer className="game-footer-toolbar">
            <div className="toolbar-actions" role="group" aria-label="Game powers">
              {(() => {
                const shuffleDisabled = boardLeft === 0 || powerCounts.shuffle <= 0;
                const magnetDisabled = tray.length === 0 || powerCounts.magnet <= 0;
                const hintDisabled = (possibleMovesCount === 0 && !trayClearAvailable) || powerCounts.hint <= 0;
                const undoDisabled = tray.length === 0 || powerCounts.undo <= 0;
                return (
                  <>
                    <div className="power-item">
                      <button
                        className={`footer-circle-btn shuffle-btn ${!shuffleDisabled ? 'power-ready' : ''}`}
                        onClick={handleShuffle}
                        disabled={shuffleDisabled}
                        title="Shuffle the remaining tiles into new positions"
                        aria-label={`Shuffle, ${powerCounts.shuffle} left`}
                      >
                        <span className="power-icon-disc">
                          <ShuffleIcon size={26} />
                        </span>
                        <span className={`btn-badge ${powerCounts.shuffle <= 0 ? 'badge-empty' : ''}`}>{powerCounts.shuffle}</span>
                      </button>
                      <span className="power-label">Shuffle</span>
                    </div>

                    <div className="power-item">
                      <button
                        className={`footer-circle-btn magnet-btn ${!magnetDisabled ? 'power-ready' : ''}`}
                        onClick={handleMagnet}
                        disabled={magnetDisabled}
                        title="Pull your last few collected tiles back onto the board"
                        aria-label={`Magnet, ${powerCounts.magnet} left`}
                      >
                        <span className="power-icon-disc">
                          <MagnetIcon size={26} />
                        </span>
                        <span className={`btn-badge ${powerCounts.magnet <= 0 ? 'badge-empty' : ''}`}>{powerCounts.magnet}</span>
                      </button>
                      <span className="power-label">Magnet</span>
                    </div>

                    <div className="power-item">
                      <button
                        className={`footer-circle-btn hint-btn ${!hintDisabled ? 'power-ready' : ''}`}
                        onClick={handleHint}
                        disabled={hintDisabled}
                        title="Reveal a matching pair you can play"
                        aria-label={`Hint, ${powerCounts.hint} left`}
                      >
                        <span className="power-icon-disc">
                          <HintIcon size={26} />
                        </span>
                        <span className={`btn-badge ${powerCounts.hint <= 0 ? 'badge-empty' : ''}`}>{powerCounts.hint}</span>
                      </button>
                      <span className="power-label">Hint</span>
                    </div>

                    <div className="power-item">
                      <button
                        className={`footer-circle-btn undo-btn ${!undoDisabled ? 'power-ready' : ''}`}
                        onClick={handleUndo}
                        disabled={undoDisabled}
                        title="Return your last collected tile to the board"
                        aria-label={`Undo, ${powerCounts.undo} left`}
                      >
                        <span className="power-icon-disc">
                          <UndoIcon size={26} />
                        </span>
                        <span className={`btn-badge ${powerCounts.undo <= 0 ? 'badge-empty' : ''}`}>{powerCounts.undo}</span>
                      </button>
                      <span className="power-label">Undo</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </footer>
        </div>
      )}

      {/* --- SETTINGS & LAYOUT SELECTION MODAL --- */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        sfxVolume={sfxVolume}
        setSfxVolume={setSfxVolume}
        ambientVolume={ambientVolume}
        setAmbientVolume={setAmbientVolume}
        isAmbientEnabled={isAmbientEnabled}
        setIsAmbientEnabled={setIsAmbientEnabled}
        activeLayout={activeLayout}
        unlockedLevels={unlockedLevels}
        // Picking a board or a level starts it right away and closes the modal —
        // otherwise the settings panel stays open on top of the new board.
        // initGame(LayoutName) rewinds to the nearest earlier level on that
        // layout, so this can't cost the player campaign progress.
        onSelectLayout={(layout) => {
          initGame(layout);
          setIsSettingsOpen(false);
        }}
        currentLevel={currentLevel}
        maxUnlockedLevel={maxUnlockedLevel}
        onSelectLevel={(lvl) => {
          initGame(lvl);
          setIsSettingsOpen(false);
        }}
      />



      {/* --- TRAY FULL / GAME OVER MODAL (Rush mode) --- */}
      {showGameOver && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-container glassmorphism stalemate-modal text-center animate-scale-up">
            <h2 style={{ color: '#ff8a80' }}>Tray Full!</h2>
            <p>
              Your tray reached {TRAY_CAPACITY} tiles with no match.
              {powerCounts.undo > 0 || powerCounts.magnet > 0
                ? ' Use an Undo or Magnet to pull tiles back and keep playing, or restart!'
                : ' You are out of rescues — restart the level to try again!'}
            </p>
            <div className="victory-stats">
              <div className="v-stat">
                <span className="v-stat-lbl">IQ</span>
                <span className="v-stat-val">{score.toLocaleString()}</span>
              </div>
              <div className="v-stat">
                <span className="v-stat-lbl">Tiles Cleared</span>
                <span className="v-stat-val">{clearedCount} / {totalTileCount}</span>
              </div>
            </div>
            <div className="stalemate-buttons">
              <button
                className="confirm-btn glassmorphism"
                onClick={handleUndo}
                disabled={powerCounts.undo <= 0 || tray.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <UndoIcon size={16} inline /> Return a Tile ({powerCounts.undo})
              </button>
              <button
                className="confirm-btn glassmorphism"
                onClick={handleMagnet}
                disabled={powerCounts.magnet <= 0 || tray.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <MagnetIcon size={16} inline /> Magnet ({powerCounts.magnet})
              </button>
              {/* Restart THIS level — not activeLayout, which maps back to levels 1–5 */}
              <button className="confirm-btn glassmorphism" onClick={() => initGame(currentLevel)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RestartIcon size={16} inline /> Restart
              </button>
              <button className="cancel-btn glassmorphism" onClick={handleBackToMenu} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BackIcon size={16} inline /> Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VICTORY SCREEN OVERLAY --- */}
      {showWinScreen && (
        <div className="modal-overlay victory-overlay animate-fade-in">
          <div className={`modal-container glassmorphism victory-modal text-center animate-scale-up ${score >= 200 ? 'genius-win' : ''}`}>
            <div className="victory-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
              <EarnedStampIcon size={64} />
            </div>
            <h2>{dailyMode ? 'Daily Cleared!' : 'Puzzle Solved!'}</h2>

            {/* Star Rating Display (#2) */}
            <div className="victory-stars">
              {renderStars(earnedStars)}
            </div>
            <div className="victory-iq-tier">{iqTier(score)} · IQ {score}</div>
            {dailyMode
              ? <div className="victory-best new-best">🔥 {daily.streak}-day streak!</div>
              : isNewBest
              ? <div className="victory-best new-best">🌟 New Best! IQ {bestRecord?.iq} · {formatTime(bestRecord?.time ?? timer)}</div>
              : bestRecord && <div className="victory-best">Best: IQ {bestRecord.iq} · {formatTime(bestRecord.time)}</div>}
            <p>Congratulations! You cleared all tiles in {formatTime(timer)} with {moveCount} moves.</p>
            
            <div className="victory-stats">
              <div className="v-stat">
                <span className="v-stat-lbl">Final IQ</span>
                <span className="v-stat-val">{score.toLocaleString()}</span>
              </div>
              <div className="v-stat">
                <span className="v-stat-lbl">Time</span>
                <span className="v-stat-val">{formatTime(timer)}</span>
              </div>
              <div className="v-stat">
                <span className="v-stat-lbl">Moves</span>
                <span className="v-stat-val">{moveCount}</span>
              </div>
              <div className="v-stat">
                <span className="v-stat-lbl">Layout</span>
                <span className="v-stat-val">{layouts[activeLayout].displayName}</span>
              </div>
            </div>

            {/* Random power-up reward for clearing the level */}
            {levelReward && (
              <div className={`reward-card ${rewardClaimed ? 'claimed' : ''}`}>
                {!rewardClaimed ? (
                  <>
                    <div className="reward-headline">
                      🎁 Level reward: <strong>+{levelReward.amount} {POWER_LABELS[levelReward.power]}</strong>
                    </div>
                    <div className="reward-buttons">
                      <button className="confirm-btn glassmorphism reward-claim-btn" onClick={claimReward}>
                        Claim +{levelReward.amount}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="reward-headline reward-done">
                    ✅ Added <strong>{POWER_LABELS[levelReward.power]}</strong> to your boosters!
                  </div>
                )}
              </div>
            )}

            {/* Dangle the next realm to pull the player onward (campaign only) */}
            {!dailyMode && currentLevel < 240 && (() => {
              const nxt = nextRealmChange(currentLevel);
              const soon = nxt.atLevel - currentLevel;
              return (
                <div className="realm-teaser">
                  🔓 <strong>{nxt.realm.name}</strong> {soon <= 1 ? 'unlocks next!' : `awaits at Level ${nxt.atLevel}`}
                </div>
              );
            })()}
            {dailyMode && (
              <div className="realm-teaser">🗓️ Come back tomorrow to keep your streak alive!</div>
            )}

            <div className="victory-buttons">
              {!dailyMode && currentLevel < 240 && (
                <button
                  className="confirm-btn glassmorphism"
                  onClick={() => initGame(currentLevel + 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent: 'center',
                    background: 'linear-gradient(to bottom, #d4af37 0%, #a8841a 100%)',
                    color: '#1a0f09',
                    borderColor: '#ffd700',
                    fontWeight: 'bold'
                  }}
                >
                  Next Level ➡️
                </button>
              )}
              <button className="cancel-btn glassmorphism" onClick={handleBackToMenu} style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <BackIcon size={16} inline /> Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Unlocked Floating Toast */}
      {achievementToast && (
        <div className="achievement-toast">
          <span className="toast-icon">🏆</span>
          <div className="toast-body">
            <span className="toast-header">Achievement Unlocked!</span>
            <span className="toast-title">{achievementToast.name}</span>
            <span className="toast-desc">{achievementToast.desc}</span>
          </div>
        </div>
      )}

      {/* First-run tutorial — content depends on the active mode */}
      {isPlaying && showTutorial && !showWinScreen && !showGameOver && (
        <div className="modal-overlay animate-fade-in" onClick={dismissTutorial}>
          <div className="modal-container glassmorphism tutorial-modal animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>👋 How to Play</h2>
            </div>
            <div className="modal-content">
              <div className="rules-grid">
                <div className="rule-item">
                  <span className="rule-num">1</span>
                  <div>
                    <h4>Tap a bright tile</h4>
                    <p>Only <strong>bright, free</strong> tiles can be picked. A tile is free when nothing rests on top of it and at least one side (left or right) is open. Dimmed tiles are blocked.</p>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-num">2</span>
                  <div>
                    <h4>It goes to your tray</h4>
                    <p>Tapped tiles slide into the tray at the top. You have <strong>{TRAY_CAPACITY} slots</strong>.</p>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-num">3</span>
                  <div>
                    <h4>Pairs clear automatically</h4>
                    <p>When two of the <strong>same tile</strong> meet in the tray, they vanish and score points. Clear the whole board to win!</p>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-num">4</span>
                  <div>
                    <h4>Don't fill the tray!</h4>
                    <p>If all {TRAY_CAPACITY} slots fill with no match, it's game over. Stuck? Use <strong>Shuffle</strong>, <strong>Hint</strong>, or <strong>Undo</strong>.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="confirm-btn glassmorphism" onClick={dismissTutorial}>
                <PlayIcon size={16} inline /> Let's Play!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
