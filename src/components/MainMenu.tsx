import React, { useState } from 'react';
import { soundSynth } from '../mahjong/soundSynth';
import logoImg from '../assets/logo.png';
import {
  SettingsIcon,
  HelpIcon,
  BrainIcon,
  PlayIcon,
  CalendarIcon,
  EarnedStampIcon,
  EmptyStampIcon,
  CloseIcon
} from './SvgIcons';

interface MainMenuProps {
  onStartGame: (mode: 'solitaire' | 'memory' | 'daily' | 'timed') => void;
  onOpenSettings: () => void;
  unlockedLevels: number[];
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenSettings,
  unlockedLevels
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
  const [showAchievements, setShowAchievements] = useState(false);
  const [unlockedAchievements] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('vita_achievements');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [hasNewAchievements, setHasNewAchievements] = useState(() => {
    try {
      const storedUnlocked = localStorage.getItem('vita_achievements');
      const unlocked: string[] = storedUnlocked ? JSON.parse(storedUnlocked) : [];
      const storedViewed = localStorage.getItem('vita_viewed_achievements');
      const viewed: string[] = storedViewed ? JSON.parse(storedViewed) : [];
      return unlocked.some(id => !viewed.includes(id));
    } catch {
      return false;
    }
  });

  const handleOpenAchievements = () => {
    soundSynth.playClick();
    setShowAchievements(true);
    try {
      const storedUnlocked = localStorage.getItem('vita_achievements');
      if (storedUnlocked) {
        localStorage.setItem('vita_viewed_achievements', storedUnlocked);
        setHasNewAchievements(false);
      }
    } catch (e) {
      console.warn("Could not save viewed achievements:", e);
    }
  };

