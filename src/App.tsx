import React, { useState, useEffect, useRef } from 'react';
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
import MahjongBoard from './components/MahjongBoard';
import MainMenu from './components/MainMenu';
import SettingsModal from './components/SettingsModal';
import './App.css';
import {
  BackIcon,
  UndoIcon,
  HintIcon,
  ShuffleIcon,
  RestartIcon,
  EarnedStampIcon
} from './components/SvgIcons';


interface UndoAction {
  tile1: TileState;
  tile2: TileState;
}

// Star rating thresholds
const computeStarRating = (time: number, hintsUsed: number, shufflesUsed: number, tileCount: number): number => {
  const timeThreshold3 = Math.max(60, tileCount * 1.5); // e.g. 144 tiles = 216s for 3 stars
  const timeThreshold2 = timeThreshold3 * 2;
  if (hintsUsed === 0 && shufflesUsed === 0 && time <= timeThreshold3) return 3;
  if (hintsUsed <= 1 && shufflesUsed <= 1 && time <= timeThreshold2) return 2;
  return 1;
};

// Countdown time allotment per tile count
const getTimedCountdown = (tileCount: number): number => {
  if (tileCount >= 140) return 300; // 5 minutes for 144 tiles
  if (tileCount >= 90) return 240;  // 4 minutes for 96 tiles
  if (tileCount >= 70) return 180;  // 3 minutes for 72-80 tiles
  return 150;                       // 2.5 minutes for 64 tiles
};

const achievementsList = [
  { id: 'zen_beginner', name: 'Zen Sprout', desc: 'Complete your first puzzle to begin your journey.' },
  { id: 'combo_master', name: 'Combo Catalyst', desc: 'Attain a x5 combo streak by matching tiles within 3 seconds.' },
  { id: 'speedy_thinker', name: 'Speedy Mind', desc: 'Solve any layout in under 3 minutes.' },
  { id: 'mindful_path', name: 'Mindful Path', desc: 'Clear a full layout without using a Hint or Shuffle.' },
  { id: 'trophy_collector', name: 'Zen Master', desc: 'Prove your dedication by solving all 5 layouts.' },
  { id: 'daily_devotee', name: 'Daily Zen Devotion', desc: 'Acquire 3 daily quest stamps on the calendar.' },
  { id: 'time_survivor', name: 'Rush Champion', desc: 'Race and conquer a full Timed Rush game.' }
];

const getCurrentTime = () => Date.now();

