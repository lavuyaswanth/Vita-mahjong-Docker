import React from 'react';
import { layouts } from '../mahjong/layouts';
import type { LayoutName } from '../mahjong/layouts';
import { soundSynth } from '../mahjong/soundSynth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bgTheme: string;
  setBgTheme: (theme: string) => void;
  styleSet: 'classic' | 'largePrint' | 'nature' | 'modernPop';
  setStyleSet: (style: 'classic' | 'largePrint' | 'nature' | 'modernPop') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  sfxVolume: number;
  setSfxVolume: (vol: number) => void;
  ambientVolume: number;
  setAmbientVolume: (vol: number) => void;
  isAmbientEnabled: boolean;
  setIsAmbientEnabled: (val: boolean) => void;
  activeLayout: LayoutName;
  onSelectLayout: (layout: LayoutName) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  bgTheme,
  setBgTheme,
  styleSet,
  setStyleSet,
  highContrast,
  setHighContrast,
  sfxVolume,
  setSfxVolume,
  ambientVolume,
  setAmbientVolume,
  isAmbientEnabled,
  setIsAmbientEnabled,
  activeLayout,
  onSelectLayout
}) => {
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
          <h2>⚙️ Game Settings & Layouts</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close settings">✕</button>
        </div>

        <div className="modal-content">
          {/* Section 1: Level Layout Selector */}
          <div className="settings-section">
            <h3>🎨 Choose Layout Board</h3>
            <div className="layout-cards-grid">
              {Object.values(layouts).map(l => (
                <div
                  key={l.name}
                  className={`layout-card ${activeLayout === l.name ? 'active' : ''}`}
                  onClick={() => {
                    onSelectLayout(l.name);
                    soundSynth.playClick();
                  }}
                >
                  <div className="layout-card-badge">{l.coords.length} Tiles</div>
                  <h4>{l.displayName}</h4>
                  <p>{l.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="settings-row-grid">
            {/* Section 2: Visual Adjustments */}
            <div className="settings-section">
              <h3>🖌️ Visual Style</h3>
              
              <div className="form-group">
                <label>Tile Representation:</label>
                <div className="toggle-button-group">
                  <button
                    className={styleSet === 'classic' ? 'active' : ''}
                    onClick={() => { setStyleSet('classic'); soundSynth.playClick(); }}
                  >
                    🀄 Classic Chinese
                  </button>
                  <button
                    className={styleSet === 'largePrint' ? 'active' : ''}
                    onClick={() => { setStyleSet('largePrint'); soundSynth.playClick(); }}
                  >
                    🅰️ Large Western Print
                  </button>
                  <button
                    className={styleSet === 'nature' ? 'active' : ''}
                    onClick={() => { setStyleSet('nature'); soundSynth.playClick(); }}
                  >
                    🌲 Relaxing Nature
                  </button>
                  <button
                    className={styleSet === 'modernPop' ? 'active' : ''}
                    onClick={() => { setStyleSet('modernPop'); soundSynth.playClick(); }}
                  >
                    💎 Modern Neon Pop
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Background Theme:</label>
                <div className="theme-selector-grid">
                  <button
                    className={`theme-btn zen ${bgTheme === 'zen' ? 'active' : ''}`}
                    onClick={() => { setBgTheme('zen'); soundSynth.playClick(); }}
                    title="Bamboo Zen Garden"
                  >
                    🎋 Zen Garden
                  </button>
                  <button
                    className={`theme-btn ocean ${bgTheme === 'ocean' ? 'active' : ''}`}
                    onClick={() => { setBgTheme('ocean'); soundSynth.playClick(); }}
                    title="Deep Healing Ocean"
                  >
                    🌊 Deep Ocean
                  </button>
                  <button
                    className={`theme-btn sunset ${bgTheme === 'sunset' ? 'active' : ''}`}
                    onClick={() => { setBgTheme('sunset'); soundSynth.playClick(); }}
                    title="Sunset Cozy Cabin"
                  >
                    🪵 Sunset Amber
                  </button>
                  <button
                    className={`theme-btn dark ${bgTheme === 'dark' ? 'active' : ''}`}
                    onClick={() => { setBgTheme('dark'); soundSynth.playClick(); }}
                    title="Midnight Healing Space"
                  >
                    🌌 Healing Dark
                  </button>
                </div>
              </div>

              {/* Accessibility toggles */}
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => { setHighContrast(e.target.checked); soundSynth.playSelect(); }}
                  />
                  <span className="checkbox-text">
                    <strong>👁️ Senior High-Contrast Labels:</strong> Adds large text badges on top of complex tiles for effortless reading.
                  </span>
                </label>
              </div>
            </div>

            {/* Section 3: Audio Synthesizer Controls */}
            <div className="settings-section">
              <h3>🎵 Zen Synth Audio</h3>

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