  const handlePlayClick = (mode: 'solitaire' | 'memory' | 'daily' | 'timed') => {
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
          aria-label="Settings"
        >
          <SettingsIcon size={20} />
        </button>
        <button 
          className="menu-circle-btn achievements-btn" 
          onClick={handleOpenAchievements} 
          title="Trophy Room & Achievements"
          aria-label="View achievements"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 2a5 5 0 00-5 5v3c0 2.2 1.8 4 4 4v1.2C9.4 15.6 8 17.6 8 20h8c0-2.4-1.4-4.4-3-4.8V14c2.2 0 4-1.8 4-4V7a5 5 0 00-5-5zM9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v3H9V7zm3 15c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2z"/>
          </svg>
          {hasNewAchievements && <span className="badge-dot"></span>}
        </button>
        <button 
          className="menu-circle-btn" 
          onClick={() => { soundSynth.playClick(); setShowHowToPlay(true); }} 
          title="How to Play"
          aria-label="How to play help"
        >
          <HelpIcon size={20} />
        </button>
      </div>

      {/* Brand Hero Header */}
      <div className="menu-hero-header">
        <div className="logo-glow-behind"></div>
        <img src={logoImg} className="menu-logo-img" alt="Vita Mahjong Logo" />
        <p className="menu-subtitle">A Soothing, Senior-Friendly Solitaire Match & Brain-Training game</p>
        {unlockedLevels.length > 1 && (
          <p className="menu-unlock-badge">🏆 {unlockedLevels.length}/5 Levels Unlocked</p>
        )}
      </div>

      {/* Central Interactive Gameplay Zone */}
      <div className="menu-game-zone">
        
        {/* Left Side: Tasks (Memory Mode) */}
        <div className="menu-card glassmorphism memory-card" onClick={() => handlePlayClick('memory')}>
          <span className="card-badge">Brain Health</span>
          <div className="menu-card-icon">
            <BrainIcon size={52} />
          </div>
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
            <div className="play-btn-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlayIcon size={38} />
            </div>
            <div className="play-btn-text-group">
              <span className="play-btn-primary">PLAY SOLITAIRE</span>
              <span className="play-btn-secondary">Classic Match Mode</span>
            </div>
          </button>
        </div>

        {/* Right Side: Daily challenge stamp quest */}
        <div className="menu-card glassmorphism daily-card" onClick={() => handlePlayClick('daily')}>
          <span className="card-badge gold-badge">Daily Seed</span>
          <div className="menu-card-icon">
            <CalendarIcon size={52} />
          </div>
          <h3>Daily Zen Quest</h3>
          <p>Unique challenge puzzle. Earn visual stamps for calendar progress.</p>
          <button className="play-card-btn">Daily Play</button>
        </div>

      </div>

      {/* Timed Rush Mode Card (#4) */}
      <div className="menu-timed-section">
        <div className="menu-card glassmorphism timed-card" onClick={() => handlePlayClick('timed')}>
          <span className="card-badge" style={{ background: 'linear-gradient(135deg, #b71c1c 0%, #7f0000 100%)', borderColor: '#ff5252', color: '#ff8a80' }}>⏱️ Rush</span>
          <div className="menu-card-icon" style={{ fontSize: '44px' }}>⏰</div>
          <h3>Timed Rush</h3>
          <p>Race the clock! Clear the board before time runs out. Each match earns +5 bonus seconds.</p>
          <button className="play-card-btn">Start Rush</button>
        </div>
      </div>

      {/* Calendar Stamps Dashboard */}
      <div className="menu-dashboard-wrapper">
        <div className="menu-dashboard glassmorphism">
          <div className="dashboard-item">
            <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <EarnedStampIcon size={18} inline /> Weekly Zen Challenge Stamps
            </h4>
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
                      <div className="stamp-graphic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isCompleted ? <EarnedStampIcon size={28} /> : <EmptyStampIcon size={28} />}
                      </div>
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
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpIcon size={24} inline /> How to Play Mahjong Solitaire
              </h2>
              <button className="modal-close-btn" onClick={() => setShowHowToPlay(false)} aria-label="Close modal">
                <CloseIcon size={18} />
              </button>
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

      {/* Zen Trophy Room Achievements Modal */}
      {showAchievements && (
        <div className="modal-overlay" onClick={() => setShowAchievements(false)}>
          <div className="modal-container glassmorphism achievements-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏆 Trophy Room & Badges
              </h2>
              <button className="modal-close-btn" onClick={() => setShowAchievements(false)} aria-label="Close modal">
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="modal-content">
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Track your wellness journey and brain milestones. Solving puzzles unlocks Zen badges.
              </p>
              
              <div className="achievements-grid">
                {achievementsList.map(item => {
                  const isUnlocked = unlockedAchievements.includes(item.id);
                  return (
                    <div key={item.id} className={`achievement-badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                      <div className="badge-graphic-container">
                        <BadgeSvg id={item.id} unlocked={isUnlocked} />
                      </div>
                      <div className="badge-info">
                        <span className="badge-name">{item.name}</span>
                        <span className="badge-desc">{item.desc}</span>
                      </div>
                      <span className={`badge-status ${isUnlocked ? 'unlocked-label' : 'locked'}`}>
                        {isUnlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button className="confirm-btn glassmorphism" onClick={() => setShowAchievements(false)}>
                Return to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BadgeSvg: React.FC<{ id: string; unlocked: boolean }> = ({ id, unlocked }) => {
  switch (id) {
    case 'zen_beginner':
      return (
        <svg viewBox="0 0 24 24" className="badge-svg" style={{ color: unlocked ? '#69f0ae' : '#555' }}>
          <path fill="currentColor" d="M12 2C11.5 2 10 3 9 5c-1.5 3 0 7 0 7s-3-2-5-1c-2 1-2.5 3.5-2.5 4 0 .5 2 1.5 4.5.5 2-.8 3-2.5 3-2.5s.2 3.5 1.5 5c1 1.2 2.5 2 2.5 2s-.5-2-.5-3.5c0-2.5 1.5-4.5 1.5-4.5s1 2 1 4.5c0 1.5-.5 3.5-.5 3.5s1.5-.8 2.5-2c1.3-1.5 1.5-5 1.5-5s1 1.7 3 2.5c2.5 1 4.5 0 4.5-.5 0-.5-.5-3-2.5-4-2-1-5 1-5 1s1.5-4 0-7c-1-2-2.5-3-3-3z"/>
        </svg>
      );
    case 'combo_master':
      return (
        <svg viewBox="0 0 24 24" className="badge-svg" style={{ color: unlocked ? '#ff6d00' : '#555' }}>
          <path fill="currentColor" d="M12 2S9.7 5.7 9.7 8.3c0 1.3.8 2.3 2 2.7.2.1.3-.1.3-.3V7.2c0-.5.5-.9.9-.7l.9.6c1.6 1.1 2.6 3 2.6 5 0 3.6-2.9 6.5-6.5 6.5S3.5 15.6 3.5 12c0-4.3 3.5-8.4 8.5-10zm.5 10c0-1 .5-2 1.2-2.7.2-.2.6-.1.6.2.2.8.2 1.7-.2 2.5l-.3.5c-.3.5-.5 1.1-.5 1.7 0 1.2.8 2.2 2 2.5.2 0 .3-.2.3-.3 0-.5-.1-1-.3-1.4 0-.1 0-.3.2-.3h.1c1 .4 1.7 1.4 1.7 2.6 0 2.2-1.8 4-4 4s-4-1.8-4-4c0-2 1.7-4 3.3-5.2.2-.2.5 0 .5.3v.8c0 .7.4 1.3 1 1.6l.2.1z"/>
        </svg>
      );
    case 'speedy_thinker':
      return (
        <svg viewBox="0 0 24 24" className="badge-svg" style={{ color: unlocked ? '#ffd700' : '#555' }}>
          <path fill="currentColor" d="M12 20c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm0-18C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1-7h-2v6h4v-2h-2V7zm2-6h-4v2h4V1zM5 8.5C5.8 7.3 7 6.3 8.3 5.7L7.3 4C5.5 4.8 4 6.2 3.1 8L5 8.5zm14 0l1.9-.5c-.9-1.8-2.4-3.2-4.2-4l-1 1.7c1.3.6 2.5 1.6 3.3 2.8z"/>
        </svg>
      );
    case 'mindful_path':
      return (
        <svg viewBox="0 0 24 24" className="badge-svg" style={{ color: unlocked ? '#ec407a' : '#555' }}>
          <path fill="currentColor" d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10zm0-18c2.2 0 4 .8 5.5 2.1C16.3 7.2 14.3 8 12 8s-4.3-.8-5.5-1.9C8 4.8 9.8 4 12 4zm-7.6 6c1 .5 2.2.8 3.6.8 1.4 0 2.6-.3 3.6-.8l.4 1.2c.4 1.2.6 2.4.6 3.8H4v-5zm15.2 0H16.4v5c0-1.4.2-2.6.6-3.8l.4-1.2c1 .5 2.2.8 3.6.8zm-7.6 6.8c-1.3 0-2.5-.2-3.6-.6-.6 1.4-.9 3-.9 4.8h9c0-1.8-.3-3.4-.9-4.8-1.1.4-2.3.6-3.6.6z"/>
        </svg>
      );
    case 'trophy_collector':
      return (
        <svg viewBox="0 0 24 24" className="badge-svg" style={{ color: unlocked ? '#fb8500' : '#555' }}>
          <path fill="currentColor" d="M12 2L9 6h6l-3-4zm-5 6l1.5 2h7L17 8H7zm-3 5l2 3h12l2-3H4zm-1 6h18v2H3v-2zM8 10h8v3H8v-3zm2-4h4v2h-4V6z"/>
        </svg>
      );
    case 'daily_devotee':
      return (
        <svg viewBox="0 0 24 24" className="badge-svg" style={{ color: unlocked ? '#e53935' : '#555' }}>
          <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-3-9h6v2H9v-2zm0-4h6v2H9V7zm0 8h6v2H9v-2z"/>
        </svg>
      );
    case 'time_survivor':
      return (
        <svg viewBox="0 0 24 24" className="badge-svg" style={{ color: unlocked ? '#29b6f6' : '#555' }}>
          <path fill="currentColor" d="M6 2v6c0 2.2 1.8 4 4 4v0c-2.2 0-4 1.8-4 4v6h12v-6c0-2.2-1.8-4-4-4v0c2.2 0 4-1.8 4-4V2H6zm10 14v4H8v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2zM8 4h8v4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2V4z"/>
        </svg>
      );
    default:
      return null;
  }
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

export default MainMenu;
