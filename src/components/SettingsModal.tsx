import React, { useMemo } from 'react';
import { layouts, levelForLayout, MAX_LEVEL } from '../mahjong/layouts';
import type { LayoutName } from '../mahjong/layouts';
import { soundSynth } from '../mahjong/soundSynth';
import { realmForLevel } from '../mahjong/realms';
import { lsNumberMap } from '../mahjong/storage';
import ModalShell from './ModalShell';
import {
  SettingsIcon,
  LayoutIcon,
  AccessibilityIcon,
  AudioIcon,
  CloseIcon
} from './SvgIcons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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

  // Read once per OPEN, not per render. Sitting in the render body it re-read
  // and re-parsed localStorage on every render while the dialog was up — once
  // per frame of a volume-slider drag. Declared above the early return because
  // hooks can't run conditionally; `isOpen` is the cache key, so reopening the
  // dialog picks up stars earned since it was last closed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bestStars = useMemo(() => lsNumberMap('vita_best_stars'), [isOpen]);

  if (!isOpen) return null;

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setSfxVolume(vol);
    soundSynth.configure(vol, ambientVolume);
    soundSynth.playClick();
  };

  const handleAmbientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setAmbientVolume(vol);
    soundSynth.configure(sfxVolume, vol);
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
    <ModalShell role="dialog" labelledBy="settings-title" onDismiss={onClose}>
      {/* Header */}
      <div className="modal-header">
        <h2 id="settings-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                const bestStarsData = bestStars[l.name] ?? 0;
                // Where this card actually starts — the same function initGame
                // uses, so the label can't promise a level the game won't open.
                const targetLevel = levelForLayout(l.name, currentLevel);
                return (
                  // A real <button>, not a div: these are the primary control in
                  // this dialog, and the dialog now traps focus — as unfocusable
                  // divs they were unreachable by keyboard, and an aria-label on
                  // a generic div is ignored by most screen readers anyway.
                  // aria-disabled rather than disabled, so a locked card stays
                  // focusable and can still explain why it's locked.
                  <button
                    key={l.name}
                    type="button"
                    className={`layout-card ${activeLayout === l.name ? 'active' : ''} ${isLocked ? 'layout-locked' : ''}`}
                    aria-disabled={isLocked || undefined}
                    onClick={() => {
                      if (isLocked) {
                        soundSynth.playClick();
                        return;
                      }
                      onSelectLayout(l.name);
                      soundSynth.playClick();
                    }}
                    title={isLocked
                      ? `Complete Level ${levelNum - 1} to unlock`
                      : `Play ${l.displayName} at Level ${targetLevel} — ${l.description}`}
                    aria-label={isLocked
                      ? `${l.displayName}, locked. Complete Level ${levelNum - 1} to unlock.`
                      : `Play ${l.displayName} at Level ${targetLevel}`}
                  >
                    {/* Spans, not div/h4/p: <button> takes phrasing content
                        only, so flow elements inside it are invalid HTML (and an
                        <h4> in a button isn't exposed as a heading anyway). The
                        CSS gives them display:block. */}
                    <span className="layout-card-badge">{l.coords.length} Tiles</span>
                    {isLocked && <span className="lock-overlay">🔒</span>}
                    <span className="layout-card-title">{l.displayName}</span>
                    {/* Say where the pick lands: it rewinds to the most recent
                        level on this board, which is rarely levels 1–5. */}
                    {!isLocked && (
                      <span className="layout-card-target">
                        {targetLevel === currentLevel ? 'Current level' : `Starts Level ${targetLevel}`}
                      </span>
                    )}
                    {bestStarsData > 0 && (
                      <span className="layout-best-stars">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <span key={i} style={{ opacity: i < bestStarsData ? 1 : 0.25 }}>⭐</span>
                        ))}
                      </span>
                    )}
                    <span className="layout-card-desc">{isLocked ? `Complete Level ${levelNum - 1} to unlock` : l.description}</span>
                  </button>
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
                  return (
                    <option key={lvlNum} value={lvlNum}>
                      Level {lvlNum} · {realmForLevel(lvlNum).name}
                    </option>
                  );
                })}
              </select>
              <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                Highest Unlocked: <strong>Level {maxUnlockedLevel} / {MAX_LEVEL}</strong>
              </span>
            </div>
          </div>

          <div className="settings-row-grid">
            {/* Section 2: Visual Adjustments */}
            <div className="settings-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Accessibility
              </h3>

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
    </ModalShell>
  );
};

export default SettingsModal;