export const App: React.FC = () => {
  // Navigation State
  const [gameMode, setGameMode] = useState<'menu' | 'solitaire' | 'memory' | 'daily' | 'timed'>('menu');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Layout and Tiles State
  const [activeLayout, setActiveLayout] = useState<LayoutName>('Turtle');
  const [tiles, setTiles] = useState<TileState[]>([]);
  const [selectedTile, setSelectedTile] = useState<TileState | null>(null);
  
  // Game Helpers
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [hintedPair, setHintedPair] = useState<[string, string] | null>(null);
  const [possibleMovesCount, setPossibleMovesCount] = useState<number>(0);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [showNoMovesModal, setShowNoMovesModal] = useState(false);

  // Redesign Active States
  const [score, setScore] = useState(0);
  const [shufflesRemaining, setShufflesRemaining] = useState(3);
  const [hintsRemaining, setHintsRemaining] = useState(3);

  // Combo Streak System (#1)
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [comboPopup, setComboPopup] = useState<{ text: string; key: number } | null>(null);
  const lastMatchTimeRef = useRef<number>(0);

  // Move Counter (#23)
  const [moveCount, setMoveCount] = useState(0);

  // Star Rating (#2)
  const [earnedStars, setEarnedStars] = useState(0);
  const hintsUsedRef = useRef(0);
  const shufflesUsedRef = useRef(0);

  // Timed Challenge Mode (#4)
  const [countdownTimer, setCountdownTimer] = useState(0);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const countdownRef = useRef<number | null>(null);

  // Progressive Level Unlock (#5)
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('vita_unlocked_levels');
      return stored ? JSON.parse(stored) : [1];
    } catch { return [1]; }
  });

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
  const [styleSet, setStyleSet] = useState<'classic' | 'largePrint' | 'nature' | 'modernPop'>(() => {
    const val = localStorage.getItem('vita_style_set');
    return (val as 'classic' | 'largePrint' | 'nature' | 'modernPop') || 'classic';
  });
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

  // Memory Mode lockout
  const [isMemoryProcessing, setIsMemoryProcessing] = useState(false);

  // Sync settings to localstorage
  useEffect(() => {
    localStorage.setItem('vita_theme', bgTheme);
    localStorage.setItem('vita_style_set', styleSet);
    localStorage.setItem('vita_high_contrast', String(highContrast));
    localStorage.setItem('vita_sfx_vol', String(sfxVolume));
    localStorage.setItem('vita_ambient_vol', String(ambientVolume));
    localStorage.setItem('vita_ambient_enabled', String(isAmbientEnabled));
    soundSynth.configure(true, sfxVolume, ambientVolume);
  }, [bgTheme, styleSet, highContrast, sfxVolume, ambientVolume, isAmbientEnabled]);

  // Handle ambient audio on initial mount / page actions
  useEffect(() => {
    if (isAmbientEnabled && gameMode !== 'menu') {
      soundSynth.startAmbient();
    } else {
      soundSynth.stopAmbient();
    }
    return () => soundSynth.stopAmbient();
  }, [isAmbientEnabled, gameMode]);

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

  // Stop timed countdown
  const stopCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // Set up board state when starting or restarting
  const initGame = (mode: typeof gameMode, layout: LayoutName) => {
    setGameMode(mode);
    setActiveLayout(layout);
    setShowWinScreen(false);
    setShowNoMovesModal(false);
    setShowTimeUpModal(false);
    setUndoStack([]);
    setSelectedTile(null);
    setHintedPair(null);
    setScore(0);
    setShufflesRemaining(3);
    setHintsRemaining(3);
    setComboMultiplier(1);
    setComboPopup(null);
    setMoveCount(0);
    setEarnedStars(0);
    lastMatchTimeRef.current = 0;
    hintsUsedRef.current = 0;
    shufflesUsedRef.current = 0;
    stopCountdown();

    let seed: number | undefined;
    if (mode === 'daily') {
      seed = getDailyChallengeSeed(new Date());
    }

    const newTiles = buildBoard(layout, seed);
    setTotalTileCount(newTiles.length);
    
    // In Memory Mode, tiles start face-down (revealed = false)
    if (mode === 'memory') {
      newTiles.forEach(t => t.revealed = false);
    } else {
      // In classic mode, all tiles are face up (revealed = true)
      newTiles.forEach(t => t.revealed = true);
    }

    setTiles(newTiles);
    startTimer();

    // Set up countdown for Timed mode
    if (mode === 'timed') {
      const countdown = getTimedCountdown(newTiles.length);
      setCountdownTimer(countdown);
      countdownRef.current = setInterval(() => {
        setCountdownTimer(prev => {
          if (prev <= 1) {
            stopCountdown();
            stopTimer();
            setShowTimeUpModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Check possible moves
    const moves = findAvailableMoves(newTiles);
    setPossibleMovesCount(moves.length);
  };

  // Handle game tile clicking interaction
  const handleTileClick = (clicked: TileState) => {
    if (showWinScreen || isMemoryProcessing) return;

    // Check blockage rules first
    if (!clicked.isFree) {
      soundSynth.playClick(); // Soft warning click
      // Trigger wobble shake animation
      setTiles(prev => prev.map(t => t.id === clicked.id ? { ...t, wobbling: true } : t));
      setTimeout(() => {
        setTiles(prev => prev.map(t => t.id === clicked.id ? { ...t, wobbling: false } : t));
      }, 400);
      return;
    }

    // --- GAMEPLAY MODE: ACTIVE MIND MEMORY MODE ---
    if (gameMode === 'memory') {
      // Ignore clicks on already revealed or matched tiles
      if (clicked.revealed || clicked.matched) return;

      soundSynth.playSelect();
      
      // Reveal the clicked tile
      const updated = tiles.map(t => t.id === clicked.id ? { ...t, revealed: true } : t);
      setTiles(updated);

      if (!selectedTile) {
        // First selection of Memory Mode
        setSelectedTile(clicked);
      } else {
        // Second selection of Memory Mode
        setIsMemoryProcessing(true);
        const tile1 = selectedTile;
        const tile2 = clicked;

        if (tilesMatch(tile1, tile2)) {
          // It's a match! Clear them
          setTimeout(() => {
            const matchedTiles = updated.map(t => {
              if (t.id === tile1.id || t.id === tile2.id) {
                return { ...t, matched: true, selected: false };
              }
              return t;
            });
            recalculateFreeState(matchedTiles);
            setTiles(matchedTiles);
            setSelectedTile(null);
            setIsMemoryProcessing(false);

            // Audio & Spark Effect
            soundSynth.playMatch();
            triggerSparkMatchEvent(tile1, tile2);

            // Check game conditions
            checkGameStatus(matchedTiles);
          }, 600);
        } else {
          // No match! Hide them again after a delay
          setTimeout(() => {
            const hiddenTiles = updated.map(t => {
              if (t.id === tile1.id || t.id === tile2.id) {
                return { ...t, revealed: false, selected: false };
              }
              return t;
            });
            setTiles(hiddenTiles);
            setSelectedTile(null);
            setIsMemoryProcessing(false);
            soundSynth.playClick();
          }, 1200);
        }
      }
      return;
    }

    // --- GAMEPLAY MODE: STANDARD SOLITAIRE / DAILY ---
    soundSynth.playSelect();

    if (!selectedTile) {
      // First tile selection
      const updated = tiles.map(t => {
        if (t.id === clicked.id) return { ...t, selected: true };
        return { ...t, selected: false }; // Clear other selections
      });
      setTiles(updated);
      setSelectedTile({ ...clicked, selected: true });
    } else {
      // Second tile selection
      if (selectedTile.id === clicked.id) {
        // Clicked the same tile again -> deselect it
        const updated = tiles.map(t => t.id === clicked.id ? { ...t, selected: false } : t);
        setTiles(updated);
        setSelectedTile(null);
        return;
      }

      if (tilesMatch(selectedTile, clicked)) {
        // Matching pair selected! Clear them!
        const tile1 = selectedTile;
        const tile2 = clicked;

        const updated = tiles.map(t => {
          if (t.id === tile1.id || t.id === tile2.id) {
            return { ...t, matched: true, selected: false };
          }
          return t;
        });

        // Recalculate free/blocked states
        recalculateFreeState(updated);
        setTiles(updated);
        setSelectedTile(null);
        setHintedPair(null);

        // Combo Streak Calculation (#1)
        const now = getCurrentTime();
        const elapsed = now - lastMatchTimeRef.current;
        let newMultiplier = 1;
        if (lastMatchTimeRef.current > 0 && elapsed < 3000) {
          newMultiplier = Math.min(comboMultiplier + 1, 10);
        }
        lastMatchTimeRef.current = now;
        setComboMultiplier(newMultiplier);

        // Achievement check: Combo catalyst
        if (newMultiplier >= 5) {
          unlockAchievement('combo_master');
        }

        // Score with combo multiplier
        const matchScore = 100 * newMultiplier;
        setScore(prev => prev + matchScore);
        setMoveCount(prev => prev + 1);

        // Show combo popup if multiplier > 1
        if (newMultiplier > 1) {
          setComboPopup({ text: `+${matchScore} x${newMultiplier}`, key: now });
          setTimeout(() => setComboPopup(null), 1200);
        }

        // Record for Undo stack
        setUndoStack(prev => [...prev, { tile1, tile2 }]);

        // Bonus time in Timed mode (+5s per match)
        if (gameMode === 'timed') {
          setCountdownTimer(prev => prev + 5);
        }

        // Audio & Visual Event Sparks (Escalate pitch depending on Combo)
        if (newMultiplier > 1) {
          soundSynth.playComboChime(newMultiplier);
        } else {
          soundSynth.playMatch();
        }
        triggerSparkMatchEvent(tile1, tile2);

        // Check victory & possible moves
        checkGameStatus(updated);
      } else {
        // Not a match! Change selection to the newly clicked tile
        const updated = tiles.map(t => {
          if (t.id === clicked.id) return { ...t, selected: true };
          return { ...t, selected: false };
        });
        setTiles(updated);
        setSelectedTile({ ...clicked, selected: true });
      }
    }
  };

  // Emits global custom event to trigger canvas sparkles
  const triggerSparkMatchEvent = (t1: TileState, t2: TileState) => {
    const event = new CustomEvent('tile-match', {
      detail: { x1: t1.x, y1: t1.y, x2: t2.x, y2: t2.y }
    });
    window.dispatchEvent(event);
  };

  // Inspects remaining moves and victory parameters
  const checkGameStatus = (activeTiles: TileState[]) => {
    const remaining = activeTiles.filter(t => !t.matched).length;

    if (remaining === 0) {
      // Victory!
      stopTimer();
      stopCountdown();
      soundSynth.playVictory();

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

      // Progressive Level Unlock (#5)
      const currentLevel = getLevelNum(activeLayout);
      const nextLevel = currentLevel + 1;
      if (nextLevel <= 5 && !unlockedLevels.includes(nextLevel)) {
        const newUnlocked = [...unlockedLevels, nextLevel];
        setUnlockedLevels(newUnlocked);
        localStorage.setItem('vita_unlocked_levels', JSON.stringify(newUnlocked));
      }

      setShowWinScreen(true);

      // Save daily completed stamps
      if (gameMode === 'daily') {
        const todayStr = new Date().toISOString().split('T')[0];
        try {
          const stored = localStorage.getItem('vita_mahjong_dailies');
          const dailies: string[] = stored ? JSON.parse(stored) : [];
          if (!dailies.includes(todayStr)) {
            dailies.push(todayStr);
            localStorage.setItem('vita_mahjong_dailies', JSON.stringify(dailies));
          }
        } catch (e) {
          console.warn("Could not save daily stamp:", e);
        }
      }

      // --- Zen Achievements Validation ---
      unlockAchievement('zen_beginner');

      if (timer <= 180) {
        unlockAchievement('speedy_thinker');
      }

      if (hintsUsedRef.current === 0 && shufflesUsedRef.current === 0) {
        unlockAchievement('mindful_path');
      }

      if (gameMode === 'timed') {
        unlockAchievement('time_survivor');
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

      try {
        const storedStamps = localStorage.getItem('vita_mahjong_dailies');
        const stamps: string[] = storedStamps ? JSON.parse(storedStamps) : [];
        let totalStamps = stamps.length;
        const todayStr = new Date().toISOString().split('T')[0];
        if (gameMode === 'daily' && !stamps.includes(todayStr)) {
          totalStamps += 1;
        }
        if (totalStamps >= 3) {
          unlockAchievement('daily_devotee');
        }
      } catch (e) {
        console.warn("Could not check daily devotee achievement:", e);
      }

      return;
    }

    // Recalculate remaining matches
    const moves = findAvailableMoves(activeTiles);
    setPossibleMovesCount(moves.length);

    // If no moves remaining and tiles still on board -> show warning
    if (moves.length === 0 && remaining > 0 && gameMode !== 'memory') {
      soundSynth.playClick();
      setShowNoMovesModal(true);
    }
  };

  // Shuffles active tiles while ensuring at least one solvable move
  const handleShuffle = () => {
    if (shufflesRemaining <= 0 && gameMode !== 'memory') return;
    soundSynth.playShuffle();
    const shuffled = shuffleActiveTiles([...tiles]);
    setTiles(shuffled);
    setSelectedTile(null);
    setHintedPair(null);
    setShowNoMovesModal(false);
    if (gameMode !== 'memory') {
      setShufflesRemaining(prev => Math.max(0, prev - 1));
      setScore(prev => Math.max(0, prev - 50));
      shufflesUsedRef.current += 1;
    }
    // Reset combo on shuffle
    setComboMultiplier(1);
    lastMatchTimeRef.current = 0;

    // Re-check moves
    const moves = findAvailableMoves(shuffled);
    setPossibleMovesCount(moves.length);
  };

  // Reverts the last matching pair back to the grid
  const handleUndo = () => {
    if (undoStack.length === 0 || gameMode === 'memory') return;

    soundSynth.playShuffle();
    const lastAction = undoStack[undoStack.length - 1];
    const { tile1, tile2 } = lastAction;

    // Restore matched properties
    const restored = tiles.map(t => {
      if (t.id === tile1.id || t.id === tile2.id) {
        return { ...t, matched: false, selected: false };
      }
      return t;
    });

    recalculateFreeState(restored);
    setTiles(restored);
    setSelectedTile(null);
    setHintedPair(null);
    setUndoStack(prev => prev.slice(0, -1));
    setShowNoMovesModal(false);

    const moves = findAvailableMoves(restored);
    setPossibleMovesCount(moves.length);
  };

  // Auto-finds a matching pair and flashes them to the user
  const handleHint = () => {
    if (hintsRemaining <= 0 && gameMode !== 'memory') return;
    const moves = findAvailableMoves(tiles);
    if (moves.length > 0) {
      soundSynth.playSelect();
      const pair = moves[0];
      setHintedPair([pair[0].id, pair[1].id]);
      if (gameMode !== 'memory') {
        setHintsRemaining(prev => Math.max(0, prev - 1));
        setScore(prev => Math.max(0, prev - 50));
        hintsUsedRef.current += 1;
      }

      // Remove hint highlights after 3 seconds
      setTimeout(() => {
        setHintedPair(null);
      }, 3000);
    } else {
      soundSynth.playClick();
    }
  };

  const handleBackToMenu = () => {
    soundSynth.playClick();
    stopTimer();
    stopCountdown();
    setGameMode('menu');
  };

  // Render stopwatch helper (MM:SS)
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getLevelNum = (layout: LayoutName) => {
    const mapping: Record<LayoutName, number> = {
      'Turtle': 1,
      'Castle': 2,
      'Pyramids': 3,
      'Butterfly': 4,
      'Cat': 5
    };
    return mapping[layout] || 1;
  };

  const cycleTheme = () => {
    soundSynth.playClick();
    const themes = ['zen', 'ocean', 'sunset', 'dark'];
    const nextIdx = (themes.indexOf(bgTheme) + 1) % themes.length;
    setBgTheme(themes[nextIdx]);
  };

  // Background Theme Styling Class
  const themeClass = `app-theme-${bgTheme}`;

  const tilesLeft = tiles.filter(t => !t.matched).length;
  const progressPercent = totalTileCount > 0 ? Math.round(((totalTileCount - tilesLeft) / totalTileCount) * 100) : 0;

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

      {/* --- MENU LAYER --- */}
      {gameMode === 'menu' && (
        <MainMenu
          onStartGame={(mode) => initGame(mode as typeof gameMode, activeLayout)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          unlockedLevels={unlockedLevels}
        />
      )}

      {/* --- SOLITAIRE GAMEBOARD LAYER --- */}
      {gameMode !== 'menu' && (
        <div className="gameplay-wrapper">
          {/* Mobile Green Felt Status Header */}
          <header className="game-header">
            <div className="header-left">
              <button className="back-menu-btn" onClick={handleBackToMenu} title="Main Menu" aria-label="Back to main menu">
                ←
              </button>
            </div>

            <div className="header-center">
              <h1 className="level-title">Level {getLevelNum(activeLayout)}</h1>
            </div>

            <div className="header-right">
              <button className="icon-btn theme-cycle-btn" onClick={cycleTheme} title="Change Theme" aria-label="Change Theme">
                🎨
              </button>
              <button className="icon-btn settings-menu-btn" onClick={() => { soundSynth.playClick(); setIsSettingsOpen(true); }} title="Settings Menu" aria-label="Settings Menu">
                ≡
              </button>
            </div>
          </header>

          {/* Translucent stats pills row */}
          <div className="header-sub-stats">
            <div className="stat-pill-score">
              <span className="stat-pill-label">Score</span>
              <span className="stat-pill-val">{score}</span>
            </div>
            {comboMultiplier > 1 && (
              <div className="stat-pill-combo">
                <span className="combo-fire">🔥</span>
                <span className="stat-pill-val">x{comboMultiplier}</span>
              </div>
            )}
            {gameMode === 'timed' && (
              <div className={`stat-pill-countdown ${countdownTimer <= 30 ? 'countdown-urgent' : ''}`}>
                <span className="stat-pill-label">⏱️</span>
                <span className="stat-pill-val">{formatTime(countdownTimer)}</span>
              </div>
            )}
            <div className="stat-pill-matches">
              <span className="stat-pill-label">Moves</span>
              <span className="stat-pill-val">{moveCount}</span>
            </div>
          </div>

          {/* Progress bar (#17) */}
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            <span className="progress-bar-text">{tilesLeft} / {totalTileCount} remaining</span>
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
                styleSet={styleSet}
                highContrast={highContrast}
                hintedPair={hintedPair}
                onTileClick={handleTileClick}
                bgTheme={bgTheme}
              />
            )}
          </main>

          {/* Warm Wooden Deck Action Footer Toolbar */}
          <footer className="game-footer-toolbar">
            <div className="toolbar-actions">
              <button
                className="footer-circle-btn shuffle-btn"
                onClick={handleShuffle}
                disabled={tilesLeft === 0 || (shufflesRemaining === 0 && gameMode !== 'memory') || gameMode === 'memory' || gameMode === 'timed'}
                title="Shuffle unmatched tiles"
                aria-label="Shuffle"
              >
                <div className="btn-icon-wrapper">
                  <ShuffleIcon size={24} />
                </div>
                {gameMode !== 'memory' && shufflesRemaining > 0 && (
                  <span className="btn-badge">{shufflesRemaining}</span>
                )}
              </button>

              <button
                className="footer-circle-btn hint-btn"
                onClick={handleHint}
                disabled={possibleMovesCount === 0 || (hintsRemaining === 0 && gameMode !== 'memory') || gameMode === 'memory'}
                title="Show a matching pair hint"
                aria-label="Hint"
              >
                <div className="btn-icon-wrapper">
                  <HintIcon size={24} />
                </div>
                {gameMode !== 'memory' && hintsRemaining > 0 && (
                  <span className="btn-badge">{hintsRemaining}</span>
                )}
              </button>

              <button
                className="footer-circle-btn undo-btn"
                onClick={handleUndo}
                disabled={undoStack.length === 0 || gameMode === 'memory' || gameMode === 'timed'}
                title="Undo last matching move"
                aria-label="Undo"
              >
                <div className="btn-icon-wrapper">
                  <UndoIcon size={24} />
                </div>
              </button>
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
        styleSet={styleSet}
        setStyleSet={setStyleSet}
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
          if (gameMode !== 'menu') {
            initGame(gameMode, layout);
          }
        }}
      />

      {/* --- GENTLE STALEMATE WARNING MODAL (NO MOVES REMAINING) --- */}
      {showNoMovesModal && (
        <div className="modal-overlay">
          <div className="modal-container glassmorphism stalemate-modal">
            <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ShuffleIcon size={22} inline /> No Matches Left
            </h3>
            <p>Don't worry! This is normal. You can shuffle the remaining tiles or undo a couple of moves to try a different strategy path.</p>
            <div className="stalemate-buttons">
              <button className="confirm-btn glassmorphism" onClick={handleShuffle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShuffleIcon size={16} inline /> Shuffle Remaining
              </button>
              <button className="cancel-btn glassmorphism" onClick={handleUndo} disabled={undoStack.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UndoIcon size={16} inline /> Undo Last Move
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
              {gameMode === 'daily' && (
                <div className="v-stat stamp-earned">
                  <span className="v-stat-lbl">Daily Stamp</span>
                  <span className="v-stat-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <EarnedStampIcon size={16} inline /> Earned!
                  </span>
                </div>
              )}
            </div>

            <div className="victory-buttons">
              <button className="confirm-btn glassmorphism" onClick={() => initGame(gameMode, activeLayout)} style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <RestartIcon size={16} inline /> Play Again
              </button>
              <button className="cancel-btn glassmorphism" onClick={handleBackToMenu} style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <BackIcon size={16} inline /> Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TIME'S UP MODAL (Timed Mode) --- */}
      {showTimeUpModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-container glassmorphism stalemate-modal text-center animate-scale-up">
            <h2 style={{ color: '#ff6b6b' }}>⏰ Time's Up!</h2>
            <p>You ran out of time with {tilesLeft} tiles remaining. Try again!</p>
            <div className="victory-stats">
              <div className="v-stat">
                <span className="v-stat-lbl">Score</span>
                <span className="v-stat-val">{score.toLocaleString()}</span>
              </div>
              <div className="v-stat">
                <span className="v-stat-lbl">Tiles Cleared</span>
                <span className="v-stat-val">{totalTileCount - tilesLeft} / {totalTileCount}</span>
              </div>
            </div>
            <div className="stalemate-buttons">
              <button className="confirm-btn glassmorphism" onClick={() => initGame('timed', activeLayout)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RestartIcon size={16} inline /> Try Again
              </button>
              <button className="cancel-btn glassmorphism" onClick={handleBackToMenu} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
    </div>
  );
};

export default App;
