import React from 'react';
import type { TileState } from '../mahjong/gameEngine';

interface TileProps {
  tile: TileState;
  styleSet: 'classic' | 'largePrint' | 'nature' | 'modernPop';
  highContrast: boolean;
  isHinted: boolean;
  onClick: (tile: TileState) => void;
}

// Crisp, beautiful SVG subcomponents for game tiles
const ClassicIcon: React.FC<{ type: string; value: number }> = ({ type, value }) => {
  switch (type) {
    case 'bamboo':
      return (
        <svg viewBox="0 0 60 70" className="tile-svg">
          {/* Bamboo stems */}
          {value === 1 ? (
            // A beautiful peacock or single bird/large leaf for Bamboo 1
            <g transform="translate(10, 5)">
              <circle cx="20" cy="20" r="10" fill="none" stroke="#2e7d32" strokeWidth="3" />
              <path d="M 20 10 Q 15 25 20 45 Q 25 25 20 10" fill="#2e7d32" />
              <path d="M 20 20 Q 35 15 35 25 Q 20 30 20 20" fill="#1565c0" />
              <path d="M 20 20 Q 5 15 5 25 Q 20 30 20 20" fill="#1565c0" />
              <circle cx="20" cy="15" r="3" fill="#c62828" />
            </g>
          ) : (
            // Grid of bamboo sticks
            <g stroke="#2e7d32" strokeWidth="4" strokeLinecap="round" fill="none">
              {Array.from({ length: Math.min(value, 9) }).map((_, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                // Center offset helper
                const count = value;
                let x = 15 + col * 15;
                let y = 15 + row * 20;
                if (count === 2) {
                  x = 20 + col * 20;
                  y = 25 + row * 20;
                } else if (count === 4) {
                  x = 20 + (i % 2) * 20;
                  y = 20 + Math.floor(i / 2) * 30;
                } else if (count === 5) {
                  if (i === 4) { x = 30; y = 35; }
                  else {
                    x = 18 + (i > 2 ? i - 1 : i) % 2 * 24;
                    y = 18 + Math.floor((i > 2 ? i - 1 : i) / 2) * 34;
                  }
                }
                return (
                  <g key={i}>
                    <line x1={x} y1={y - 6} x2={x} y2={y + 6} />
                    <circle cx={x} cy={y} r="2.5" fill="#2e7d32" />
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      );

    case 'circle':
      return (
        <svg viewBox="0 0 60 70" className="tile-svg">
          {value === 1 ? (
            // Giant detailed center circle (Chong)
            <g>
              <circle cx="30" cy="35" r="18" fill="none" stroke="#1565c0" strokeWidth="4" />
              <circle cx="30" cy="35" r="10" fill="#c62828" />
              <path d="M 30 17 L 30 53 M 12 35 L 48 35" stroke="#2e7d32" strokeWidth="2" strokeDasharray="2,2" />
            </g>
          ) : (
            // Cluster of circles
            <g fill="none" strokeWidth="3">
              {Array.from({ length: value }).map((_, i) => {
                const colors = ['#1565c0', '#c62828', '#2e7d32'];
                const color = colors[i % colors.length];
                let cx: number;
                let cy: number;
                let r: number;
                
                // Position formulas for neat circular clusters
                if (value === 2) {
                  cx = 30;
                  cy = 20 + i * 30;
                  r = 9;
                } else if (value === 3) {
                  cx = 18 + i * 12;
                  cy = 18 + i * 17;
                  r = 8;
                } else if (value === 4) {
                  cx = 20 + (i % 2) * 20;
                  cy = 20 + Math.floor(i / 2) * 30;
                  r = 8;
                } else if (value === 5) {
                  if (i === 4) { cx = 30; cy = 35; }
                  else {
                    cx = 18 + (i % 2) * 24;
                    cy = 18 + Math.floor(i / 2) * 34;
                  }
                  r = 7;
                } else {
                  // Grid layouts for 6, 7, 8, 9
                  const col = i % 3;
                  const row = Math.floor(i / 3);
                  cx = 16 + col * 14;
                  cy = 16 + row * 19;
                  r = 6;
                }

                return (
                  <g key={i}>
                    <circle cx={cx} cy={cy} r={r} stroke={color} />
                    <circle cx={cx} cy={cy} r={r - 3} fill={color} />
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      );

    case 'character':
      return (
        <svg viewBox="0 0 60 70" className="tile-svg" style={{ fontFamily: 'serif' }}>
          {/* Traditional blue/red characters */}
          <text x="30" y="28" textAnchor="middle" fill="#c62828" fontSize="22" fontWeight="bold">
            {value === 1 && "一"}
            {value === 2 && "二"}
            {value === 3 && "三"}
            {value === 4 && "四"}
            {value === 5 && "五"}
            {value === 6 && "六"}
            {value === 7 && "七"}
            {value === 8 && "八"}
            {value === 9 && "九"}
          </text>
          <text x="30" y="58" textAnchor="middle" fill="#1565c0" fontSize="24" fontWeight="black">
            萬
          </text>
        </svg>
      );

    case 'wind':
      return (
        <svg viewBox="0 0 60 70" className="tile-svg" style={{ fontFamily: 'serif' }}>
          <text x="30" y="46" textAnchor="middle" fill="#0d47a1" fontSize="38" fontWeight="bold">
            {value === 0 && "東"}
            {value === 1 && "南"}
            {value === 2 && "西"}
            {value === 3 && "北"}
          </text>
        </svg>
      );

    case 'dragon':
      return (
        <svg viewBox="0 0 60 70" className="tile-svg" style={{ fontFamily: 'serif' }}>
          {value === 0 && (
            // Red Dragon (Chung)
            <text x="30" y="48" textAnchor="middle" fill="#c62828" fontSize="42" fontWeight="bold">中</text>
          )}
          {value === 1 && (
            // Green Dragon (Fa)
            <text x="30" y="48" textAnchor="middle" fill="#2e7d32" fontSize="42" fontWeight="bold">發</text>
          )}
          {value === 2 && (
            // White Dragon (Blank border box)
            <rect x="14" y="16" width="32" height="38" rx="3" fill="none" stroke="#1565c0" strokeWidth="4" />
          )}
        </svg>
      );

    case 'season':
      return (
        <svg viewBox="0 0 60 70" className="tile-svg">
          {/* Floral/Sun symbols */}
          <circle cx="30" cy="35" r="14" fill="none" stroke="#e65100" strokeWidth="2" strokeDasharray="3,3" />
          {value === 0 && ( // Spring (Flower/Sun)
            <g transform="translate(30, 35)">
              <circle cx="0" cy="0" r="6" fill="#e65100" />
              {Array.from({ length: 8 }).map((_, idx) => (
                <line key={idx} x1="0" y1="0" x2="0" y2="-12" stroke="#e65100" strokeWidth="2" transform={`rotate(${idx * 45})`} />
              ))}
            </g>
          )}
          {value === 1 && ( // Summer (Hot sun)
            <circle cx="30" cy="35" r="9" fill="#d84315" />
          )}
          {value === 2 && ( // Autumn (Leaf)
            <path d="M 30 20 Q 20 35 30 50 Q 40 35 30 20 Z" fill="#ef6c00" />
          )}
          {value === 3 && ( // Winter (Snowflake)
            <g stroke="#0277bd" strokeWidth="3" fill="none" transform="translate(30,35)">
              {Array.from({ length: 6 }).map((_, idx) => (
                <line key={idx} x1="0" y1="0" x2="0" y2="-12" transform={`rotate(${idx * 60})`} />
              ))}
            </g>
          )}
          <text x="30" y="65" textAnchor="middle" fill="#ef6c00" fontSize="10" fontWeight="bold">
            {value === 0 && "春"}
            {value === 1 && "夏"}
            {value === 2 && "秋"}
            {value === 3 && "冬"}
          </text>
        </svg>
      );

    case 'flower':
      return (
        <svg viewBox="0 0 60 70" className="tile-svg">
          <g transform="translate(30, 32)">
            {/* Soft stylized floral petals */}
            {value === 0 && ( // Plum
              <g fill="#ec407a">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <circle key={idx} cx="0" cy="-7" r="6" transform={`rotate(${idx * 72})`} />
                ))}
                <circle cx="0" cy="0" r="4" fill="#f8bbd0" />
              </g>
            )}
            {value === 1 && ( // Orchid
              <g fill="#ab47bc">
                <path d="M 0 0 C -8 -15 -18 -8 0 0 C 8 -15 18 -8 0 0 C 0 15 10 10 0 0 Z" />
                <circle cx="0" cy="0" r="3" fill="#e1bee7" />
              </g>
            )}
            {value === 2 && ( // Bamboo flower
              <g stroke="#2e7d32" strokeWidth="3" fill="none">
                <line x1="-8" y1="5" x2="8" y2="-5" />
                <line x1="-8" y1="-5" x2="8" y2="5" />
                <circle cx="0" cy="0" r="5" fill="#81c784" stroke="none" />
              </g>
            )}
            {value === 3 && ( // Chrysanthemum
              <g fill="#fdd835">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <ellipse key={idx} cx="0" cy="-9" rx="3" ry="8" transform={`rotate(${idx * 30})`} />
                ))}
                <circle cx="0" cy="0" r="5" fill="#f57f17" />
              </g>
            )}
          </g>
          <text x="30" y="65" textAnchor="middle" fill="#ab47bc" fontSize="10" fontWeight="bold">
            {value === 0 && "梅"}
            {value === 1 && "蘭"}
            {value === 2 && "竹"}
            {value === 3 && "菊"}
          </text>
        </svg>
      );

    default:
      return null;
  }
};

const ModernPopIcon: React.FC<{ type: string; value: number }> = ({ type, value }) => {
  switch (type) {
    case 'bamboo':
      if (value === 1) {
        return (
          <svg viewBox="0 0 60 70" className="tile-svg">
            <defs>
              <linearGradient id="neon-teal-bird" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="100%" stopColor="#4facfe" />
              </linearGradient>
              <filter id="neon-glow-bird" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <g filter="url(#neon-glow-bird)">
              <path d="M 30 15 Q 18 28 30 46 Q 42 28 30 15 Z" fill="url(#neon-teal-bird)" />
              <path d="M 30 28 L 14 22 M 30 28 L 46 22" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              <path d="M 30 36 L 18 48 M 30 36 L 42 48" stroke="#00f2fe" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="30" cy="22" r="3.5" fill="#ffffff" />
            </g>
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 60 70" className="tile-svg">
          <defs>
            <linearGradient id="neon-teal-bar" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00f5d4" />
              <stop offset="100%" stopColor="#01be9b" />
            </linearGradient>
          </defs>
          <g stroke="url(#neon-teal-bar)" strokeWidth="3.5" strokeLinecap="round" fill="none">
            {Array.from({ length: value }).map((_, i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              const count = value;
              let x = 16 + col * 14;
              let y = 18 + row * 18;
              if (count === 2) {
                x = 20 + col * 20;
                y = 28 + row * 16;
              } else if (count === 4) {
                x = 20 + (i % 2) * 20;
                y = 20 + Math.floor(i / 2) * 26;
              } else if (count === 5) {
                if (i === 4) { x = 30; y = 33; }
                else {
                  x = 18 + (i > 2 ? i - 1 : i) % 2 * 24;
                  y = 18 + Math.floor((i > 2 ? i - 1 : i) / 2) * 30;
                }
              }
              return (
                <g key={i}>
                  <line x1={x} y1={y - 5} x2={x} y2={y + 5} />
                  <circle cx={x} cy={y} r="1.5" fill="#ffffff" stroke="none" />
                </g>
              );
            })}
          </g>
        </svg>
      );

    case 'circle':
      if (value === 1) {
        return (
          <svg viewBox="0 0 60 70" className="tile-svg">
            <defs>
              <linearGradient id="neon-pink-core" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff007f" />
                <stop offset="100%" stopColor="#7f00ff" />
              </linearGradient>
            </defs>
            <circle cx="30" cy="35" r="18" fill="none" stroke="url(#neon-pink-core)" strokeWidth="3" />
            <circle cx="30" cy="35" r="12" fill="none" stroke="#00ffff" strokeWidth="2.5" />
            <circle cx="30" cy="35" r="6" fill="#ffffff" />
            <path d="M 30 10 L 30 60 M 5 35 L 55 35" stroke="rgba(0, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 60 70" className="tile-svg">
          <g fill="none" strokeWidth="2.5">
            {Array.from({ length: value }).map((_, i) => {
              const colors = ['#ff007f', '#00ffff', '#ffb703'];
              const color = colors[i % colors.length];
              let cx: number;
              let cy: number;
              let r: number;
              if (value === 2) {
                cx = 30; cy = 20 + i * 30; r = 10;
              } else if (value === 3) {
                cx = 18 + i * 12; cy = 18 + i * 17; r = 9;
              } else if (value === 4) {
                cx = 20 + (i % 2) * 20; cy = 20 + Math.floor(i / 2) * 30; r = 8;
              } else if (value === 5) {
                if (i === 4) { cx = 30; cy = 35; }
                else { cx = 18 + (i % 2) * 24; cy = 18 + Math.floor(i / 2) * 34; }
                r = 7;
              } else {
                const col = i % 3;
                const row = Math.floor(i / 3);
                cx = 16 + col * 14;
                cy = 16 + row * 19;
                r = 6.5;
              }
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r={r} stroke={color} fill="rgba(0,0,0,0.2)" />
                  <circle cx={cx} cy={cy} r={r - 3} fill={color} stroke="none" />
                </g>
              );
            })}
          </g>
        </svg>
      );

    case 'character':
      return (
        <svg viewBox="0 0 60 70" className="tile-svg">
          <defs>
            <linearGradient id="neon-gold-char" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffb703" />
              <stop offset="100%" stopColor="#fb8500" />
            </linearGradient>
          </defs>
          <rect x="10" y="8" width="40" height="54" rx="8" fill="rgba(0, 0, 0, 0.4)" stroke="url(#neon-gold-char)" strokeWidth="2" />
          <text x="30" y="36" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="bold" fontFamily="system-ui, sans-serif" style={{ filter: 'drop-shadow(0 0 5px #fb8500)' }}>
            {value}
          </text>
          <text x="30" y="52" textAnchor="middle" fill="#ffb703" fontSize="8" fontWeight="bold" letterSpacing="1" fontFamily="system-ui, sans-serif">
            TOKEN
          </text>
        </svg>
      );

    case 'wind': {
      const windsInfo = [
        { label: 'EAST', emoji: '☀️', color: '#00f2fe' },
        { label: 'SOUTH', emoji: '🔥', color: '#ff3d00' },
        { label: 'WEST', emoji: '💨', color: '#00f5d4' },
        { label: 'NORTH', emoji: '❄️', color: '#9d4edd' }
      ];
      const wind = windsInfo[value] || windsInfo[0];
      return (
        <svg viewBox="0 0 60 70" className="tile-svg">
          <defs>
            <filter id="glow-wind-filter">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <text x="30" y="32" textAnchor="middle" fill={wind.color} fontSize="24" fontWeight="bold" opacity="0.35" filter="url(#glow-wind-filter)">
            {wind.emoji}
          </text>
          <text x="30" y="44" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="black" fontFamily="serif">
            {['東', '南', '西', '北'][value]}
          </text>
          <text x="30" y="58" textAnchor="middle" fill={wind.color} fontSize="8" fontWeight="bold" letterSpacing="1">
            {wind.label}
          </text>
        </svg>
      );
    }

    case 'dragon':
      return (
        <svg viewBox="0 0 60 70" className="tile-svg">
          <defs>
            <linearGradient id="neon-dragon-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4d6d" />
              <stop offset="100%" stopColor="#ff0040" />
            </linearGradient>
          </defs>
          {value === 0 && (
            <g>
              <path d="M 16 48 L 22 24 L 30 36 L 38 24 L 44 48 Z" fill="none" stroke="url(#neon-dragon-red)" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="30" cy="22" r="3" fill="#ff0040" />
              <text x="30" y="45" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="bold">中</text>
            </g>
          )}
          {value === 1 && (
            <g>
              <polygon points="30,14 34,26 46,26 36,34 40,46 30,38 20,46 24,34 14,26 26,26" fill="none" stroke="#69f0ae" strokeWidth="2.5" />
              <text x="30" y="44" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">發</text>
            </g>
          )}
          {value === 2 && (
            <g>
              <rect x="14" y="16" width="32" height="38" rx="6" fill="none" stroke="#00e5ff" strokeWidth="3.5" />
              <rect x="20" y="22" width="20" height="26" rx="3" fill="none" stroke="#ff007f" strokeWidth="1.5" strokeDasharray="3,2" />
              <circle cx="30" cy="35" r="3" fill="#ffffff" />
            </g>
          )}
        </svg>
      );

    case 'season':
    case 'flower': {
      const isSeason = type === 'season';
      const glyphs = isSeason
        ? [
            { emoji: '🌸', label: 'SPRING', color: '#ff758f' },
            { emoji: '☀️', label: 'SUMMER', color: '#ffb703' },
            { emoji: '🍁', label: 'AUTUMN', color: '#fb8500' },
            { emoji: '❄️', label: 'WINTER', color: '#00b4d8' }
          ]
        : [
            { emoji: '🌺', label: 'PLUM', color: '#ff758f' },
            { emoji: '🪻', label: 'ORCHID', color: '#c084fc' },
            { emoji: '🎋', label: 'BAMBOO', color: '#69f0ae' },
            { emoji: '🌼', label: 'CHRYS', color: '#ffd700' }
          ];
      const item = glyphs[value] || glyphs[0];
      const kanji = isSeason ? ['春', '夏', '秋', '冬'][value] : ['梅', '蘭', '竹', '菊'][value];
      return (
        <svg viewBox="0 0 60 70" className="tile-svg">
          <defs>
            <filter id="glow-sf-filter">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" operator="over" />
            </filter>
          </defs>
          <circle cx="30" cy="28" r="15" fill="rgba(0,0,0,0.3)" stroke={item.color} strokeWidth="1.5" />
          <text x="30" y="34" textAnchor="middle" fontSize="20" filter="url(#glow-sf-filter)">
            {item.emoji}
          </text>
          <text x="30" y="53" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
            {kanji}
          </text>
          <text x="30" y="64" textAnchor="middle" fill={item.color} fontSize="7" fontWeight="bold" letterSpacing="0.5">
            {item.label}
          </text>
        </svg>
      );
    }

    default:
      return null;
  }
};

const LargePrintIcon: React.FC<{ type: string; value: number }> = ({ type, value }) => {
  // Bold, oversized letters and numbers for elderly accessibility
  let label = '';
  let color = '#333';
  let desc = '';

  switch (type) {
    case 'bamboo':
      label = `B${value}`;
      color = '#1b5e20'; // Bold dark green
      desc = 'BAMBOO';
      break;
    case 'circle':
      label = `C${value}`;
      color = '#0d47a1'; // Bold blue
      desc = 'CIRCLE';
      break;
    case 'character':
      label = `K${value}`;
      color = '#b71c1c'; // Bold red
      desc = 'CHAR';
      break;
    case 'wind': {
      const winds = ['EAST', 'SOUTH', 'WEST', 'NORTH'];
      label = winds[value][0]; // E, S, W, N
      color = '#4a148c'; // Purple
      desc = winds[value];
      break;
    }
    case 'dragon': {
      const dragons = ['DR-R', 'DR-G', 'DR-W'];
      const shortDragons = ['中', '發', '白'];
      label = shortDragons[value];
      color = value === 0 ? '#b71c1c' : value === 1 ? '#1b5e20' : '#0d47a1';
      desc = dragons[value];
      break;
    }
    case 'season': {
      const seasons = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'];
      label = '🍂';
      color = '#e65100';
      desc = seasons[value];
      break;
    }
    case 'flower': {
      const flowers = ['PLUM', 'ORCHID', 'BAMBOO', 'CHRYS'];
      label = '🌸';
      color = '#c2185b';
      desc = flowers[value];
      break;
    }
  }

  return (
    <div className="large-print-inner" style={{ color }}>
      <span className="large-symbol">{label}</span>
      <span className="large-desc">{desc}</span>
    </div>
  );
};

const NatureIcon: React.FC<{ type: string; value: number }> = ({ type, value }) => {
  // Relaxing nature SVGs (emojis as placeholders, but high-res vector aesthetics)
  let emoji = '🌲';
  let label = '';
  switch (type) {
    case 'bamboo': {
      const bamb = ['🌱', '🌿', '🍀', '🎋', '🌴', '🌲', '🌳', '🍂', '🍁'];
      emoji = bamb[value - 1] || '🌿';
      label = 'Flora';
      break;
    }
    case 'circle': {
      const circ = ['☀️', '🌙', '⭐', '🪐', '🌍', '☄️', '🌌', '☁️', '🌀'];
      emoji = circ[value - 1] || '🪐';
      label = 'Cosmic';
      break;
    }
    case 'character': {
      const char = ['🦊', '🐱', '🐶', '🦁', '🐸', '🐨', '🐯', '🐻', '🐼'];
      emoji = char[value - 1] || '🐼';
      label = 'Fauna';
      break;
    }
    case 'wind': {
      const winds = ['💨', '🌪️', '🌬️', '🌈'];
      emoji = winds[value] || '💨';
      label = 'Weather';
      break;
    }
    case 'dragon': {
      const drag = ['🐉', '🦎', '🐢'];
      emoji = drag[value] || '🐉';
      label = 'Ancient';
      break;
    }
    case 'season': {
      const seas = ['🌸', '☀️', '🍁', '❄️'];
      emoji = seas[value] || '🌸';
      label = 'Season';
      break;
    }
    case 'flower': {
      const flow = ['🌹', '🌻', '🌺', '🌼'];
      emoji = flow[value] || '🌺';
      label = 'Flower';
      break;
    }
  }

  return (
    <div className="nature-inner">
      <span className="nature-emoji">{emoji}</span>
      <span className="nature-label">{label}</span>
    </div>
  );
};

export const Tile: React.FC<TileProps> = ({
  tile,
  styleSet,
  highContrast,
  isHinted,
  onClick
}) => {
  const { x, y, z, selected, matched, revealed, isFree, type, value } = tile;

  if (matched) {
    return <div className="tile-placeholder" style={{ gridColumnStart: x + 1, gridRowStart: y + 1 }} />;
  }

  // Calculate 3D offset variables: tiles get stacked with visual shifts
  const shiftX = z * -4; // Shift left per layer
  const shiftY = z * -5; // Shift up per layer

  // Classes for active tiles
  const classes = [
    'mahjong-tile',
    `layer-${z}`,
    selected ? 'selected' : '',
    isHinted ? 'hinted' : '',
    !isFree ? 'blocked' : 'free',
    revealed ? 'revealed' : 'face-down',
    `style-set-${styleSet}`
  ].join(' ');

  // Tactile inline styles to create a realistic 3D block
  const tileStyle = {
    // Grid coordinate placement
    gridColumn: `${x + 1} / span 2`,
    gridRow: `${y + 1} / span 2`,
    transform: `translate(${shiftX}px, ${shiftY}px)`,
    zIndex: 10 + z * 5 + (selected ? 100 : 0),
    // Pass visual coordinates as CSS custom properties
    '--shift-x': `${shiftX}px`,
    '--shift-y': `${shiftY}px`,
  } as React.CSSProperties;

  // High contrast helper overlay to ensure readability
  const renderContrastLabel = () => {
    if (!highContrast) return null;
    let text = '';
    if (type === 'bamboo') text = `B${value}`;
    else if (type === 'circle') text = `C${value}`;
    else if (type === 'character') text = `K${value}`;
    else if (type === 'wind') text = ['E', 'S', 'W', 'N'][value];
    else if (type === 'dragon') text = ['中', '發', '白'][value];
    else if (type === 'season') text = ['春', '夏', '秋', '冬'][value];
    else if (type === 'flower') text = ['梅', '蘭', '竹', '菊'][value];

    return (
      <span className="high-contrast-tag">
        {text}
      </span>
    );
  };

  const handleTileClick = () => {
    // Standard game: must be free to click
    // Memory mode: handled separately in state, but general clicks logic can bubble
    onClick(tile);
  };

  return (
    <div
      className={classes}
      style={tileStyle}
      onClick={handleTileClick}
      role="button"
      aria-label={`Tile layer ${z}, type ${type}, value ${value}. ${isFree ? 'Free' : 'Blocked'}`}
      tabIndex={isFree ? 0 : -1}
    >
      {/* 3D Tile block effects (Sides and bottom highlights) */}
      <div className="tile-3d-side-left"></div>
      <div className="tile-3d-side-bottom"></div>

      {/* Main Face of the Tile */}
      <div className="tile-face">
        {/* Render correct style set */}
        {styleSet === 'classic' && <ClassicIcon type={type} value={value} />}
        {styleSet === 'largePrint' && <LargePrintIcon type={type} value={value} />}
        {styleSet === 'nature' && <NatureIcon type={type} value={value} />}
        {styleSet === 'modernPop' && <ModernPopIcon type={type} value={value} />}

        {/* High contrast overlay badge */}
        {renderContrastLabel()}
        
        {/* Blocked overlay (subtle tinting) */}
        {!isFree && <div className="blocked-tint" />}
      </div>
    </div>
  );
};

export default Tile;
