import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  buildBoard,
  recalculateFreeState,
  findAvailableMoves,
  shuffleActiveTiles,
  tilesMatch
} from './mahjong/gameEngine';
import type { TileState } from './mahjong/gameEngine';
import { layouts } from './mahjong/layouts';
import type { LayoutName } from './mahjong/layouts';
import { soundSynth } from './mahjong/soundSynth';
import { haptics } from './mahjong/haptics';
import { achievementsList } from './mahjong/achievements';
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
export const APP_VERSION = 'v0.0.3';

const getCurrentTime = () => Date.now();


export const App: React.FC = () => {
  // Auto-play bot flag (?bot=1) — drives the game itself for QA / simulator demos.
  // Optional ?level=N deep-link jumps straight into that campaign level (QA spec
  // references "Launch Level 5 (Golden Turtle)" etc.).
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const botMode = urlParams.has('bot');
  const levelParam = (() => {
    const raw = urlParams.get('level');
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n >= 1 && n <= 240 ? n : null;
  })();
  const autoStart = botMode || levelParam !== null;

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
  const [score, setScore] = useState(0);

  // Combo Streak System (#1)
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [comboPopup, setComboPopup] = useState<{ text: string; key: number } | null>(null);
  const lastMatchTimeRef = useRef<number>(0);
  const comboPopupTimeoutRef = useRef<number | null>(null);
  const hintTimeoutRef = useRef<number | null>(null);

  // Move Counter (#23)
  const [moveCount, setMoveCount] = useState(0);

  // Star Rating (#2)
  const [earnedStars, setEarnedStars] = useState(0);
  const hintsUsedRef = useRef(0);
  const shufflesUsedRef = useRef(0);

  // Booster economy: four wooden powers with numbered counts that persist
  // across sessions — Shuffle, Magnet (pull tiles back from tray), Hint and
  // Undo. Winning levels restocks them via the level reward.
  // The QA bot gets a deep stock so it can always finish a board.
  const POWER_DEFAULTS = botMode
    ? { shuffle: 999, magnet: 999, hint: 999, undo: 999 }
    : { shuffle: 5, magnet: 3, hint: 5, undo: 5 };
  const [powerCounts, setPowerCounts] = useState<{ shuffle: number; magnet: number; hint: number; undo: number }>(() => {
    if (botMode) return { ...POWER_DEFAULTS };
    try {
      const stored = localStorage.getItem('vita_power_counts_v2');
      return stored ? { ...POWER_DEFAULTS, ...JSON.parse(stored) } : { ...POWER_DEFAULTS };
    } catch { return { ...POWER_DEFAULTS }; }
  });
  useEffect(() => {
    if (botMode) return; // don't let QA runs pollute real saves
    try { localStorage.setItem('vita_power_counts_v2', JSON.stringify(powerCounts)); } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [powerCounts]);

  // End-of-level reward: clearing a level grants a random power-up to carry
  // into the next level.
  type PowerKey = 'shuffle' | 'magnet' | 'hint' | 'undo';
  const POWER_META: Record<PowerKey, { label: string }> = {
    shuffle: { label: 'Shuffle' },
    magnet: { label: 'Magnet' },
    hint: { label: 'Hint' },
    undo: { label: 'Undo' }
  };
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

  // Achievement Unlocking Toast State
  const [achievementToast, setAchievementToast] = useState<{ id: string; name: string; desc: string } | null>(null);

  const unlockAchievement = (id: string) => {
    try {
      const stored = localStorage.getItem('vita_achievements');
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(id)) {
        const newList = [...list, id];
        localStorage.setItem('vita_achievements', JSON.stringify(newList));
        
        const badgeInfo = achievementsList.find(a => a.id === id);
        if (badgeInfo) {
          // Play celebratory synthesized arpeggio
          soundSynth.playAchievementUnlock();
          
          setAchievementToast({ id, name: badgeInfo.name, desc: badgeInfo.desc });
          setTimeout(() => {
            setAchievementToast(null);
          }, 5000);
        }
      }
    } catch (e) {
      console.warn("Could not save achievement:", e);
    }
  };

  // Total tile count for progress bar (#17)
  const [totalTileCount, setTotalTileCount] = useState(0);

  // Settings preferences (synced to LocalStorage)
  const [bgTheme, setBgTheme] = useState<string>(() => localStorage.getItem('vita_theme') || 'zen');
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
    localStorage.setItem('vita_theme', bgTheme);
    localStorage.setItem('vita_high_contrast', String(highContrast));
    localStorage.setItem('vita_sfx_vol', String(sfxVolume));
    localStorage.setItem('vita_ambient_vol', String(ambientVolume));
    localStorage.setItem('vita_ambient_enabled', String(isAmbientEnabled));
    soundSynth.configure(true, sfxVolume, ambientVolume);
  }, [bgTheme, highContrast, sfxVolume, ambientVolume, isAmbientEnabled]);

  // Start stopwatch timer
  const startTimer = () => {
    stopTimer();
    setTimer(0);
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

  // Set up board state when starting or restarting
  const initGame = (target: number | LayoutName) => {
    let levelNum: number;
    let layout: LayoutName;

    if (typeof target === 'number') {
      levelNum = target;
      // Ages 3+: only the two smallest board shapes (Meadow 52, Tower 70) so the
      // campaign always stays small and gentle — never the big deep piles.
      const kidLayouts: LayoutName[] = ['Garden', 'Pagoda'];
      layout = kidLayouts[(levelNum - 1) % kidLayouts.length];
    } else {
      layout = target;
      const layoutLevels: Record<LayoutName, number> = {
        'Garden': 1,
        'Pagoda': 2,
        'Pyramids': 3,
        'Butterfly': 4,
        'Turtle': 5
      };
      levelNum = layoutLevels[layout] || 1;
    }

    setIsPlaying(true);
    setCurrentLevel(levelNum);
    setActiveLayout(layout);

    // Save level state
    try {
      localStorage.setItem('vita_current_level', String(levelNum));
    } catch (e) {
      console.warn("Could not save current level:", e);
    }

    setShowWinScreen(false);
    setShowGameOver(false);
    setLevelReward(null);
    setRewardClaimed(false);
    setTray([]);
    setHintedPair(null);
    setScore(0);
    setComboMultiplier(1);
    setComboPopup(null);
    setMoveCount(0);
    setEarnedStars(0);
    lastMatchTimeRef.current = 0;
    hintsUsedRef.current = 0;
    shufflesUsedRef.current = 0;

    // Use unique seed based on level number to ensure deterministic solvable boards
    const seed = levelNum * 12345 + 42;
    // Ages 3+: keep every level GENTLE — always few distinct tile faces so there
    // are lots of duplicates and pairs are easy to spot. No difficulty ramp.
    const maxTypes = 10;
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
      initGame(currentLevel);
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
  const triggerSparkMatchEvent = (t1: TileState, t2: TileState) => {
    const event = new CustomEvent('tile-match', {
      detail: { id1: t1.id, id2: t2.id }
    });
    window.dispatchEvent(event);
  };

  // Shared scoring for a cleared pair: combo streak, score, move count, sound, spark.
  const scoreMatch = (t1: TileState, t2: TileState) => {
    const now = getCurrentTime();
    const elapsed = now - lastMatchTimeRef.current;
    let newMultiplier = 1;
    if (lastMatchTimeRef.current > 0 && elapsed < 3000) {
      newMultiplier = Math.min(comboMultiplier + 1, 10);
    }
    lastMatchTimeRef.current = now;
    setComboMultiplier(newMultiplier);
    if (newMultiplier >= 5) unlockAchievement('combo_master');

    const matchScore = 100 * newMultiplier;
    setScore(prev => prev + matchScore);
    setMoveCount(prev => prev + 1);

    if (newMultiplier > 1) {
      setComboPopup({ text: `+${matchScore} x${newMultiplier}`, key: now });
      if (comboPopupTimeoutRef.current) clearTimeout(comboPopupTimeoutRef.current);
      comboPopupTimeoutRef.current = window.setTimeout(() => setComboPopup(null), 1200);
      soundSynth.playComboChime(newMultiplier);
      haptics.combo(newMultiplier);
    } else {
      soundSynth.playMatch();
      haptics.match();
    }
    triggerSparkMatchEvent(t1, t2);
  };

  // Victory! Compute stars, persist progress, unlock achievements, show win screen.
  const triggerVictory = () => {
    {
      stopTimer();
      soundSynth.playVictory();
      haptics.win();

      // Star Rating computation (#2)
      const stars = computeStarRating(
        timer,
        hintsUsedRef.current,
        shufflesUsedRef.current,
        totalTileCount
      );
      setEarnedStars(stars);

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

      // Roll a random power-up reward to carry into the next level.
      const rewardPools: { power: PowerKey; min: number; max: number }[] = [
        { power: 'shuffle', min: 2, max: 5 },
        { power: 'magnet', min: 1, max: 2 },
        { power: 'hint', min: 2, max: 5 },
        { power: 'undo', min: 2, max: 5 }
      ];
      const pick = rewardPools[Math.floor(Math.random() * rewardPools.length)];
      const amount = pick.min + Math.floor(Math.random() * (pick.max - pick.min + 1));
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
      // Don't reset the combo on collect — you nearly always park a tile before
      // matching its partner, so resetting here made combos impossible. The
      // streak lapses on its own via the match-to-match timer in scoreMatch.
      if (newTray.length >= TRAY_CAPACITY) {
        soundSynth.playClick();
        haptics.lose();
        stopTimer();
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
  };

  // Render stopwatch helper (MM:SS)
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };




  // Background Theme Styling Class
  const themeClass = `app-theme-${bgTheme}`;

  const boardLeft = tiles.filter(t => !t.matched).length; // tiles still on the board
  const inPlay = boardLeft + tray.length;                 // not yet cleared (board + tray)
  const clearedCount = Math.max(0, totalTileCount - inPlay);
  const progressPercent = totalTileCount > 0 ? Math.round((clearedCount / totalTileCount) * 100) : 0;

  // A hint is also available when a free board tile matches a tile waiting in
  // the tray (instant clear), even if no two free board tiles match each other.
  const trayClearAvailable = tray.length > 0 &&
    tiles.some(t => t.isFree && !t.matched && tray.some(tt => tilesMatch(tt, t)));

  // Star display helper
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
          onStartGame={() => initGame(activeLayout)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          unlockedLevels={unlockedLevels}
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
                        <TileGlyph type={t.type} value={t.value} />
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
            <span className="progress-bar-text">{inPlay} / {totalTileCount} left · {layouts[activeLayout].displayName}</span>
          </div>

          {/* Combo popup floating text */}
          {comboPopup && (
            <div className="combo-popup" key={comboPopup.key}>
              {comboPopup.text}
            </div>
          )}

          {/* Gameplay Canvas Container */}
          <main className="game-board-area">
            {tiles.length > 0 && (
              <MahjongBoard
                tiles={tiles}
                highContrast={highContrast}
                hintedPair={hintedPair}
                onTileClick={stableTileClick}
                bgTheme={bgTheme}
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
        bgTheme={bgTheme}
        setBgTheme={setBgTheme}
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
        onSelectLayout={(layout) => {
          setActiveLayout(layout);
          if (isPlaying) {
            initGame(layout);
          }
        }}
        currentLevel={currentLevel}
        maxUnlockedLevel={maxUnlockedLevel}
        onSelectLevel={(lvl) => {
          initGame(lvl);
        }}
      />



      {/* --- TRAY FULL / GAME OVER MODAL (Rush mode) --- */}
      {showGameOver && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-container glassmorphism stalemate-modal text-center animate-scale-up">
            <h2 style={{ color: '#ff8a80' }}>Tray Full!</h2>
            <p>
              Your tray reached {TRAY_CAPACITY} tiles with no match.
              {powerCounts.undo > 0
                ? ' Use an Undo to return a tile and keep playing, or restart!'
                : ' You are out of Undos — restart the level to try again!'}
            </p>
            <div className="victory-stats">
              <div className="v-stat">
                <span className="v-stat-lbl">Score</span>
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
              <button className="confirm-btn glassmorphism" onClick={() => initGame(activeLayout)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
          <div className="modal-container glassmorphism victory-modal text-center animate-scale-up">
            <div className="victory-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
              <EarnedStampIcon size={64} />
            </div>
            <h2>Puzzle Solved!</h2>

            {/* Star Rating Display (#2) */}
            <div className="victory-stars">
              {renderStars(earnedStars)}
            </div>
            <p>Congratulations! You cleared all tiles in {formatTime(timer)} with {moveCount} moves.</p>
            
            <div className="victory-stats">
              <div className="v-stat">
                <span className="v-stat-lbl">Final Score</span>
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
                      🎁 Level reward: <strong>+{levelReward.amount} {POWER_META[levelReward.power].label}</strong>
                    </div>
                    <div className="reward-buttons">
                      <button className="confirm-btn glassmorphism reward-claim-btn" onClick={claimReward}>
                        Claim +{levelReward.amount}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="reward-headline reward-done">
                    ✅ Added <strong>{POWER_META[levelReward.power].label}</strong> to your boosters!
                  </div>
                )}
              </div>
            )}

            <div className="victory-buttons">
              {currentLevel < 240 && (
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
