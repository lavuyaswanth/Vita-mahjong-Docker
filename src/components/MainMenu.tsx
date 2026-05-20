import React, { useState } from 'react';
import { soundSynth } from '../mahjong/soundSynth';

interface MainMenuProps {
  onStartGame: (mode: 'solitaire' | 'memory' | 'daily') => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenSettings
}) => {
  const [completedDailies] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('vita_mahjong_dailies');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn("Could not load daily progress:", e);
      return [];
    }
  });
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handlePlayClick = (mode: 'solitaire' | 'memory' | 'daily') => {
    soundSynth.playVictory();
    onStartGame(mode);
  };

  return (
    <div className="main-menu-container">
      {/* Title */}
      <div className="menu-hero-header">
        <h1 className="menu-title">🀄 VITA MAHJONG</h1>
        <p className="menu-subtitle">A Soothing, Senior-Friendly Solitaire Match & Brain-Training game</p>
      </div>

      {/* Main Mode Select Box */}
      <div className="menu-cards-row">
        {/* Card 1: Relaxing Solitaire */}
        <div className="menu-card glassmorphism highlighted-card" onClick={() => handlePlayClick('solitaire')}>
          <div className="menu-card-icon">🐢</div>
          <h3>Relaxing Solitaire</h3>
          <p>Traditional tile matching. Take your time, clear the board, use unlimited shuffles and hints. No stress, pure peace.</p>
          <button className="play-card-btn">Classic Mode</button>
        </div>

        {/* Card 2: Active Mind Memory Mode */}
        <div className="menu-card glassmorphism memory-card" onClick={() => handlePlayClick('memory')}>
          <div className="menu-card-icon">🧠</div>
          <span className="card-badge">Improvement</span>
          <h3>Memory Mahjong</h3>
          <p>A cognitive booster! Tiles are flipped face-down. Click to reveal, and match pairs by remembering locations on the stack.</p>
          <button className="play-card-btn">Memory Mode</button>
        </div>

        {/* Card 3: Daily Challenge */}
        <div className="menu-card glassmorphism daily-card" onClick={() => handlePlayClick('daily')}>
          <div className="menu-card-icon">📅</div>
          <h3>Daily Zen Quest</h3>
          <p>Play the unique seeded puzzle of the day. Earn visual completion stamps and build a relaxation calendar habit.</p>
          <button className="play-card-btn">Daily Play</button>
        </div>
      </div>

      {/* Quick Dashboard */}
      <div className="menu-dashboard glassmorphism">
        <div className="dashboard-item">
          <h4>📅 Daily Challenge Stamps</h4>
          <div className="stamps-row">
            {Array.from({ length: 7 }).map((_, idx) => {
              const day = new Date();
              day.setDate(day.getDate() - (6 - idx));
              const dateString = day.toISOString().split('T')[0];
              const isCompleted = completedDailies.includes(dateString);
              const weekday = day.toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <div key={idx} className={`stamp-cell ${isCompleted ? 'earned' : ''}`}>
                  <span className="stamp-day">{weekday}</span>
                  <span className="stamp-graphic">{isCompleted ? '🌸' : '⚪'}</span>
                  <span className="stamp-date">{day.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Toolbar Footer inside Dashboard */}
        <div className="dashboard-buttons">
          <button className="menu-action-btn glassmorphism" onClick={() => { soundSynth.playClick(); onOpenSettings(); }}>
            ⚙️ Settings & Board Shapes
          </button>
          <button className="menu-action-btn glassmorphism" onClick={() => { soundSynth.playClick(); setShowHowToPlay(true); }}>
            📖 How To Play
          </button>
        </div>
      </div>

      {/* How To Play Modal */}
      {showHowToPlay && (
        <div className="modal-overlay" onClick={() => setShowHowToPlay(false)}>
          <div className="modal-container glassmorphism how-to-play-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📖 How to Play Mahjong Solitaire</h2>
              <button className="modal-close-btn" onClick={() => setShowHowToPlay(false)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="rules-grid">
                <div>
                  <h4>1. Match Identical Tiles</h4>
                  <p>Click two identical tiles to clear them from the board. Clearance reveals tiles below and unlocks new possibilities.</p>
                </div>
                <div>
                  <h4>2. Use "Free" Tiles Only</h4>
                  <p>A tile is only selectable if it is <strong>free</strong>. This means it has <strong>no tiles stacked on top of it</strong> AND it has <strong>no neighbor tile on either its immediate left OR right</strong>.</p>
                </div>
                <div>
                  <h4>3. Special Matching Types</h4>
                  <p>All **Seasons** tiles (Spring, Summer, Autumn, Winter) match with one another. All **Flowers** tiles (Plum, Orchid, Bamboo, Chrysanthemum) match with one another.</p>
                </div>
                <div>
                  <h4>4. Unique Memory Mode</h4>
                  <p>In memory training, matching tiles are initially face-down. Reveal a tile by clicking it. Match them by keeping track of where their duplicates are hidden!</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="confirm-btn glassmorphism" onClick={() => setShowHowToPlay(false)}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;
