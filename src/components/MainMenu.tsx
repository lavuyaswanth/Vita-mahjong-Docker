import React, { useState } from 'react';
import { soundSynth } from '../mahjong/soundSynth';
import { achievementsList } from '../mahjong/achievements';
import logoImg from '../assets/logo.png';
import {
  SettingsIcon,
  HelpIcon,
  PlayIcon,
  CloseIcon
} from './SvgIcons';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenSettings: () => void;
  unlockedLevels: number[];
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenSettings,
  unlockedLevels
}) => {
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

  const handlePlayClick = () => {
    soundSynth.playClick();
    onStartGame();
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
        <p className="menu-subtitle">A Soothing, Senior-Friendly Mahjong Solitaire Match Game</p>
        {unlockedLevels.length > 1 && (
          <p className="menu-unlock-badge">🏆 {unlockedLevels.length}/5 Boards Unlocked</p>
        )}
      </div>

      {/* Central Hero: Classic Play Medallion */}
      <div className="menu-play-zone">
        <div className="menu-medallion-container">
          <div className="medallion-glow"></div>
          {/* Concentric rotating plates */}
          <div className="medallion-plate-outer"></div>
          <div className="medallion-plate-inner"></div>

          {/* Main glossy Pill play action — starts the Mahjong Solitaire game with the tray */}
          <button
            className="medallion-play-btn"
            onClick={handlePlayClick}
            aria-label="Start Mahjong Solitaire"
          >
            <span className="play-btn-glow"></span>
            <div className="play-btn-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlayIcon size={38} />
            </div>
            <div className="play-btn-text-group">
              <span className="play-btn-primary">PLAY</span>
              <span className="play-btn-secondary">Mahjong Solitaire</span>
            </div>
          </button>
        </div>

        <p className="menu-board-hint">Tap the gear to choose your puzzle level shape</p>
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
                    <h4>Collect Tiles Into Your Tray</h4>
                    <p>Tap a free tile to slide it up into your <strong>4-slot tray</strong>. When two identical tiles meet in the tray they clear automatically and score. Clear the whole board to win — but if all 4 slots fill with no match, the round pauses.</p>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-num">2</span>
                  <div>
                    <h4>Use "Free" Tiles Only</h4>
                    <p>A tile is only selectable if it is <strong>free</strong>: it has <strong>no tile stacked on top of it</strong> and at least one of its sides (<strong>left or right</strong>) is open. Blocked tiles are dimmed until you uncover them.</p>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-num">3</span>
                  <div>
                    <h4>Special Matching Types</h4>
                    <p>All <strong>Seasons</strong> tiles (Spring, Summer, Autumn, Winter) match with one another. All <strong>Flowers</strong> tiles (Plum, Orchid, Bamboo, Chrysanthemum) match with one another.</p>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-num">4</span>
                  <div>
                    <h4>Booster Helpers</h4>
                    <p>Stuck? <strong>Shuffle</strong> reshuffles the remaining tiles, <strong>Hint</strong> reveals a safe move, <strong>Undo</strong> returns your last collected tile to the board, and <strong>Magnet</strong> pulls several tiles back at once. Each booster has a stock shown on its badge — win levels to earn more!</p>
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
    default:
      return null;
  }
};

export default MainMenu;
