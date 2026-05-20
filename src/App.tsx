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

interface UndoAction {
  tile1: TileState;
  tile2: TileState;
}

export const App: React.FC = () => {
  // Navigation State
  const [gameMode, setGameMode] = useState<'menu' | 'solitaire' | 'memory' | 'daily'>('menu');
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

  // Set up board state when starting or restarting
  const initGame = (mode: typeof gameMode, layout: LayoutName) => {
    setGameMode(mode);
    setActiveLayout(layout);
    setShowWinScreen(false);
    setShowNoMovesModal(false);
    setUndoStack([]);
    setSelectedTile(null);
    setHintedPair(null);

    let seed: number | undefined;
    if (mode === 'daily') {
      seed = getDailyChallengeSeed(new Date());
    }

    const newTiles = buildBoard(layout, seed);
    
    // In Memory Mode, tiles start face-down (revealed = false)
    if (mode === 'memory') {
      newTiles.forEach(t => t.revealed = false);
    } else {
      // In classic mode, all tiles are face up (revealed = true)
      newTiles.forEach(t => t.revealed = true);
    }

    setTiles(newTiles);
    startTimer();

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

        // Record for Undo stack
        setUndoStack(prev => [...prev, { tile1, tile2 }]);

        // Audio & Visual Event Sparks
        soundSynth.playMatch();
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
      soundSynth.playVictory();
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
    soundSynth.playShuffle();
    const shuffled = shuffleActiveTiles([...tiles]);
    setTiles(shuffled);
    setSelectedTile(null);
    setHintedPair(null);
    setShowNoMovesModal(false);

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
    const moves = findAvailableMoves(tiles);
    if (moves.length > 0) {
      soundSynth.playSelect();
      const pair = moves[0];
      setHintedPair([pair[0].id, pair[1].id]);

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
    setGameMode('menu');
  };

  // Render stopwatch helper (MM:SS)
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Background Theme Styling Class
  const themeClass = `app-theme-${bgTheme}`;
  const totalTiles = tiles.length;
  const tilesLeft = tiles.filter(t => !t.matched).length;

  return (
    <div className={`app-root ${themeClass}`}>
      {/* Dynamic particles in background header */}
      <div className="relaxing-canopy"></div>

      {/* --- MENU LAYER --- */}
      {gameMode === 'menu' && (
        <MainMenu
          onStartGame={(mode) => initGame(mode, activeLayout)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* --- SOLITAIRE GAMEBOARD LAYER --- */}
      {gameMode !== 'menu' && (
        <div className="gameplay-wrapper">
          {/* Relaxing Status Panel */}
          <header className="game-header">
            <div className="header-left">
              <button className="back-menu-btn" onClick={handleBackToMenu} title="Main Menu">
                ←
              </button>
              <span className="layout-badge">
                {layouts[activeLayout].displayName}
              </span>
            </div>

            <div className="header-stats">
              <div className="stat-pill">
                <span className="stat-label">🧱</span>
                <span className="stat-value">{tilesLeft}/{totalTiles}</span>
              </div>
              <div className="stat-pill" style={{ opacity: gameMode === 'memory' ? 0.3 : 1 }}>
                <span className="stat-label">🤝</span>
                <span className="stat-value">{possibleMovesCount}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">⏱️</span>
                <span className="stat-value">{formatTime(timer)}</span>
              </div>
            </div>

            <div className="header-right">
              <button className="icon-btn" onClick={() => { soundSynth.playClick(); setIsSettingsOpen(true); }} title="Settings">
                ⚙️
              </button>
            </div>
          </header>

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

          {/* Core toolbar footer containing solver tools */}
          <footer className="game-footer-toolbar">
            <div className="toolbar-actions">
              <button
                className="tool-action-btn"
                onClick={handleUndo}
                disabled={undoStack.length === 0 || gameMode === 'memory'}
                title="Undo last matching move"
              >
                ↩️
              </button>
              <button
                className="tool-action-btn"
                onClick={handleHint}
                disabled={possibleMovesCount === 0 || gameMode === 'memory'}
                title="Show a matching pair hint"
              >
                💡
              </button>
              <button
                className="tool-action-btn"
                onClick={handleShuffle}
                disabled={tilesLeft === 0 || gameMode === 'memory'}
                title="Shuffle unmatched tiles"
              >
                🔀
              </button>
              <button
                className="tool-action-btn"
                onClick={() => initGame(gameMode, activeLayout)}
                title="Restart Puzzle"
              >
                🔄
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
            <h3>🔀 No Matches Left</h3>
            <p>Don't worry! This is normal. You can shuffle the remaining tiles or undo a couple of moves to try a different strategy path.</p>
            <div className="stalemate-buttons">
              <button className="confirm-btn glassmorphism" onClick={handleShuffle}>
                🔀 Shuffle Remaining
              </button>
              <button className="cancel-btn glassmorphism" onClick={handleUndo} disabled={undoStack.length === 0}>
                ↩️ Undo Last Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VICTORY SCREEN OVERLAY --- */}
      {showWinScreen && (
        <div className="modal-overlay victory-overlay animate-fade-in">
          <div className="modal-container glassmorphism victory-modal text-center animate-scale-up">
            <span className="victory-icon">🌸</span>
            <h2>Puzzle Solved!</h2>
            <p>Congratulations, you have cleared all tiles! Your mind is relaxed and active.</p>
            
            <div className="victory-stats">
              <div className="v-stat">
                <span className="v-stat-lbl">Time Elapsed</span>
                <span className="v-stat-val">{formatTime(timer)}</span>
              </div>
              <div className="v-stat">
                <span className="v-stat-lbl">Puzzle Shape</span>
                <span className="v-stat-val">{layouts[activeLayout].displayName}</span>
              </div>
              {gameMode === 'daily' && (
                <div className="v-stat stamp-earned">
                  <span className="v-stat-lbl">Daily Stamp</span>
                  <span className="v-stat-val">🌸 Earned!</span>
                </div>
              )}
            </div>

            <div className="victory-buttons">
              <button className="confirm-btn glassmorphism" onClick={() => initGame(gameMode, activeLayout)}>
                🔄 Play Again
              </button>
              <button className="cancel-btn glassmorphism" onClick={handleBackToMenu}>
                🏠 Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
