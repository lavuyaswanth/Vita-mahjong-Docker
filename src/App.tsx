import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  buildBoard,
  recalculateFreeState,
  findAvailableMoves,
  shuffleActiveTiles,
  tilesMatch
} from './mahjong/gameEngine';
import type { TileState } from './mahjong/gameEngine';
import { layouts, layoutForLevel , MAX_LEVEL } from './mahjong/layouts';
import { lsGet, lsSet, lsInt, lsNumber, lsSetJson, lsNumberMap } from './mahjong/storage';
import type { LayoutName } from './mahjong/layouts';
import { soundSynth } from './mahjong/soundSynth';
import { haptics } from './mahjong/haptics';
import { useAchievements } from './hooks/useAchievements';
import { useBoosters } from './hooks/useBoosters';
import { useSaveGame } from './hooks/useSaveGame';
import type { SavedGame } from './hooks/useSaveGame';
import type { PowerKey } from './hooks/useBoosters';
import MahjongBoard from './components/MahjongBoard';
import GameClock from './components/GameClock';
import { TileGlyph } from './components/Tile';
import { tileDisplayName } from './mahjong/tileNames';
import MainMenu from './components/MainMenu';
import SettingsModal from './components/SettingsModal';
import VictoryModal from './components/VictoryModal';
import GameOverModal from './components/GameOverModal';
import TutorialModal from './components/TutorialModal';
import LiveRegion from './components/LiveRegion';
import './App.css';
import {
  BackIcon,
  UndoIcon,
  HintIcon,
  ShuffleIcon,
  MagnetIcon,
  SettingsIcon
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

// Stamped from package.json at build time (see vite.config.ts) so the badge can
// always be trusted to tell you which build you're looking at.
const APP_VERSION = `v${__APP_VERSION__}`;

export const App: React.FC = () => {
  // Auto-play bot flag (?bot=1) — drives the game itself for QA / simulator demos.
  // Optional ?level=N deep-link jumps straight into that campaign level (QA spec
  // references "Launch Level 5 (Golden Turtle)" etc.).
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const botMode = urlParams.has('bot');
  const levelParam = (() => {
    const raw = urlParams.get('level');
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n >= 1 && n <= MAX_LEVEL ? n : null;
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
    return lsGet('vita_tutorial_seen') !== 'true';
  });
  const dismissTutorial = () => {
    soundSynth.playClick();
    setShowTutorial(false);
    lsSet('vita_tutorial_seen', 'true');
  };

  // Game Helpers
  // Tile ids currently highlighted by a Hint. A list rather than a pair because
  // a tray-clearing hint points at a single tile.
  const [hintedPair, setHintedPair] = useState<string[] | null>(null);
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

  // Campaign level progression (see MAX_LEVEL)
  const [currentLevel, setCurrentLevel] = useState<number>(
    () => levelParam ?? lsInt('vita_current_level', 1, 1, MAX_LEVEL)
  );
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(
    () => lsInt('vita_max_unlocked_level', 1, 1, MAX_LEVEL)
  );

  // Derived unlocked levels (1 to 5) for settings board options
  const unlockedLevels = Array.from({ length: Math.min(5, maxUnlockedLevel) }).map((_, i) => i + 1);

  // Achievement unlocking + toast — see useAchievements.
  const { achievementToast, unlockAchievement } = useAchievements();

  // Total tile count for progress bar (#17)
  const [totalTileCount, setTotalTileCount] = useState(0);

  // Settings preferences (synced to LocalStorage)
  const [bgTheme, setBgTheme] = useState<string>(() => lsGet('vita_theme') || 'zen');
  const [highContrast, setHighContrast] = useState<boolean>(
    () => lsGet('vita_high_contrast') === 'true'
  );
  // Volumes are clamped to 0–1: a corrupt value reaching soundSynth.configure
  // would hit setValueAtTime(NaN), which throws and kills all audio.
  const [sfxVolume, setSfxVolume] = useState<number>(
    () => lsNumber('vita_sfx_vol', 0.5, 0, 1)
  );
  const [ambientVolume, setAmbientVolume] = useState<number>(
    () => lsNumber('vita_ambient_vol', 0.3, 0, 1)
  );
  const [isAmbientEnabled, setIsAmbientEnabled] = useState<boolean>(
    () => lsGet('vita_ambient_enabled') === 'true'
  );

  // One identity for "a new board was dealt", bumped by initGame and resumeGame.
  // It remounts <GameClock> (so it starts from the resumed elapsed time) and
  // tells MahjongBoard when to re-fit the board to the screen.
  const [run, setRun] = useState<{ id: number; startAt: number }>({ id: 0, startAt: 0 });
  // <GameClock> owns the per-second state so a tick doesn't re-render the board;
  // `elapsedRef` is the elapsed value everything else reads.
  const elapsedRef = useRef<number>(0);
  const startTimer = (initialSeconds = 0) => {
    elapsedRef.current = initialSeconds;
    setRun(r => ({ id: r.id + 1, startAt: initialSeconds }));
  };
  // The clock runs whenever a live run is on screen; there is no separate stop
  // call to forget, so victory/game-over/menu all pause it by construction.
  const clockRunning = isPlaying && !showWinScreen && !showGameOver;
  // Frozen elapsed time for the victory modal (the clock has stopped by then).
  const [finalTime, setFinalTime] = useState(0);

  // Achievements earned by the run just finished, shown inside the victory
  // dialog (see triggerVictory).
  const [victoryUnlocks, setVictoryUnlocks] = useState<{ name: string; desc: string }[]>([]);

  // Sync settings to localstorage on change. The first run only configures
  // audio: these values were just READ from storage, so writing them back on
  // mount is a no-op that clobbers any write landing between state init and
  // this effect flushing.
  const settingsHydrated = useRef(false);
  useEffect(() => {
    soundSynth.configure(true, sfxVolume, ambientVolume);
    if (!settingsHydrated.current) {
      settingsHydrated.current = true;
      return;
    }
    lsSet('vita_theme', bgTheme);
    lsSet('vita_high_contrast', String(highContrast));
    lsSet('vita_sfx_vol', String(sfxVolume));
    lsSet('vita_ambient_vol', String(ambientVolume));
    lsSet('vita_ambient_enabled', String(isAmbientEnabled));
  }, [bgTheme, highContrast, sfxVolume, ambientVolume, isAmbientEnabled]);

  // ---- Save & resume ----  (types + validation live in useSaveGame)
  const buildSave = (): SavedGame | null => {
    if (!isPlaying || botMode || showWinScreen || tiles.length === 0) return null;
    if (tiles.every(t => t.matched)) return null;
    return {
      level: currentLevel,
      layout: activeLayout,
      tiles: tiles.map(({ x, y, z, id, type, value, matched }) => ({ x, y, z, id, type, value, matched })),
      trayIds: tray.map(t => t.id),
      timer: elapsedRef.current,
      score,
      moveCount,
      hintsUsed: hintsUsedRef.current,
      shufflesUsed: shufflesUsedRef.current
    };
  };
  const { savedGame, persistSave, clearSavedGame, refreshSavedGame } = useSaveGame(buildSave);

  // Persist after every board/tray change.
  useEffect(() => {
    persistSave();
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
    setShowWinScreen(false);
    // A full tray always means game over (a match would have auto-cleared).
    // The saved run stays resumable so Undo/Magnet can still rescue it.
    const lost = trayTiles.length >= TRAY_CAPACITY;
    setShowGameOver(lost);
    // The header clock freezes at `finalTime` whenever a run has ended, so a
    // resumed loss MUST carry its elapsed time across — otherwise the frozen
    // clock reads 00:00 beside a game-over modal reporting a real run, then
    // jumps to the true time the moment Undo unfreezes it. (`??` wouldn't help:
    // finalTime's initial 0 isn't nullish.)
    setFinalTime(lost ? save.timer : 0);
    setVictoryUnlocks([]);
    setLevelReward(null);
    setRewardClaimed(false);
    setTiles(board);
    setTray(trayTiles);
    setHintedPair(null);
    setScore(save.score);
    setComboMultiplier(1);
    setComboPopup(null);
    setMoveCount(save.moveCount);
    setEarnedStars(0);
    lastMatchTimeRef.current = 0;
    hintsUsedRef.current = save.hintsUsed;
    shufflesUsedRef.current = save.shufflesUsed;
    setTotalTileCount(save.tiles.length);
    startTimer(save.timer);
    setPossibleMovesCount(findAvailableMoves(board).length);
  };

  // Set up board state when starting or restarting
  const initGame = (target: number | LayoutName) => {
    let levelNum: number;
    let layout: LayoutName;

    if (typeof target === 'number') {
      levelNum = target;
      // Ages 3+ rotates only the two smallest boards — see LAYOUT_CYCLE.
      layout = layoutForLevel(levelNum);
    } else {
      // Picking a board by name plays it at the level the player is ALREADY on,
      // so it can't cost them progress. Mapping to a fixed level 1–5 instead
      // would knock a level-87 player back to level 2 and persist it. (The big
      // boards aren't in this edition's campaign rotation at all, so there is no
      // "most recent level on this board" to rewind to.)
      layout = target;
      levelNum = currentLevel;
    }

    setIsPlaying(true);
    setCurrentLevel(levelNum);
    setActiveLayout(layout);

    // Save level state
    try {
      lsSet('vita_current_level', String(levelNum));
    } catch (e) {
      console.warn("Could not save current level:", e);
    }

    setShowWinScreen(false);
    setShowGameOver(false);
    setFinalTime(0);
    setVictoryUnlocks([]);
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
    const now = Date.now();
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
    // The clock stops on its own once showWinScreen flips; freeze the value the
    // victory modal reports.
    const elapsed = elapsedRef.current;
    setFinalTime(elapsed);
    soundSynth.playVictory();
    haptics.win();
    // The run is complete — nothing left to resume.
    clearSavedGame();

    // Star Rating computation (#2)
    const stars = computeStarRating(
      elapsed,
      hintsUsedRef.current,
      shufflesUsedRef.current,
      totalTileCount
    );
    setEarnedStars(stars);

    // Save best stars per layout (#2)
    const bestStars = lsNumberMap('vita_best_stars');
    if (stars > (bestStars[activeLayout] ?? 0)) {
      bestStars[activeLayout] = stars;
      lsSetJson('vita_best_stars', bestStars);
    }

    // Progressive level unlock
    const nextLevel = currentLevel + 1;
    if (nextLevel <= MAX_LEVEL && nextLevel > maxUnlockedLevel) {
      setMaxUnlockedLevel(nextLevel);
      lsSet('vita_max_unlocked_level', String(nextLevel));
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
    // Collected rather than fired and forgotten, for two reasons: several can
    // unlock on one victory and the toast only shows the last, and the victory
    // dialog is aria-modal, which hides the page-level live region from screen
    // readers at exactly the moment these fire. The dialog reports them itself.
    const unlocked = [
      unlockAchievement('zen_beginner'),
      elapsed <= 180 ? unlockAchievement('speedy_thinker') : null,
      hintsUsedRef.current === 0 && shufflesUsedRef.current === 0
        ? unlockAchievement('mindful_path') : null,
      (() => {
        const starsByLayout = lsNumberMap('vita_best_stars');
        const solved = Object.keys(starsByLayout).filter(l => (starsByLayout[l] ?? 0) > 0);
        if (!solved.includes(activeLayout)) solved.push(activeLayout);
        return solved.length >= 5 ? unlockAchievement('trophy_collector') : null;
      })()
    ].filter((a): a is { name: string; desc: string } => a !== null);
    setVictoryUnlocks(unlocked);
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
        // Freeze the clock at the elapsed time, exactly as victory does — the
        // header renders `finalTime` for as long as a run is over, so without
        // this it would read 00:00 beside the game-over modal.
        setFinalTime(elapsedRef.current);
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
    // Flush first: the periodic save carries the elapsed time as of the last
    // move, so without this Continue would rewind the clock to that point.
    // `isPlaying` is still true here, so buildSave still produces a save.
    persistSave();
    setIsPlaying(false);
    refreshSavedGame();
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

  // Any modal owning the screen. The board holds up to ~130 tabbable tiles, so
  // `aria-modal` on the dialog is only half the job: without `inert` here a
  // keyboard user tabs straight out of the dialog onto tiles that the screen
  // reader is simultaneously refusing to describe. inert also blocks pointer
  // events, so a stray tap can't reach the board behind the overlay.
  const modalOpen = isSettingsOpen || showWinScreen || showGameOver || showTutorial;

  // --- Screen-reader narration -------------------------------------------
  // Board feedback is otherwise purely visual (dimming marks blocked tiles, the
  // tray fills silently). Derived rather than pushed from the handlers, so it
  // cannot drift out of step with what is on screen. Polite, because it changes
  // as you play and assertive would cut off the previous sentence each time.
  //
  // Deliberately NOT the tile count: that changes on every single tap, so
  // including it made the region re-announce constantly to deliver the one
  // number a player is least likely to be tracking. Tray state and the dead-end
  // warning are the parts that actually affect the next decision. The running
  // count is still on screen in the progress bar.
  const boardNarration = !isPlaying ? '' : [
    `Tray ${tray.length} of ${TRAY_CAPACITY}`,
    possibleMovesCount === 0 && !trayClearAvailable && boardLeft > 0
      ? 'No matching pair on the board' : ''
  ].filter(Boolean).join('. ');

  // Separate assertive region. Its real remaining scope is narrow: MID-PLAY
  // achievement unlocks, which on this branch means combo_master alone.
  //
  // Everything else is covered elsewhere. End-of-run is announced by the
  // victory and game-over dialogs, which are role="alertdialog" with
  // aria-describedby pointing at their own summary — repeating it here meant
  // hearing the result twice. The achievements earned AT victory are listed
  // inside that dialog too, because its aria-modal hides this region from
  // screen readers for as long as it is open. So this region only ever gets
  // heard when no dialog is up.
  const alertNarration = achievementToast
    ? `Achievement unlocked: ${achievementToast.name}. ${achievementToast.desc}`
    : '';

  return (
    <div className={`app-root ${themeClass}`}>
      {/* Dynamic particles in background header */}
      <div className="relaxing-canopy"></div>

      {/* Build version tag (confirms the deploy updated) */}
      <div className="version-badge">{APP_VERSION}</div>

      {/* Non-visual channel for gameplay state. Always mounted — a live region
          must exist before its text changes or the first announcement is lost. */}
      <LiveRegion message={boardNarration} />
      <LiveRegion message={alertNarration} urgency="assertive" />

      {/* --- MENU LAYER --- */}
      {!isPlaying && (
        <MainMenu
          onStartGame={() => initGame(activeLayout)}
          continueInfo={savedGame ? { level: savedGame.level } : null}
          onContinue={() => { if (savedGame) resumeGame(savedGame); }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          unlockedLevels={unlockedLevels}
          // Settings lives here, not in the menu, so the menu can't know to go
          // inert for it on its own.
          backgroundInert={isSettingsOpen}
        />
      )}

      {/* --- SOLITAIRE GAMEBOARD LAYER --- */}
      {isPlaying && (
        <div className="gameplay-wrapper" inert={modalOpen}>
          {/* Premium Dark Jade Felt Status Header */}
          <header className="game-header">
            <button className="header-icon-btn back-menu-btn" onClick={handleBackToMenu} title="Main Menu" aria-label="Back to main menu">
              <BackIcon size={20} />
            </button>

            <div className="header-score-row">
              {/* Points, not an IQ: this edition's score starts at 0 and
                  accumulates. Both modals already said "Score"; only the header
                  still carried the Midnight edition's IQ scheme, so a screen
                  reader announced "IQ score 4,300" for something that isn't one. */}
              <span className="score-display" aria-label={`Score ${score}`}>
                <span className="score-label">Score:</span>
                <span className="score-value">{score.toLocaleString()}</span>
              </span>
              {/* Remounted per run (key), so it starts from the resumed
                  elapsed time without a state-resetting effect. */}
              <GameClock
                key={run.id}
                running={clockRunning}
                startAt={run.startAt}
                elapsedRef={elapsedRef}
                freezeAt={showWinScreen || showGameOver ? finalTime : null}
              />
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
            {/* role="list" so the aria-label is actually honoured — on a bare
                div it is ignored, and the slots had no labels at all, leaving a
                screen-reader user unable to tell what the tray holds. */}
            <div
              className={`tray-slots ${tray.length >= TRAY_CAPACITY ? 'tray-danger' : ''} ${tray.length === TRAY_CAPACITY - 1 ? 'tray-warn' : ''}`}
              role="list"
              aria-label={`Tile tray, ${tray.length} of ${TRAY_CAPACITY} slots used`}
            >
              {Array.from({ length: TRAY_CAPACITY }).map((_, i) => {
                const t = tray[i];
                return (
                  <div
                    key={i}
                    className={`tray-slot ${t ? 'filled' : ''}`}
                    role="listitem"
                    aria-label={t ? tileDisplayName(t.type, t.value) : `Empty slot ${i + 1}`}
                  >
                    {t && (
                      <div className="tray-tile" key={t.id} aria-hidden="true">
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
                boardId={run.id}
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
        // Picking a board or a level starts it right away and closes the modal —
        // otherwise a new board is dealt behind the open panel, and because the
        // gameplay wrapper is `inert` while a modal is up the player can neither
        // see nor touch it until they close Settings. (The old `if (isPlaying)`
        // guard also meant picking a board from the MENU did nothing at all.)
        // initGame(LayoutName) plays it at the player's current level, so this
        // cannot cost campaign progress.
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



      {/* --- TRAY FULL / GAME OVER MODAL --- */}
      {showGameOver && (
        <GameOverModal
          trayCapacity={TRAY_CAPACITY}
          score={score}
          clearedCount={clearedCount}
          totalTileCount={totalTileCount}
          powerCounts={powerCounts}
          canReturnTile={tray.length > 0}
          onUndo={handleUndo}
          onMagnet={handleMagnet}
          onRestart={() => initGame(currentLevel)}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {/* --- VICTORY SCREEN OVERLAY --- */}
      {showWinScreen && (
        <VictoryModal
          score={score}
          earnedStars={earnedStars}
          finalTime={finalTime}
          moveCount={moveCount}
          activeLayout={activeLayout}
          currentLevel={currentLevel}
          unlockedAchievements={victoryUnlocks}
          levelReward={levelReward}
          rewardClaimed={rewardClaimed}
          onClaimReward={claimReward}
          onNextLevel={() => initGame(currentLevel + 1)}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {/* Achievement Unlocked Floating Toast */}
      {achievementToast && (
        <div className="achievement-toast" aria-hidden="true">
          <span className="toast-icon">🏆</span>
          <div className="toast-body">
            <span className="toast-header">Achievement Unlocked!</span>
            <span className="toast-title">{achievementToast.name}</span>
            <span className="toast-desc">{achievementToast.desc}</span>
          </div>
        </div>
      )}

      {/* First-run tutorial */}
      {isPlaying && showTutorial && !showWinScreen && !showGameOver && (
        <TutorialModal trayCapacity={TRAY_CAPACITY} onDismiss={dismissTutorial} />
      )}

    </div>
  );
};

export default App;
