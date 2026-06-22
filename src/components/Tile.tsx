import React, { useRef, useState } from 'react';
import type { TileState } from '../mahjong/gameEngine';
import { tileDisplayName } from '../mahjong/tileNames';

interface TileProps {
  tile: TileState;
  // Swap x/y for portrait rendering (the layouts are authored landscape-wide)
  transpose?: boolean;
  realm?: string;
  highContrast: boolean;
  isHinted: boolean;
  onClick: (tile: TileState) => void;
}

// Pre-rendered tile art per realm, sliced from the generated sprite sheets into
// src/assets/tiles/<realm>/{type}_{value}.png. Vite resolves every PNG to a
// hashed URL at build time; we look one up by realm + face.
const tileArt = import.meta.glob('../assets/tiles/*/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>;

const artUrl = (realm: string, type: string, value: number): string | undefined => {
  return tileArt[`../assets/tiles/${realm}/${type}_${value}.png`]
    ?? tileArt[`../assets/tiles/legends/${type}_${value}.png`]; // fallback
};

const RealmIcon: React.FC<{ realm: string; type: string; value: number }> = ({ realm, type, value }) => {
  const url = artUrl(realm, type, value);
  if (!url) return null;
  return <img className="tile-art" src={url} alt="" draggable={false} />;
};

// Lightweight glyph renderer (used by the matching tray)
export const TileGlyph: React.FC<{ type: string; value: number; realm?: string }> = ({ type, value, realm = 'legends' }) => (
  <RealmIcon realm={realm} type={type} value={value} />
);

const TileInner: React.FC<TileProps> = ({
  tile,
  transpose = false,
  realm = 'legends',
  highContrast,
  isHinted,
  onClick
}) => {
  const { z, matched, isFree, type, value, wobbling } = tile;
  const x = transpose ? tile.y : tile.x;
  const y = transpose ? tile.x : tile.y;

  // Calculate 3D offset variables: tiles get stacked with visual shifts
  const shiftX = z * -7; // Shift left per layer (survives zoom-out)
  const shiftY = z * -9; // Shift up per layer
  const wallDepth = 10;  // Uniform tile depth (chunky 3D, but no per-stack height)

  // Press-and-hold "peek" state (hooks must run before any early return).
  const [peeking, setPeeking] = useState(false);
  const peekTimer = useRef<number | null>(null);
  const peekStart = useRef<{ x: number; y: number } | null>(null);
  const didPeek = useRef(false);
  const movedRef = useRef(false);

  if (matched) {
    return (
      <div
        className="mahjong-tile matched"
        data-tile-id={tile.id}
        style={{
          gridColumn: `${x + 1} / span 2`,
          gridRow: `${y + 1} / span 2`,
          zIndex: 250,
          '--shift-x': `${shiftX}px`,
          '--shift-y': `${shiftY}px`,
          '--wall': `${wallDepth}px`,
        } as React.CSSProperties}
        aria-hidden="true"
      >
        <div className="tile-3d-side-right"></div>
        <div className="tile-3d-side-bottom"></div>
        <div className="tile-face">
          <RealmIcon realm={realm} type={type} value={value} />
        </div>
      </div>
    );
  }

  // Classes for active tiles ('revealed' drives the deal-in flip animation)
  const classes = [
    'mahjong-tile',
    `layer-${z}`,
    isHinted ? 'hinted' : '',
    !isFree ? 'blocked' : 'free',
    'revealed',
    wobbling ? 'wobble' : ''
  ].filter(Boolean).join(' ');

  // Tactile inline styles to create a realistic 3D block
  const tileStyle = {
    gridColumn: `${x + 1} / span 2`,
    gridRow: `${y + 1} / span 2`,
    transform: `translate(${shiftX}px, ${shiftY}px)`,
    zIndex: 10 + z * 5,
    '--shift-x': `${shiftX}px`,
    '--shift-y': `${shiftY}px`,
    '--wall': `${wallDepth}px`,
  } as React.CSSProperties;

  // High contrast helper overlay: the tile's name (first word keeps it short
  // and unique, e.g. "Blood Moon" → "Blood") so the label actually aids reading.
  const renderContrastLabel = () => {
    if (!highContrast) return null;
    const shortName = tileDisplayName(type, value).split(' ')[0];
    return (
      <span className="high-contrast-tag">
        {shortName}
      </span>
    );
  };

  // Tap vs hold vs drag, all from pointer events so the three never conflict:
  //  • quick still press            → collect (tap)
  //  • press-and-hold (≥220ms still) → "peek": lift + translucent + name label
  //  • press-and-drag (moved >8px)   → board pan (handled by the container)
  const clearPeek = () => {
    if (peekTimer.current) { clearTimeout(peekTimer.current); peekTimer.current = null; }
    setPeeking(false);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (matched) return;
    didPeek.current = false;
    movedRef.current = false;
    peekStart.current = { x: e.clientX, y: e.clientY };
    // Capture so the lifted tile keeps the hold even as it shifts under the finger
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* ignore */ }
    if (peekTimer.current) clearTimeout(peekTimer.current);
    peekTimer.current = window.setTimeout(() => { didPeek.current = true; setPeeking(true); }, 220);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!peekStart.current) return;
    const dx = e.clientX - peekStart.current.x;
    const dy = e.clientY - peekStart.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 8) { movedRef.current = true; clearPeek(); }
  };

  const handlePointerUp = () => {
    const wasTap = !didPeek.current && !movedRef.current;
    clearPeek();
    peekStart.current = null;
    if (wasTap) onClick(tile); // quick still press → collect
  };

  const handlePointerLeave = () => { clearPeek(); peekStart.current = null; };

  // Keyboard play: Enter or Space activates a focused tile
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(tile);
    }
  };

  return (
    <div
      className={`${classes}${peeking ? ' peeking' : ''}`}
      style={tileStyle}
      data-tile-id={tile.id}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      role="button"
      aria-label={`${tileDisplayName(type, value)}, layer ${z + 1}. ${isFree ? 'Free' : 'Blocked'}`}
      tabIndex={isFree ? 0 : -1}
    >
      {/* 3D Tile block effects (Sides and bottom highlights) */}
      <div className="tile-3d-side-right"></div>
      <div className="tile-3d-side-bottom"></div>

      {/* Main Face of the Tile */}
      <div className="tile-face">
        <RealmIcon realm={realm} type={type} value={value} />
        {renderContrastLabel()}
      </div>

      {/* Peek label — what this tile is, while held */}
      {peeking && <span className="tile-peek-label">{tileDisplayName(type, value)}</span>}
    </div>
  );
};

// Memoized: with immutable board updates, unchanged tiles keep their object
// identity, so taps/shuffles only re-render the tiles that actually changed
// (each face is a heavy SVG — this matters on 100+ tile boards).
export const Tile = React.memo(TileInner);

export default Tile;
