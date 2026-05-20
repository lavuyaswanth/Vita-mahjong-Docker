import React, { useState } from 'react';
import { soundSynth } from '../mahjong/soundSynth';
import logoImg from '../assets/logo.png';

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
      {/* Falling Cherry Blossoms Particle Layer */}
      <div className="cherry-blossoms-container">
        <div className="petal"></div>
        <div className="petal"></div>
        <div className="petal"></div>
        <div className="petal"></div>
        <div className="petal"></div>
        <div className="petal"></div>
        <div className="petal"></div>
        <div className="petal"></div>
        <div className="petal"></div>
        <div className="petal"></div>
      </div>

      {/* Top Quick Settings Bar */}
      <div className="menu-top-actions">
        <button 
          className="menu-circle-btn" 
          onClick={() => { soundSynth.playClick(); onOpenSettings(); }} 
          title="Board Styles & Shapes"
        >
          ⚙️
        </button>
        <button 
          className="menu-circle-btn" 
          onClick={() => { soundSynth.playClick(); setShowHowToPlay(true); }} 
          title="How to Play"
        >
          📖
        </button>
      </div>

      {/* Brand Hero Header */}
      <div className="menu-hero-header">
        <div className="logo-glow-behind"></div>
        <img src={logoImg} className="menu-logo-img" alt="Vita Mahjong Logo" />
        <p className="menu-subtitle">A Soothing, Senior-Friendly Solitaire Match & Brain-Training game</p>
      </div>

      {/* Central Interactive Gameplay Zone */}
      <div className="menu-game-zone">
        
        {/* Left Side: Tasks (Memory Mode) */}
        <div className="menu-card glassmorphism memory-card" onClick={() => handlePlayClick('memory')}>
          <span className="card-badge">Brain Health</span>
          <div className="menu-card-icon">🧠</div>
          <h3>Memory Match</h3>
          <p>Tiles face down. Remember layout pairs to boost cognitive recall.</p>
          <button className="play-card-btn">Memory Mode</button>
        </div>

        {/* Center Hero: Classic Play Medallion */}
        <div className="menu-medallion-container">
          <div className="medallion-glow"></div>
          {/* Concentric rotating plates */}
          <div className="medallion-plate-outer"></div>
          <div className="medallion-plate-inner"></div>
          
          {/* Main glossy Pill play action */}
          <button 
            className="medallion-play-btn" 
            onClick={() => handlePlayClick('solitaire')}
            aria-label="Start Classic Solitaire Mode"
          >
            <span className="play-btn-glow"></span>
            <span className="play-btn-icon">🐢</span>
            <div className="play-btn-text-group">
              <span className="play-btn-primary">PLAY SOLITAIRE</span>
              <span className="play-btn-secondary">Classic Match Mode</span>
            </div>
          </button>
        </div>

        {/* Right Side: Daily challenge stamp quest */}
        <div className="menu-card glassmorphism daily-card" onClick={() => handlePlayClick('daily')}>
          <span className="card-badge gold-badge">Daily Seed</span>
          <div className="menu-card-icon">📅</div>
          <h3>Daily Zen Quest</h3>
          <p>Unique challenge puzzle. Earn visual stamps for calendar progress.</p>
          <button className="play-card-btn">Daily Play</button>
        </div>

      </div>

      {/* Calendar Stamps Dashboard */}
      <div className="menu-dashboard-wrapper">
        <div className="menu-dashboard glassmorphism">
          <div className="dashboard-item">
            <h4>🌸 Weekly Zen Challenge Stamps</h4>
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
                    <div className="stamp-seal-outer">
                      <span className="stamp-graphic">{isCompleted ? '💮' : '⚪'}</span>
                    </div>
                    <span className="stamp-date">{day.getDate()}</span>
                  </div>
                );
              })}
            </div>
          </div>
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
                <div className="rule-item">
                  <span className="rule-num">1</span>
                  <div>
                    <h4>Match Identical Tiles</h4>
                    <p>Click two identical tiles to clear them from the board. Clearance reveals tiles below and unlocks new possibilities.</p>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-num">2</span>
                  <div>
                    <h4>Use "Free" Tiles Only</h4>
                    <p>A tile is only selectable if it is <strong>free</strong>. This means it has <strong>no tiles stacked on top of it</strong> AND it has <strong>no neighbor tile on either its immediate left OR right</strong>.</p>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-num">3</span>
                  <div>
                    <h4>Special Matching Types</h4>
                    <p>All **Seasons** tiles (Spring, Summer, Autumn, Winter) match with one another. All **Flowers** tiles (Plum, Orchid, Bamboo, Chrysanthemum) match with one another.</p>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-num">4</span>
                  <div>
                    <h4>Unique Memory Mode</h4>
                    <p>In memory training, matching tiles are initially face-down. Reveal a tile by clicking it. Match them by keeping track of where their duplicates are hidden!</p>
                  </div>
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
