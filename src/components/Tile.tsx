import React from 'react';
import type { TileState } from '../mahjong/gameEngine';
import { tileDisplayName } from '../mahjong/tileNames';

interface TileProps {
  tile: TileState;
  // Swap x/y for portrait rendering (the layouts are authored landscape-wide)
  transpose?: boolean;
  highContrast: boolean;
  isHinted: boolean;
  onClick: (tile: TileState) => void;
}

// Legends Edition (ages 14+) tile art — pre-rendered dark-fantasy icons sliced
// from the generated sprite sheet. Vite resolves every PNG in /assets/tiles to
// a hashed URL at build time; we look one up by `${type}_${value}`.
const tileArt = import.meta.glob('../assets/tiles/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>;

const artUrl = (type: string, value: number): string | undefined => {
  const key = `../assets/tiles/${type}_${value}.png`;
  return tileArt[key];
};

const LegendIcon: React.FC<{ type: string; value: number }> = ({ type, value }) => {
  const url = artUrl(type, value);
  if (!url) return null;
  return <img className="tile-art" src={url} alt="" draggable={false} />;
};

// Lightweight glyph renderer (used by the matching tray)
export const TileGlyph: React.FC<{ type: string; value: number }> = ({ type, value }) => (
  <LegendIcon type={type} value={value} />
);

const TileInner: React.FC<TileProps> = ({
  tile,
  transpose = false,
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
        <div className="tile-3d-side-left"></div>
        <div className="tile-3d-side-bottom"></div>
        <div className="tile-face">
          <LegendIcon type={type} value={value} />
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

  const handleTileClick = () => {
    onClick(tile);
  };

  // Keyboard play: Enter or Space activates a focused tile
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(tile);
    }
  };

  return (
    <div
      className={classes}
      style={tileStyle}
      data-tile-id={tile.id}
      onClick={handleTileClick}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={`${tileDisplayName(type, value)}, layer ${z + 1}. ${isFree ? 'Free' : 'Blocked'}`}
      tabIndex={isFree ? 0 : -1}
    >
      {/* 3D Tile block effects (Sides and bottom highlights) */}
      <div className="tile-3d-side-left"></div>
      <div className="tile-3d-side-bottom"></div>

      {/* Main Face of the Tile */}
      <div className="tile-face">
        <LegendIcon type={type} value={value} />
        {renderContrastLabel()}
      </div>
    </div>
  );
};

// Memoized: with immutable board updates, unchanged tiles keep their object
// identity, so taps/shuffles only re-render the tiles that actually changed
// (each face is a heavy SVG — this matters on 100+ tile boards).
export const Tile = React.memo(TileInner);

export default Tile;
