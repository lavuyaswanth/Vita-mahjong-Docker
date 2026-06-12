import React from 'react';
import { layouts } from '../mahjong/layouts';
import type { LayoutName } from '../mahjong/layouts';
import { soundSynth } from '../mahjong/soundSynth';
import {
  SettingsIcon,
  LayoutIcon,
  AccessibilityIcon,
  AudioIcon,
  CloseIcon
} from './SvgIcons';

// Selectable background themes — each is fully styled in index.css and drives
// its own particle physics on the board (petals / bubbles / embers / stars).
const THEMES = [
  { id: 'zen', label: 'Zen Forest', emoji: '🌿' },
  { id: 'ocean', label: 'Deep Ocean', emoji: '🌊' },
  { id: 'sunset', label: 'Amber Sunset', emoji: '🌅' },
  { id: 'dark', label: 'Mystic Dark', emoji: '🌌' }
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bgTheme: string;
  setBgTheme: (theme: string) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  sfxVolume: number;
  setSfxVolume: (vol: number) => void;
  ambientVolume: number;
  setAmbientVolume: (vol: number) => void;
  isAmbientEnabled: boolean;
  setIsAmbientEnabled: (val: boolean) => void;
  activeLayout: LayoutName;
  unlockedLevels: number[];
  onSelectLayout: (layout: LayoutName) => void;
  currentLevel: number;
  maxUnlockedLevel: number;
  onSelectLevel: (lvl: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    bgTheme,
    setBgTheme,
    highContrast,
    setHighContrast,
    sfxVolume,
    setSfxVolume,
    ambientVolume,
    setAmbientVolume,
    isAmbientEnabled,
    setIsAmbientEnabled,
    activeLayout,
    unlockedLevels,
    onSelectLayout,
    currentLevel,
    maxUnlockedLevel,
    onSelectLevel
  } = props;
  if (!isOpen) return null;

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setSfxVolume(vol);
    soundSynth.configure(true, vol, ambientVolume);
    soundSynth.playClick();
  };

  const handleAmbientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setAmbientVolume(vol);
    soundSynth.configure(true, sfxVolume, vol);
  };

  const toggleAmbientEnabled = () => {
    const nextVal = !isAmbientEnabled;
    setIsAmbientEnabled(nextVal);
    if (nextVal) {
      soundSynth.startAmbient();
    } else {
      soundSynth.stopAmbient();
    }
    soundSynth.playClick();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glassmorphism" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={24} inline /> Game Settings & Layouts
          </h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close settings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="modal-content">
          {/* Section 1: Level Layout Selector */}
          <div className="settings-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LayoutIcon size={20} inline /> Choose Layout Board
            </h3>
            <div className="layout-cards-grid">
              {Object.values(layouts).map((l, idx) => {
                const levelNum = idx + 1;
                const isLocked = !unlockedLevels.includes(levelNum);
                const bestStarsData = (() => {
                  try {
                    const stored = localStorage.getItem('vita_best_stars');
                    const parsed = stored ? JSON.parse(stored) : {};
                    return parsed[l.name] || 0;
                  } catch { return 0; }
                })();
                return (
                  <div
                    key={l.name}
                    className={`layout-card ${activeLayout === l.name ? 'active' : ''} ${isLocked ? 'layout-locked' : ''}`}
                    onClick={() => {
                      if (isLocked) {
                        soundSynth.playClick();
                        return;
                      }
                      onSelectLayout(l.name);
                      soundSynth.playClick();
                    }}
                    title={isLocked ? `Complete Level ${levelNum - 1} to unlock` : l.description}
                  >
                    <div className="layout-card-badge">{l.coords.length} Tiles</div>
                    {isLocked && <div className="lock-overlay">🔒</div>}
                    <h4>{l.displayName}</h4>
                    {bestStarsData > 0 && (
                      <div className="layout-best-stars">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <span key={i} style={{ opacity: i < bestStarsData ? 1 : 0.25 }}>⭐</span>
                        ))}
                      </div>
                    )}
                    <p>{isLocked ? `Complete Level ${levelNum - 1} to unlock` : l.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campaign Level Progression Selector */}
          <div className="settings-section" style={{ borderTop: '1px solid rgba(201, 168, 76, 0.25)', paddingTop: '20px', marginTop: '10px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎯 Level Progression Campaign
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <label htmlFor="level-select-dropdown" style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Select Active Level:
              </label>
              <select
                id="level-select-dropdown"
                value={currentLevel}
                onChange={(e) => {
                  const lvl = parseInt(e.target.value);
                  onSelectLevel(lvl);
                  soundSynth.playClick();
                }}
                style={{
                  padding: '8px 16px',
                  background: '#2c1709',
                  color: 'white',
                  border: '1.5px solid var(--accent-gold)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
                }}
              >
                {Array.from({ length: maxUnlockedLevel }).map((_, i) => {
                  const lvlNum = i + 1;
                  const layoutsList = ['Garden', 'Pagoda', 'Pyramids', 'Butterfly', 'Turtle'];
                  const layoutName = layoutsList[(lvlNum - 1) % layoutsList.length];
                  return (
                    <option key={lvlNum} value={lvlNum}>
                      Level {lvlNum} ({layoutName})
                    </option>
                  );
                })}
              </select>
              <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                Highest Unlocked: <strong>Level {maxUnlockedLevel} / 240</strong>
              </span>
            </div>
          </div>

          <div className="settings-row-grid">
            {/* Section 2: Visual Adjustments */}
            <div className="settings-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Visual Style
              </h3>

              {/* Background theme picker */}
              <div className="theme-swatch-grid" role="radiogroup" aria-label="Background theme">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    className={`theme-swatch theme-swatch-${t.id} ${bgTheme === t.id ? 'active' : ''}`}
                    role="radio"
                    aria-checked={bgTheme === t.id}
                    onClick={() => { setBgTheme(t.id); soundSynth.playSelect(); }}
                  >
                    <span className="theme-swatch-emoji">{t.emoji}</span>
                    <span className="theme-swatch-label">{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Accessibility toggles */}
              <div className="form-group checkbox-group">
                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => { setHighContrast(e.target.checked); soundSynth.playSelect(); }}
                  />
                  <span className="checkbox-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AccessibilityIcon size={18} inline />
                    <span><strong>Senior High-Contrast Labels:</strong> Adds a clear name tag (e.g. "Dracula") to every tile for effortless reading.</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Section 3: Audio Synthesizer Controls */}
            <div className="settings-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AudioIcon size={20} inline /> Zen Synth Audio
              </h3>

              <div className="form-group slider-group">
                <div className="slider-header">
                  <label>Effects Volume (Chimes & Clicks):</label>
                  <span>{Math.round(sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={sfxVolume}
                  onChange={handleSfxChange}
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isAmbientEnabled}
                    onChange={toggleAmbientEnabled}
                  />
                  <span className="checkbox-text">
                    <strong>🌊 Real-Time Ambient Synthesizer:</strong> Plays continuous slow ocean wave swells and gentle wind-chimes in the background.
                  </span>
                </label>
              </div>

              <div className="form-group slider-group" style={{ opacity: isAmbientEnabled ? 1 : 0.4 }}>
                <div className="slider-header">
                  <label>Ambient Volume (Waves & Breeze):</label>
                  <span>{Math.round(ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={ambientVolume}
                  disabled={!isAmbientEnabled}
                  onChange={handleAmbientChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="confirm-btn glassmorphism" onClick={onClose}>
            Play Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
