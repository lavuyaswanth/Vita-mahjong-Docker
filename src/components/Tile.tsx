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

// Legends Edition (ages 14+) tile art — creatures of legend, relics,
// realm landmarks, omens, myths, moon phases and wild flora.
// All inline vector SVG, bold shapes tuned to stay readable at ~50px.
const LegendIcon: React.FC<{ type: string; value: number }> = ({ type, value }) => {
  switch (type) {
    case 'bamboo': // CREATURES OF LEGEND
      switch (value) {
        case 1: // Dracula
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Cape */}
              <path d="M 8 64 C 8 44 16 36 30 36 C 44 36 52 44 52 64 Z" fill="#1a1026" stroke="#0c0714" strokeWidth="2" />
              {/* High collar wings */}
              <path d="M 11 52 L 18 30 L 26 45 Z" fill="#4a1d6e" />
              <path d="M 49 52 L 42 30 L 34 45 Z" fill="#4a1d6e" />
              {/* Shirt and bow */}
              <polygon points="25,41 35,41 30,55" fill="#f5f0e6" />
              <polygon points="26.5,43 33.5,43 30,48" fill="#b3122e" />
              {/* Pale head */}
              <ellipse cx="30" cy="24" rx="12.5" ry="13.5" fill="#e9e2d4" stroke="#b9a98f" strokeWidth="1.5" />
              {/* Widow's-peak hair */}
              <path d="M 17.5 23 C 15.5 9 44.5 9 42.5 23 C 39 14.5 34 15.5 30 24 C 26 15.5 21 14.5 17.5 23 Z" fill="#151022" />
              {/* Angry brows + red eyes */}
              <path d="M 20.5 22 L 26.5 24.5 M 39.5 22 L 33.5 24.5" stroke="#151022" strokeWidth="2" strokeLinecap="round" />
              <circle cx="24" cy="27" r="2" fill="#c1121f" />
              <circle cx="36" cy="27" r="2" fill="#c1121f" />
              <circle cx="24.6" cy="26.4" r="0.6" fill="#ffffff" />
              <circle cx="36.6" cy="26.4" r="0.6" fill="#ffffff" />
              {/* Smirk with fangs */}
              <path d="M 24.5 32.5 Q 30 35.5 35.5 32.5" stroke="#5a1413" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              <polygon points="25.5,33 28,33.6 26.6,37.5" fill="#ffffff" />
              <polygon points="34.5,33 32,33.6 33.4,37.5" fill="#ffffff" />
            </svg>
          );
        case 2: // Werewolf
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Tall torn ears */}
              <polygon points="15,21 9,4 25,14" fill="#5b4334" stroke="#3e2b1f" strokeWidth="1.5" />
              <polygon points="17,18 13,8 22,14" fill="#2c1f16" />
              <polygon points="45,21 51,4 35,14" fill="#5b4334" stroke="#3e2b1f" strokeWidth="1.5" />
              <polygon points="43,18 47,8 38,14" fill="#2c1f16" />
              {/* Shaggy cheek fur */}
              <path d="M 16 28 L 7 32 L 15 35 L 6 41 L 16 42 Z" fill="#5b4334" />
              <path d="M 44 28 L 53 32 L 45 35 L 54 41 L 44 42 Z" fill="#5b4334" />
              {/* Head */}
              <ellipse cx="30" cy="29" rx="16" ry="15.5" fill="#6e543f" stroke="#4a3527" strokeWidth="2" />
              {/* Brow fur */}
              <path d="M 18 21 L 26 24 M 42 21 L 34 24" stroke="#3e2b1f" strokeWidth="2.4" strokeLinecap="round" />
              {/* Yellow eyes with slit pupils */}
              <ellipse cx="22.5" cy="26.5" rx="3.2" ry="2.6" fill="#ffd23f" stroke="#9c7c12" strokeWidth="0.8" />
              <line x1="22.5" y1="24.4" x2="22.5" y2="28.6" stroke="#1d1410" strokeWidth="1.2" />
              <ellipse cx="37.5" cy="26.5" rx="3.2" ry="2.6" fill="#ffd23f" stroke="#9c7c12" strokeWidth="0.8" />
              <line x1="37.5" y1="24.4" x2="37.5" y2="28.6" stroke="#1d1410" strokeWidth="1.2" />
              {/* Muzzle */}
              <ellipse cx="30" cy="38.5" rx="9.5" ry="8" fill="#a08566" />
              <ellipse cx="30" cy="34.5" rx="3.2" ry="2.4" fill="#1d1410" />
              {/* Snarl with fangs */}
              <path d="M 23.5 41 Q 30 45.5 36.5 41" stroke="#3e2b1f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <polygon points="24.5,41.6 27,42.4 25.6,38.2" fill="#f5f0e6" />
              <polygon points="35.5,41.6 33,42.4 34.4,38.2" fill="#f5f0e6" />
              {/* Chest fur tuft */}
              <path d="M 25 52 L 30 59 L 35 52 L 30 55 Z" fill="#5b4334" />
            </svg>
          );
        case 3: // Golem
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Stone shoulders */}
              <rect x="12" y="46" width="36" height="18" rx="5" fill="#6b737d" stroke="#4a525c" strokeWidth="1.8" />
              <path d="M 14 50 L 22 50 M 38 50 L 46 50 M 26 56 L 34 56" stroke="#4a525c" strokeWidth="1.2" />
              {/* Stone head */}
              <rect x="16" y="9" width="28" height="35" rx="7" fill="#828b96" stroke="#5a626c" strokeWidth="2" />
              {/* Brow ledge */}
              <path d="M 18 22 L 42 22 L 40 17.5 L 20 17.5 Z" fill="#6b737d" stroke="#5a626c" strokeWidth="1" />
              {/* Glowing rune eyes */}
              <rect x="21" y="24.5" width="6.5" height="4" rx="1.2" fill="#ffb84d" />
              <rect x="32.5" y="24.5" width="6.5" height="4" rx="1.2" fill="#ffb84d" />
              {/* Carved forehead rune */}
              <path d="M 30 11 L 27.5 15 L 32.5 15 Z M 30 15 L 30 17" stroke="#5a626c" strokeWidth="1.3" fill="none" />
              {/* Cracks */}
              <path d="M 18 33 L 23 35 L 21 39 M 44 13 L 40 17 M 38 38 L 42 41 L 40 44" stroke="#5a626c" strokeWidth="1.3" fill="none" />
              {/* Stone jaw */}
              <path d="M 25 38.5 L 35 38.5" stroke="#4a525c" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 28 36.8 L 28 40.2 M 32 36.8 L 32 40.2" stroke="#4a525c" strokeWidth="1.2" />
              {/* Moss patches */}
              <path d="M 16 14 C 18 11 22 11 23 14 C 20 16 17 16 16 14 Z" fill="#5d8a48" />
              <path d="M 38 42 C 40 40 43 40 44 43 C 42 44.5 39 44.5 38 42 Z" fill="#5d8a48" />
              <path d="M 14 47 C 16 44.5 19 44.5 20 47 C 18 48.8 15 48.8 14 47 Z" fill="#5d8a48" />
            </svg>
          );
        case 4: // Knight
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Plumed crest */}
              <path d="M 30 6 C 36 6 40 11 39 18 L 33 16 C 33 11 31 8 30 6 Z" fill="#b3122e" stroke="#7a0b14" strokeWidth="1" />
              <path d="M 30 6 C 24 6 20 11 21 18 L 27 16 C 27 11 29 8 30 6 Z" fill="#c1313f" stroke="#7a0b14" strokeWidth="1" />
              {/* Gorget / shoulders */}
              <path d="M 13 64 C 13 52 20 48 30 48 C 40 48 47 52 47 64 Z" fill="#5a626c" stroke="#3a4048" strokeWidth="1.8" />
              <path d="M 22 50 L 30 54 L 38 50" fill="none" stroke="#3a4048" strokeWidth="1.4" />
              {/* Steel helm */}
              <path d="M 17 30 C 17 16 43 16 43 30 L 43 44 C 43 49 38 51 30 51 C 22 51 17 49 17 44 Z" fill="#9aa3ad" stroke="#5a626c" strokeWidth="2" />
              {/* Helm sheen */}
              <path d="M 21 22 C 24 18 30 17 30 17 L 30 47 C 24 47 21 44 21 40 Z" fill="#b8c0c9" opacity="0.5" />
              {/* Visor slit + breaths */}
              <rect x="19" y="29" width="22" height="4.5" rx="2" fill="#16191e" />
              <circle cx="25" cy="31.2" r="1.2" fill="#7df9ff" />
              <circle cx="35" cy="31.2" r="1.2" fill="#7df9ff" />
              <path d="M 23 40 L 23 47 M 27 41 L 27 48 M 30 41.5 L 30 48.5 M 33 41 L 33 48 M 37 40 L 37 47" stroke="#5a626c" strokeWidth="1.5" />
              {/* Rivets */}
              <circle cx="19" cy="27" r="1.3" fill="#5a626c" />
              <circle cx="41" cy="27" r="1.3" fill="#5a626c" />
            </svg>
          );
        case 5: // Kraken
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Churning waves */}
              <path d="M 5 58 Q 14 53 22 58 Q 30 53 38 58 Q 46 53 55 58 L 55 66 L 5 66 Z" fill="#1d3b4a" stroke="#12262f" strokeWidth="1.2" />
              {/* Writhing tentacles */}
              <path d="M 22 44 C 14 48 11 56 4 56 C 9 52 9 47 12 44 Z" fill="#4a2b6e" stroke="#2e1846" strokeWidth="1.2" />
              <path d="M 38 44 C 46 48 49 56 56 56 C 51 52 51 47 48 44 Z" fill="#4a2b6e" stroke="#2e1846" strokeWidth="1.2" />
              <path d="M 24 47 C 20 54 22 60 18 64 C 16 58 15 52 18 47 Z" fill="#5b357f" stroke="#2e1846" strokeWidth="1.2" />
              <path d="M 36 47 C 40 54 38 60 42 64 C 44 58 45 52 42 47 Z" fill="#5b357f" stroke="#2e1846" strokeWidth="1.2" />
              {/* Suckers */}
              <circle cx="9" cy="53" r="1.3" fill="#3ab0c4" /><circle cx="14" cy="50" r="1.1" fill="#3ab0c4" />
              <circle cx="51" cy="53" r="1.3" fill="#3ab0c4" /><circle cx="46" cy="50" r="1.1" fill="#3ab0c4" />
              {/* Bulbous head */}
              <path d="M 16 26 C 16 12 44 12 44 26 C 44 38 37 46 30 46 C 23 46 16 38 16 26 Z" fill="#6e3f96" stroke="#3f2360" strokeWidth="2" />
              {/* Head sheen + mottling */}
              <path d="M 22 19 C 25 15 30 14 30 14 C 30 14 28 22 26 28 C 23 27 21 23 22 19 Z" fill="#8a5cb0" opacity="0.6" />
              <circle cx="36" cy="22" r="2" fill="#5b357f" /><circle cx="38" cy="30" r="1.6" fill="#5b357f" />
              {/* Fierce eyes with slit pupils */}
              <ellipse cx="24" cy="29" rx="4" ry="3.2" fill="#ffd23f" stroke="#9c7c12" strokeWidth="0.8" />
              <line x1="24" y1="26.4" x2="24" y2="31.6" stroke="#1d1410" strokeWidth="1.4" />
              <ellipse cx="36" cy="29" rx="4" ry="3.2" fill="#ffd23f" stroke="#9c7c12" strokeWidth="0.8" />
              <line x1="36" y1="26.4" x2="36" y2="31.6" stroke="#1d1410" strokeWidth="1.4" />
              {/* Beak */}
              <polygon points="27,37 33,37 30,42" fill="#1d1410" />
            </svg>
          );
        case 6: // Ghost
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Floating shadow */}
              <ellipse cx="30" cy="63" rx="14" ry="3" fill="#1d1426" opacity="0.3" />
              {/* Sheet body with wavy hem */}
              <path d="M 14 58 L 14 28 C 14 13 46 13 46 28 L 46 58 L 41 52 L 36 59 L 30 52 L 24 59 L 19 52 Z" fill="#f2f2f7" stroke="#b9b9cc" strokeWidth="2" />
              {/* Side arms */}
              <path d="M 14 34 Q 6 36 7 43 Q 12 42 15 39 M 46 34 Q 54 36 53 43 Q 48 42 45 39" fill="#f2f2f7" stroke="#b9b9cc" strokeWidth="1.6" />
              {/* Hollow eyes + wailing mouth */}
              <ellipse cx="23.5" cy="29" rx="3.2" ry="4.6" fill="#1d1426" />
              <ellipse cx="36.5" cy="29" rx="3.2" ry="4.6" fill="#1d1426" />
              <ellipse cx="30" cy="40" rx="4" ry="5.5" fill="#1d1426" />
              {/* Faint cheek glow */}
              <circle cx="18.5" cy="35" r="2.4" fill="#c9d6ff" opacity="0.6" />
              <circle cx="41.5" cy="35" r="2.4" fill="#c9d6ff" opacity="0.6" />
            </svg>
          );
        case 7: // Wizard
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Robe shoulders */}
              <path d="M 16 64 C 16 52 22 48 30 48 C 38 48 44 52 44 64 Z" fill="#2e2a6e" stroke="#1c1846" strokeWidth="1.8" />
              {/* Long flowing beard */}
              <path d="M 21 38 C 21 56 25 62 30 64 C 35 62 39 56 39 38 C 35 42 25 42 21 38 Z" fill="#e8e8ee" stroke="#c2c2cc" strokeWidth="1.2" />
              <path d="M 27 50 Q 30 53 33 50 M 28 56 Q 30 58 32 56" stroke="#c2c2cc" strokeWidth="1" fill="none" />
              {/* Face */}
              <ellipse cx="30" cy="33" rx="10.5" ry="10" fill="#d8b58c" stroke="#b3936a" strokeWidth="1.5" />
              {/* Tall pointed hat */}
              <path d="M 18 25 C 25 21 35 21 42 25 L 34 5 Q 32 1 28 5 Z" fill="#312c7a" stroke="#1c1846" strokeWidth="1.4" />
              <path d="M 18 25 C 25 21 35 21 42 25 L 41 28 C 35 24 25 24 19 28 Z" fill="#221d5c" />
              {/* Stars on hat */}
              <polygon points="30,12 31,15 34,15 31.5,17 32.5,20 30,18 27.5,20 28.5,17 26,15 29,15" fill="#ffd23f" />
              <circle cx="26" cy="20" r="0.9" fill="#ffd23f" /><circle cx="35" cy="19" r="0.9" fill="#ffd23f" />
              {/* Bushy brows + kind eyes */}
              <path d="M 22 29 L 27.5 30.5 M 38 29 L 32.5 30.5" stroke="#e8e8ee" strokeWidth="2" strokeLinecap="round" />
              <circle cx="25.5" cy="32.5" r="1.6" fill="#2e4a6e" />
              <circle cx="34.5" cy="32.5" r="1.6" fill="#2e4a6e" />
              {/* Moustache flowing into beard */}
              <path d="M 24 39 Q 30 41 36 39" stroke="#c2c2cc" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          );
        case 8: // Grim Reaper
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Scythe */}
              <line x1="43" y1="10" x2="49" y2="60" stroke="#5a4632" strokeWidth="3" strokeLinecap="round" />
              <path d="M 43.5 10 C 31 4 18 8 10 19 C 21 12 33 13 44.5 16.5 Z" fill="#c9ced6" stroke="#8f99a6" strokeWidth="1.2" />
              {/* Hooded robe */}
              <path d="M 11 62 C 7 32 16 11 28 11 C 40 11 49 32 45 62 Z" fill="#1f1b2e" stroke="#100d1a" strokeWidth="2" />
              {/* Hood rim */}
              <path d="M 17 38 C 15 20 22 14 28 14 C 34 14 41 20 39 38 C 34 42 22 42 17 38 Z" fill="#2c2742" />
              {/* Void face with glowing eyes */}
              <ellipse cx="28" cy="29" rx="8.5" ry="10.5" fill="#0a0812" />
              <circle cx="24.5" cy="28" r="1.9" fill="#7df9ff" />
              <circle cx="31.5" cy="28" r="1.9" fill="#7df9ff" />
              {/* Rope belt */}
              <path d="M 18 52 Q 28 56 38 52" stroke="#5a4632" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            </svg>
          );
        default: // 9 - Skeleton
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Crossbones */}
              <g stroke="#d9cfb4" strokeWidth="4.5" strokeLinecap="round">
                <line x1="12" y1="44" x2="48" y2="62" />
                <line x1="48" y1="44" x2="12" y2="62" />
              </g>
              <g fill="#d9cfb4">
                <circle cx="11" cy="42" r="3" /><circle cx="15" cy="46" r="3" />
                <circle cx="49" cy="42" r="3" /><circle cx="45" cy="46" r="3" />
                <circle cx="11" cy="64" r="3" /><circle cx="15" cy="60" r="3" />
                <circle cx="49" cy="64" r="3" /><circle cx="45" cy="60" r="3" />
              </g>
              {/* Skull */}
              <path d="M 14 26 C 14 11 46 11 46 26 C 46 35 41 39 38 41 L 38 48 L 22 48 L 22 41 C 19 39 14 35 14 26 Z" fill="#f2ead8" stroke="#c9bb9b" strokeWidth="2" />
              {/* Eye sockets + nasal cavity */}
              <ellipse cx="22.5" cy="26.5" rx="4.6" ry="5.4" fill="#1d1410" />
              <ellipse cx="37.5" cy="26.5" rx="4.6" ry="5.4" fill="#1d1410" />
              <polygon points="30,32 27.5,38 32.5,38" fill="#1d1410" />
              {/* Teeth */}
              <path d="M 24 42 L 36 42 M 27 42 L 27 47.5 M 30 42 L 30 47.5 M 33 42 L 33 47.5" stroke="#c9bb9b" strokeWidth="1.3" />
            </svg>
          );
      }

    case 'circle': // CURSED ARTIFACTS
      switch (value) {
        case 1: // Potion
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Cork + neck */}
              <rect x="25.5" y="5" width="9" height="6" rx="1.5" fill="#8a5a36" stroke="#5d3a20" strokeWidth="1" />
              <rect x="26.5" y="11" width="7" height="9" fill="#cfe8df" stroke="#7fa08f" strokeWidth="1.5" />
              {/* Round flask */}
              <path d="M 26.5 19 C 16 23 12 37 17 46 C 21 54 39 54 43 46 C 48 37 44 23 33.5 19 Z" fill="#cfe8df" stroke="#7fa08f" strokeWidth="2" />
              {/* Glowing green brew */}
              <path d="M 16.5 37 C 21 33.5 39 33.5 43.5 37 C 43.5 44 38 51 30 51 C 22 51 16.5 44 16.5 37 Z" fill="#3ddc63" />
              <circle cx="24" cy="40" r="2" fill="#9ff2b1" />
              <circle cx="33" cy="44" r="2.6" fill="#9ff2b1" />
              <circle cx="29" cy="29" r="1.6" fill="#9ff2b1" />
              <circle cx="34" cy="24" r="1.2" fill="#9ff2b1" />
              {/* Skull label */}
              <circle cx="30" cy="41" r="4.6" fill="#f2ead8" />
              <circle cx="28.3" cy="40" r="1.1" fill="#1d1410" />
              <circle cx="31.7" cy="40" r="1.1" fill="#1d1410" />
              <rect x="28.6" y="42.6" width="2.8" height="1.6" fill="#1d1410" />
            </svg>
          );
        case 2: // Crystal Ball
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Clawed stand */}
              <path d="M 17 51 L 43 51 L 37 61 L 23 61 Z" fill="#3b2a4a" stroke="#241a30" strokeWidth="1.5" />
              <ellipse cx="30" cy="51" rx="14" ry="3.4" fill="#d4af37" stroke="#8c6d1f" strokeWidth="1.2" />
              {/* Orb */}
              <circle cx="30" cy="31" r="17.5" fill="#7b4fd0" stroke="#4a2b8c" strokeWidth="2" />
              {/* Inner mist swirl */}
              <path d="M 19 31 C 23 23 37 23 41 31 C 36 28 31 33 27 36 C 24 38 20 36 19 31 Z" fill="#a482e8" opacity="0.8" />
              <path d="M 23 38 Q 30 42 38 37" stroke="#c8b3f2" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              {/* Glass glint + sparkles */}
              <path d="M 20 24 A 13 13 0 0 1 28 18" stroke="#e8defc" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <polygon points="38,21 39.2,23.6 42,24 39.8,25.8 40.4,28.5 38,27 35.6,28.5 36.2,25.8 34,24 36.8,23.6" fill="#ffffff" />
            </svg>
          );
        case 3: // Spell Book
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Page block */}
              <rect x="17" y="12" width="32" height="46" rx="3" fill="#e8dcc0" stroke="#b9a98f" strokeWidth="1.2" />
              <path d="M 46 16 L 46 54 M 44 14 L 44 56" stroke="#c9bb9b" strokeWidth="1" />
              {/* Cover with dark spine */}
              <rect x="11" y="10" width="34" height="46" rx="3.5" fill="#3f1d4d" stroke="#241029" strokeWidth="2" />
              <rect x="11" y="10" width="7" height="46" rx="3" fill="#241029" />
              {/* Metal corners + clasp */}
              <path d="M 45 10 L 45 17 L 38 10 Z M 45 56 L 45 49 L 38 56 Z" fill="#8c8c94" />
              <rect x="42" y="29" width="8" height="8" rx="1.5" fill="#d4af37" stroke="#8c6d1f" strokeWidth="1" />
              {/* All-seeing eye emblem */}
              <path d="M 21 31 C 25 25 35 25 39 31 C 35 37 25 37 21 31 Z" fill="#ffd23f" stroke="#8c6d1f" strokeWidth="1.2" />
              <circle cx="30" cy="31" r="3" fill="#3f1d4d" />
              <circle cx="30" cy="31" r="1.1" fill="#ffd23f" />
              {/* Rune scratches */}
              <path d="M 23 44 L 37 44 M 25 48 L 35 48" stroke="#9b6fb5" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          );
        case 4: // Shield
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Heater shield body */}
              <path d="M 12 12 L 48 12 L 48 34 C 48 50 38 60 30 64 C 22 60 12 50 12 34 Z" fill="#3a5a8c" stroke="#22365a" strokeWidth="2.4" />
              {/* Steel rim */}
              <path d="M 12 12 L 48 12 L 48 34 C 48 50 38 60 30 64 C 22 60 12 50 12 34 Z" fill="none" stroke="#aeb6c4" strokeWidth="1.4" />
              {/* Quartered field */}
              <path d="M 30 12 L 30 64 M 12 24 L 48 24" stroke="#22365a" strokeWidth="1.6" />
              <path d="M 12 12 L 30 24 L 12 24 Z M 48 12 L 30 24 L 48 24 Z" fill="#4a6e9e" opacity="0.7" />
              {/* Gold lion crest */}
              <circle cx="30" cy="40" r="11" fill="#d4af37" stroke="#8c6d1f" strokeWidth="1.4" />
              <path d="M 24 40 C 24 35 36 35 36 40 C 36 45 33 47 30 47 C 27 47 24 45 24 40 Z" fill="#8c6d1f" />
              <circle cx="27.5" cy="39" r="1.3" fill="#3a2a0e" />
              <circle cx="32.5" cy="39" r="1.3" fill="#3a2a0e" />
              <path d="M 27 43 Q 30 45 33 43" stroke="#3a2a0e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              {/* Mane spikes */}
              <path d="M 30 29 L 30 27 M 23 31 L 21.5 29.5 M 37 31 L 38.5 29.5" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
              {/* Rivets */}
              <circle cx="16" cy="16" r="1.4" fill="#aeb6c4" />
              <circle cx="44" cy="16" r="1.4" fill="#aeb6c4" />
            </svg>
          );
        case 5: // Treasure Chest
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Glow from within */}
              <ellipse cx="30" cy="34" rx="22" ry="10" fill="#ffd23f" opacity="0.25" />
              {/* Domed lid */}
              <path d="M 11 34 C 11 18 49 18 49 34 Z" fill="#6b4a2f" stroke="#3e2b1a" strokeWidth="2" />
              <path d="M 11 34 C 11 18 49 18 49 34 Z" fill="none" stroke="#8a623c" strokeWidth="1" transform="translate(0,3)" />
              {/* Iron bands on lid */}
              <path d="M 22 20 L 20 34 M 38 20 L 40 34" stroke="#4a525c" strokeWidth="2.6" />
              {/* Chest body */}
              <rect x="11" y="34" width="38" height="24" rx="2.5" fill="#7a542f" stroke="#3e2b1a" strokeWidth="2" />
              <path d="M 11 40 L 49 40" stroke="#3e2b1a" strokeWidth="1" />
              {/* Iron bands on body */}
              <rect x="19" y="34" width="4" height="24" fill="#4a525c" />
              <rect x="37" y="34" width="4" height="24" fill="#4a525c" />
              <rect x="9" y="44" width="42" height="4" fill="#5a626c" stroke="#3a4048" strokeWidth="0.8" />
              {/* Gold lock */}
              <rect x="26" y="42" width="8" height="9" rx="1.5" fill="#d4af37" stroke="#8c6d1f" strokeWidth="1" />
              <circle cx="30" cy="46" r="1.6" fill="#3e2b1a" />
              {/* Spilling coins */}
              <circle cx="18" cy="32" r="2.4" fill="#ffd23f" stroke="#b8901f" strokeWidth="0.7" />
              <circle cx="30" cy="29.5" r="2.6" fill="#ffe066" stroke="#b8901f" strokeWidth="0.7" />
              <circle cx="42" cy="32" r="2.4" fill="#ffd23f" stroke="#b8901f" strokeWidth="0.7" />
              {/* Sparkle */}
              <polygon points="36,25 37,27.4 39.5,27.8 37.6,29.4 38.2,31.8 36,30.4 33.8,31.8 34.4,29.4 32.5,27.8 35,27.4" fill="#fff2c2" />
            </svg>
          );
        case 6: // Candle
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Flame glow */}
              <circle cx="30" cy="14" r="9" fill="#ffd23f" opacity="0.25" />
              {/* Flame */}
              <path d="M 30 6 C 34 11 35 15 30 19 C 25 15 26 11 30 6 Z" fill="#ff8c2e" />
              <path d="M 30 10.5 C 32 13 32 15.5 30 17.5 C 28 15.5 28 13 30 10.5 Z" fill="#ffd23f" />
              <line x1="30" y1="19" x2="30" y2="23" stroke="#1d1410" strokeWidth="1.4" />
              {/* Wax body with drips */}
              <rect x="23" y="23" width="14" height="31" rx="2.5" fill="#4a3766" stroke="#2e2240" strokeWidth="1.8" />
              <path d="M 23 23 C 25 23 25 31 23.5 33 L 23 33 Z" fill="#7c63a8" />
              <path d="M 37 23 C 35.5 23 35 29 36.5 31 L 37 31 Z" fill="#7c63a8" />
              <path d="M 28 23 C 29 26 30.5 26 31 23 Z" fill="#7c63a8" />
              {/* Brass holder */}
              <ellipse cx="30" cy="56" rx="13.5" ry="4" fill="#d4af37" stroke="#8c6d1f" strokeWidth="1.4" />
              <ellipse cx="30" cy="54" rx="9" ry="2.6" fill="#e9c965" />
              <path d="M 43 54 Q 49 55 47 60 Q 44 61 43 58" fill="none" stroke="#8c6d1f" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          );
        case 7: // Amulet
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Chain */}
              <path d="M 12 6 C 16 16 22 22 27 26 M 48 6 C 44 16 38 22 33 26" fill="none" stroke="#8c6d1f" strokeWidth="2" strokeDasharray="3,2" strokeLinecap="round" />
              {/* Bail */}
              <circle cx="30" cy="27" r="3.4" fill="none" stroke="#d4af37" strokeWidth="2.4" />
              {/* Medallion */}
              <circle cx="30" cy="44" r="15" fill="#d4af37" stroke="#8c6d1f" strokeWidth="2" />
              <circle cx="30" cy="44" r="11" fill="none" stroke="#8c6d1f" strokeWidth="1.2" strokeDasharray="2.5,2" />
              {/* Blood-red gem */}
              <polygon points="30,36.5 36.5,44 30,51.5 23.5,44" fill="#c1121f" stroke="#7a0b14" strokeWidth="1.2" />
              <polygon points="30,39 33.5,43 30,44.5 26.5,43" fill="#ff5a64" opacity="0.8" />
              {/* Sparkle */}
              <polygon points="42,32 43,34.4 45.5,34.8 43.6,36.4 44.2,38.8 42,37.4 39.8,38.8 40.4,36.4 38.5,34.8 41,34.4" fill="#fff2c2" />
            </svg>
          );
        case 8: // Dagger
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Blade */}
              <path d="M 30 4 C 35 14 36 28 33 42 L 27 42 C 24 28 25 14 30 4 Z" fill="#cfd6df" stroke="#8f99a6" strokeWidth="1.6" />
              <line x1="30" y1="8" x2="30" y2="41" stroke="#8f99a6" strokeWidth="1.1" />
              <path d="M 28 10 A 30 30 0 0 0 27.5 24" stroke="#f2f5f9" strokeWidth="1.4" fill="none" />
              {/* Cross-guard */}
              <rect x="18" y="42" width="24" height="5" rx="2.5" fill="#d4af37" stroke="#8c6d1f" strokeWidth="1.2" />
              <circle cx="20.5" cy="44.5" r="1.4" fill="#c1121f" />
              <circle cx="39.5" cy="44.5" r="1.4" fill="#c1121f" />
              {/* Wrapped grip */}
              <rect x="26" y="47" width="8" height="14" rx="3" fill="#5a2330" stroke="#3a1620" strokeWidth="1.4" />
              <path d="M 26 50 L 34 52 M 26 54 L 34 56" stroke="#3a1620" strokeWidth="1.2" />
              {/* Pommel */}
              <circle cx="30" cy="63" r="3.6" fill="#d4af37" stroke="#8c6d1f" strokeWidth="1.2" />
              <circle cx="30" cy="63" r="1.4" fill="#c1121f" />
            </svg>
          );
        default: // 9 - Hourglass
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Frame */}
              <rect x="15" y="6" width="30" height="5" rx="2" fill="#5a4632" stroke="#3a2c1e" strokeWidth="1.2" />
              <rect x="15" y="59" width="30" height="5" rx="2" fill="#5a4632" stroke="#3a2c1e" strokeWidth="1.2" />
              <line x1="17.5" y1="11" x2="17.5" y2="59" stroke="#5a4632" strokeWidth="2.6" />
              <line x1="42.5" y1="11" x2="42.5" y2="59" stroke="#5a4632" strokeWidth="2.6" />
              {/* Glass */}
              <path d="M 21 11 H 39 C 39 21 32 26 30.8 33 L 30.8 37 C 32 44 39 49 39 59 H 21 C 21 49 28 44 29.2 37 L 29.2 33 C 28 26 21 21 21 11 Z" fill="#d8ecf2" stroke="#7fa0ad" strokeWidth="1.8" opacity="0.9" />
              {/* Blood-red sand */}
              <path d="M 24 13 H 36 C 36 18 32.5 21 30 24 C 27.5 21 24 18 24 13 Z" fill="#c1121f" />
              <line x1="30" y1="30" x2="30" y2="50" stroke="#c1121f" strokeWidth="1.6" />
              <path d="M 23.5 56.5 C 25 50 35 50 36.5 56.5 Z" fill="#c1121f" />
            </svg>
          );
      }

    case 'character': // HAUNTED WORLD
      switch (value) {
        case 1: // Castle
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Moon behind */}
              <circle cx="44" cy="14" r="8" fill="#f2e9c9" opacity="0.9" />
              {/* Side towers */}
              <rect x="9" y="28" width="11" height="34" fill="#241a33" stroke="#171024" strokeWidth="1.4" />
              <polygon points="7,28 14.5,14 22,28" fill="#171024" />
              <rect x="40" y="28" width="11" height="34" fill="#241a33" stroke="#171024" strokeWidth="1.4" />
              <polygon points="38,28 45.5,14 53,28" fill="#171024" />
              {/* Keep with battlements */}
              <path d="M 18 62 L 18 34 L 22 34 L 22 30 L 26 30 L 26 34 L 34 34 L 34 30 L 38 30 L 38 34 L 42 34 L 42 62 Z" fill="#352950" stroke="#171024" strokeWidth="1.4" />
              {/* Gate + glowing windows */}
              <path d="M 26 62 L 26 50 C 26 45 34 45 34 50 L 34 62 Z" fill="#171024" />
              <rect x="12.5" y="34" width="4" height="6.5" rx="2" fill="#ffd23f" />
              <rect x="43.5" y="34" width="4" height="6.5" rx="2" fill="#ffd23f" />
              <rect x="28" y="37" width="4" height="6" rx="2" fill="#ffd23f" />
            </svg>
          );
        case 2: // Full Moon with bats
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Night sky card */}
              <rect x="6" y="8" width="48" height="54" rx="5.5" fill="#101522" />
              {/* Moon with craters */}
              <circle cx="30" cy="34" r="16" fill="#f2e9c9" stroke="#d9cb96" strokeWidth="1.5" />
              <circle cx="24" cy="29" r="3.4" fill="#ddd0a4" />
              <circle cx="36" cy="40" r="2.6" fill="#ddd0a4" />
              <circle cx="34" cy="27" r="1.8" fill="#ddd0a4" />
              {/* Bats */}
              <path d="M 18 18 Q 21 14 24 18 Q 25 15.5 26 18 Q 27 15.5 28 18 Q 31 14 34 18 L 26 21 Z" fill="#1d1426" transform="translate(-6,-2) scale(0.85)" />
              <path d="M 30 50 Q 33 46 36 50 Q 37 47.5 38 50 Q 39 47.5 40 50 Q 43 46 46 50 L 38 53 Z" fill="#1d1426" />
              {/* Stars */}
              <circle cx="12" cy="14" r="1" fill="#fff2c2" />
              <circle cx="48" cy="20" r="1.2" fill="#fff2c2" />
              <circle cx="14" cy="54" r="1" fill="#fff2c2" />
            </svg>
          );
        case 3: // Sword in the Stone
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Glow halo */}
              <ellipse cx="30" cy="20" rx="13" ry="16" fill="#9fd0ff" opacity="0.18" />
              {/* Blade */}
              <polygon points="30,5 33,9 32.5,38 27.5,38 27,9" fill="#dbe3ee" stroke="#9aa3ad" strokeWidth="1.4" />
              <line x1="30" y1="9" x2="30" y2="37" stroke="#aeb6c4" strokeWidth="1" />
              {/* Cross-guard */}
              <rect x="19" y="37" width="22" height="4.5" rx="2" fill="#d4af37" stroke="#8c6d1f" strokeWidth="1.2" />
              <circle cx="21.5" cy="39.2" r="1.3" fill="#9fd0ff" />
              <circle cx="38.5" cy="39.2" r="1.3" fill="#9fd0ff" />
              {/* Grip (rises out of the stone) */}
              <rect x="27.5" y="41.5" width="5" height="9" rx="1.5" fill="#5a3a22" stroke="#3a2614" strokeWidth="1" />
              <path d="M 27.5 44 L 32.5 45.5 M 27.5 47 L 32.5 48.5" stroke="#3a2614" strokeWidth="0.9" />
              {/* The stone */}
              <path d="M 12 60 C 11 50 16 46 22 46 L 38 46 C 44 46 49 50 48 60 Z" fill="#7a828c" stroke="#565d66" strokeWidth="2" />
              <path d="M 12 60 C 11 50 16 46 22 46 L 38 46 C 44 46 49 50 48 60 Z" fill="none" stroke="#9aa3ad" strokeWidth="1" transform="translate(0,2)" />
              {/* Embedded slot + cracks */}
              <rect x="27" y="46" width="6" height="4" fill="#2c3138" />
              <path d="M 18 52 L 22 55 L 20 58 M 42 52 L 38 55 L 40 58" stroke="#565d66" strokeWidth="1.2" fill="none" />
              {/* Sparkle on blade */}
              <polygon points="30,14 31,17 34,17.5 31.5,19 32,22 30,20.4 28,22 28.5,19 26,17.5 29,17" fill="#ffffff" />
            </svg>
          );
        case 4: // Dead Tree
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Ground */}
              <path d="M 8 62 Q 30 57 52 62" fill="none" stroke="#3e2b1f" strokeWidth="2.4" strokeLinecap="round" />
              {/* Gnarled trunk and branches */}
              <path d="M 26.5 62 C 27.5 52 27 46 26 40 C 18 38 10 28 8 16 C 15 25 21 30 26 32 L 25 24 C 23 18 25 11 29 6 C 32 11 34 18 32 24 L 31.5 31 C 37 28 44 23 51 12 C 49 25 41 36 33 40 C 32.5 46 32.5 52 33.5 62 Z" fill="#241a14" stroke="#15100c" strokeWidth="1.4" />
              {/* Broken twig stubs */}
              <path d="M 14 22 L 10 20 M 44 20 L 48 16 M 29 12 L 27 8" stroke="#241a14" strokeWidth="2" strokeLinecap="round" />
              {/* Root flare */}
              <path d="M 26.5 62 L 20 65 M 33.5 62 L 40 65" stroke="#241a14" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          );
        case 5: // Mage Tower
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Tall tower shaft */}
              <path d="M 21 60 L 22 26 L 38 26 L 39 60 Z" fill="#3a3550" stroke="#221f33" strokeWidth="1.8" />
              {/* Stonework */}
              <path d="M 22 34 L 38 34 M 22 42 L 38 42 M 22 50 L 38 50 M 30 26 L 30 34 M 26 34 L 26 42 M 34 34 L 34 42 M 30 42 L 30 50 M 26 50 L 26 58 M 34 50 L 34 58" stroke="#221f33" strokeWidth="0.9" />
              {/* Battlement base of the cap */}
              <path d="M 18 26 L 18 22 L 21 22 L 21 19 L 25 19 L 25 22 L 28 22 L 28 19 L 32 19 L 32 22 L 35 22 L 35 19 L 39 19 L 39 22 L 42 22 L 42 26 Z" fill="#4a4566" stroke="#221f33" strokeWidth="1.2" />
              {/* Conical wizard roof */}
              <polygon points="30,2 44,20 16,20" fill="#4a2b8c" stroke="#2c1856" strokeWidth="1.6" />
              <path d="M 30 2 L 30 20 M 23 11 L 37 11" stroke="#2c1856" strokeWidth="0.9" />
              {/* Banner */}
              <line x1="30" y1="2" x2="30" y2="-2" stroke="#8c6d1f" strokeWidth="1" />
              <polygon points="30,0 38,2 30,5" fill="#b3122e" />
              {/* Glowing arcane window */}
              <path d="M 27 36 C 27 31 33 31 33 36 L 33 44 L 27 44 Z" fill="#7df9ff" stroke="#2c4a5a" strokeWidth="1" />
              <circle cx="30" cy="39" r="1.6" fill="#ffffff" />
              {/* Magic sparkles around the spire */}
              <polygon points="48,16 49,18.4 51.5,18.8 49.6,20.4 50.2,22.8 48,21.4 45.8,22.8 46.4,20.4 44.5,18.8 47,18.4" fill="#c9b3ff" />
              <circle cx="12" cy="22" r="1.3" fill="#c9b3ff" />
              <circle cx="46" cy="30" r="1.1" fill="#c9b3ff" />
            </svg>
          );
        case 6: // Bat
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Wings (mirrored) */}
              <path d="M 26 28 C 18 17 9 14 2 19 C 8 22 9 27 7 33 C 13 30 16 33 17 39 C 21 36 25 38 26 44 Z" fill="#1d1426" stroke="#100c18" strokeWidth="1.2" />
              <path d="M 26 28 C 18 17 9 14 2 19 C 8 22 9 27 7 33 C 13 30 16 33 17 39 C 21 36 25 38 26 44 Z" fill="#1d1426" stroke="#100c18" strokeWidth="1.2" transform="translate(60,0) scale(-1,1)" />
              {/* Body */}
              <ellipse cx="30" cy="37" rx="7.5" ry="10" fill="#2c2240" stroke="#100c18" strokeWidth="1.4" />
              {/* Head + ears */}
              <circle cx="30" cy="25" r="7" fill="#2c2240" stroke="#100c18" strokeWidth="1.4" />
              <polygon points="24,21 22,12 28,17" fill="#2c2240" stroke="#100c18" strokeWidth="1" />
              <polygon points="36,21 38,12 32,17" fill="#2c2240" stroke="#100c18" strokeWidth="1" />
              {/* Face */}
              <circle cx="27" cy="24.5" r="1.7" fill="#ffd23f" />
              <circle cx="33" cy="24.5" r="1.7" fill="#ffd23f" />
              <polygon points="27.5,29 29,29.3 28.2,31.8" fill="#f5f0e6" />
              <polygon points="32.5,29 31,29.3 31.8,31.8" fill="#f5f0e6" />
            </svg>
          );
        case 7: // Spider
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Web corner */}
              <path d="M 4 4 L 22 22 M 4 14 Q 12 14 18 20 M 14 4 Q 14 12 20 18" stroke="#b9b9cc" strokeWidth="1" fill="none" opacity="0.7" />
              {/* Silk thread */}
              <line x1="30" y1="2" x2="30" y2="20" stroke="#b9b9cc" strokeWidth="1.4" />
              {/* Legs */}
              <g stroke="#16121e" strokeWidth="2.4" fill="none" strokeLinecap="round">
                <path d="M 24 32 C 16 28 12 22 11 16" />
                <path d="M 23 38 C 14 37 9 33 6 28" />
                <path d="M 23 44 C 15 47 10 52 8 58" />
                <path d="M 25 49 C 20 55 18 60 18 64" />
                <path d="M 36 32 C 44 28 48 22 49 16" />
                <path d="M 37 38 C 46 37 51 33 54 28" />
                <path d="M 37 44 C 45 47 50 52 52 58" />
                <path d="M 35 49 C 40 55 42 60 42 64" />
              </g>
              {/* Head + abdomen */}
              <circle cx="30" cy="28" r="6.5" fill="#16121e" />
              <circle cx="27.5" cy="26.5" r="1.5" fill="#c1121f" />
              <circle cx="32.5" cy="26.5" r="1.5" fill="#c1121f" />
              <ellipse cx="30" cy="44" rx="10.5" ry="12" fill="#241a30" stroke="#100c18" strokeWidth="1.4" />
              {/* Red hourglass mark */}
              <polygon points="30,38 33,42 30,46 27,42" fill="#c1121f" />
            </svg>
          );
        case 8: // Raven
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Perch branch */}
              <line x1="8" y1="56" x2="52" y2="56" stroke="#3e2b1f" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M 44 56 L 50 50" stroke="#3e2b1f" strokeWidth="2.4" strokeLinecap="round" />
              {/* Tail feathers */}
              <path d="M 22 48 L 8 56 L 22 54 Z" fill="#16121e" />
              {/* Body */}
              <path d="M 20 50 C 18 38 24 28 33 27 C 40 26.5 44 30 44 34 C 44 36 42.5 37.5 40.5 38 C 43 44 41 52 34 55 L 23 55 C 21 54 20 52 20 50 Z" fill="#16121e" stroke="#0b0913" strokeWidth="1.2" />
              {/* Wing fold */}
              <path d="M 24 40 C 27 36 34 35 38 38 C 35 42 29 46 25 50 C 23.5 47 23 43 24 40 Z" fill="#2c2438" />
              {/* Beak + eye */}
              <polygon points="43.5,32 53,34.5 43,36.5" fill="#6b737d" stroke="#4a525c" strokeWidth="0.8" />
              <circle cx="38.5" cy="32" r="1.8" fill="#f2f2f7" />
              <circle cx="38.9" cy="32.2" r="0.9" fill="#0b0913" />
              {/* Feet */}
              <path d="M 27 55 L 27 58 M 33 55 L 33 58" stroke="#6b737d" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          );
        default: // 9 - Black Cat
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Curled tail */}
              <path d="M 44 56 C 54 54 56 44 50 40 C 48 44 46 48 42 50" fill="#16121e" stroke="#0b0913" strokeWidth="1.2" />
              {/* Sitting body */}
              <path d="M 16 62 C 14 46 20 38 30 38 C 40 38 46 46 44 62 Z" fill="#16121e" stroke="#0b0913" strokeWidth="1.4" />
              {/* Head */}
              <circle cx="30" cy="26" r="13" fill="#16121e" stroke="#0b0913" strokeWidth="1.4" />
              {/* Ears */}
              <polygon points="19,18 16,4 28,12" fill="#16121e" stroke="#0b0913" strokeWidth="1" />
              <polygon points="21,15 19,8 26,12" fill="#5b2a86" />
              <polygon points="41,18 44,4 32,12" fill="#16121e" stroke="#0b0913" strokeWidth="1" />
              <polygon points="39,15 41,8 34,12" fill="#5b2a86" />
              {/* Green eyes */}
              <ellipse cx="24.5" cy="25" rx="3" ry="3.8" fill="#52e06d" />
              <line x1="24.5" y1="22" x2="24.5" y2="28" stroke="#0b0913" strokeWidth="1.3" />
              <ellipse cx="35.5" cy="25" rx="3" ry="3.8" fill="#52e06d" />
              <line x1="35.5" y1="22" x2="35.5" y2="28" stroke="#0b0913" strokeWidth="1.3" />
              {/* Muzzle + whiskers */}
              <polygon points="28.5,30 31.5,30 30,32" fill="#b3122e" />
              <path d="M 30 32 Q 27.5 34.5 25.5 33.5 M 30 32 Q 32.5 34.5 34.5 33.5" stroke="#0b0913" strokeWidth="1.1" fill="none" />
              <path d="M 18 29 L 9 28 M 18 32 L 10 34 M 42 29 L 51 28 M 42 32 L 50 34" stroke="#6b737d" strokeWidth="1" />
              {/* Front paws */}
              <path d="M 24 62 L 24 56 M 36 62 L 36 56" stroke="#0b0913" strokeWidth="2" strokeLinecap="round" />
            </svg>
          );
      }

    case 'wind': // OMENS
      switch (value) {
        case 0: // Storm
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Thundercloud */}
              <path d="M 14 34 C 8 32 8 22 17 20 C 19 11 38 10 42 19 C 51 20 52 31 45 34 Z" fill="#3a3550" stroke="#241f38" strokeWidth="2" />
              <path d="M 18 24 C 22 20 30 19 35 22" stroke="#55507a" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* Twin bolts */}
              <polygon points="26,34 19,46 25,46 21,57 32,44 26,44" fill="#ffd23f" stroke="#b88f12" strokeWidth="0.8" />
              <polygon points="40,34 36,42 40,42 37,50 45,41 41,41" fill="#ff8c2e" />
              {/* Rain */}
              <path d="M 14 40 L 12 46 M 47 40 L 45 46 M 33 56 L 31 62" stroke="#7d88b3" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          );
        case 1: // Blood Moon
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Night card */}
              <rect x="6" y="8" width="48" height="54" rx="5.5" fill="#140d12" />
              {/* Glow */}
              <circle cx="30" cy="34" r="20" fill="#c1121f" opacity="0.25" />
              {/* Red moon with craters */}
              <circle cx="30" cy="34" r="15" fill="#c1121f" stroke="#7a0b14" strokeWidth="1.6" />
              <circle cx="24" cy="29" r="3.2" fill="#8c0d18" />
              <circle cx="35" cy="39" r="2.6" fill="#8c0d18" />
              <circle cx="34" cy="27" r="1.6" fill="#8c0d18" />
              <path d="M 18 41 A 15 15 0 0 0 38 47" stroke="#e23b47" strokeWidth="1.6" fill="none" opacity="0.7" />
              {/* Stars */}
              <circle cx="13" cy="15" r="1" fill="#f2d4d7" />
              <circle cx="47" cy="18" r="1.2" fill="#f2d4d7" />
              <circle cx="46" cy="55" r="1" fill="#f2d4d7" />
            </svg>
          );
        case 2: // Fog
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Dead grass */}
              <path d="M 8 60 Q 30 56 52 60" stroke="#3e4a3f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <path d="M 14 59 L 13 53 M 20 58 L 21 52 M 44 58 L 45 53" stroke="#3e4a3f" strokeWidth="1.6" strokeLinecap="round" />
              {/* Half-hidden tombstone */}
              <path d="M 33 52 L 33 36 C 33 28 47 28 47 36 L 47 52 Z" fill="#828b96" opacity="0.7" />
              {/* Rolling mist banks with curls */}
              <path d="M 6 50 C 14 44 26 44 32 49 C 40 44 50 45 54 49 C 50 54 40 55 34 52 C 26 56 12 56 6 50 Z" fill="#aeb6c4" opacity="0.9" />
              <path d="M 10 38 C 16 33 28 33 33 37 C 40 33 48 34 51 38 C 46 42 38 42 33 40 C 26 44 15 43 10 38 Z" fill="#c4cbd6" opacity="0.75" />
              <path d="M 16 27 C 21 23 31 23 35 26 C 40 23 46 24 48 27 C 44 30 38 30 34 29 C 28 32 20 31 16 27 Z" fill="#d6dbe4" opacity="0.6" />
              {/* Mist curl */}
              <path d="M 49 49 q 5 0 4 -4 q -1 -3 -4 -2" stroke="#aeb6c4" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          );
        default: // 3 - Eclipse
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Night card */}
              <rect x="6" y="8" width="48" height="54" rx="5.5" fill="#0e0a16" />
              {/* Corona */}
              <circle cx="30" cy="34" r="18.5" fill="#ffd23f" opacity="0.30" />
              <circle cx="30" cy="34" r="15.5" fill="#ffe89c" opacity="0.55" />
              {/* Corona flares */}
              <g stroke="#ffd23f" strokeWidth="2" strokeLinecap="round" opacity="0.8">
                <line x1="30" y1="12" x2="30" y2="7" />
                <line x1="30" y1="56" x2="30" y2="61" />
                <line x1="8" y1="34" x2="13" y2="34" />
                <line x1="47" y1="34" x2="52" y2="34" />
                <line x1="15" y1="19" x2="18.5" y2="22.5" />
                <line x1="45" y1="49" x2="41.5" y2="45.5" />
                <line x1="45" y1="19" x2="41.5" y2="22.5" />
                <line x1="15" y1="49" x2="18.5" y2="45.5" />
              </g>
              {/* Black disc */}
              <circle cx="30" cy="34" r="13" fill="#0e0a16" stroke="#2c2438" strokeWidth="1.2" />
            </svg>
          );
      }

    case 'dragon': // LEGENDS
      switch (value) {
        case 0: // Dragon
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Spread wings */}
              <path d="M 20 30 C 9 22 4 13 5 5 C 12 11 18 16 24 19 L 22 24 L 27 24 Z" fill="#1f5a3a" stroke="#0e3320" strokeWidth="1.4" />
              <path d="M 40 30 C 51 22 56 13 55 5 C 48 11 42 16 36 19 L 38 24 L 33 24 Z" fill="#1f5a3a" stroke="#0e3320" strokeWidth="1.4" />
              <path d="M 8 9 L 16 19 M 52 9 L 44 19" stroke="#0e3320" strokeWidth="1" />
              {/* Back horns */}
              <polygon points="20,20 14,12 23,17" fill="#cdd6c4" stroke="#8f9c84" strokeWidth="1" />
              <polygon points="40,20 46,12 37,17" fill="#cdd6c4" stroke="#8f9c84" strokeWidth="1" />
              {/* Scaled head */}
              <path d="M 18 30 C 18 19 42 19 42 30 L 42 40 C 42 50 36 55 30 55 C 24 55 18 50 18 40 Z" fill="#2e8c52" stroke="#176336" strokeWidth="2" />
              {/* Brow ridges */}
              <path d="M 21 28 L 28 31 M 39 28 L 32 31" stroke="#176336" strokeWidth="2.4" strokeLinecap="round" />
              {/* Reptilian eyes with slit pupils */}
              <ellipse cx="24" cy="33" rx="3.4" ry="2.8" fill="#ffd23f" stroke="#9c7c12" strokeWidth="0.8" />
              <line x1="24" y1="30.6" x2="24" y2="35.4" stroke="#1d1410" strokeWidth="1.3" />
              <ellipse cx="36" cy="33" rx="3.4" ry="2.8" fill="#ffd23f" stroke="#9c7c12" strokeWidth="0.8" />
              <line x1="36" y1="30.6" x2="36" y2="35.4" stroke="#1d1410" strokeWidth="1.3" />
              {/* Snout + nostrils */}
              <path d="M 24 42 C 26 45 34 45 36 42" fill="#247044" />
              <path d="M 27 41 L 26.5 43 M 33 41 L 33.5 43" stroke="#0e3320" strokeWidth="1.5" strokeLinecap="round" />
              {/* Fangs */}
              <polygon points="25,45 27.5,45.5 26,49" fill="#f2ead8" />
              <polygon points="35,45 32.5,45.5 34,49" fill="#f2ead8" />
              {/* Belly scales */}
              <path d="M 26 51 L 30 53 L 34 51" fill="none" stroke="#176336" strokeWidth="1.2" />
              {/* Curl of flame */}
              <path d="M 30 55 C 31 59 29 61 30 64 C 32 61 34 60 33 56 Z" fill="#ff8c2e" />
              <path d="M 30 57 C 30.6 59.5 29.8 60.8 30.4 62.5 C 31.4 60.8 32 60 31.4 57.6 Z" fill="#ffd23f" />
            </svg>
          );
        case 1: // Gargoyle
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Stone wings */}
              <path d="M 18 30 C 8 24 4 14 6 6 C 12 12 18 16 23 18 L 24 30 Z" fill="#6b737d" stroke="#4a525c" strokeWidth="1.6" />
              <path d="M 42 30 C 52 24 56 14 54 6 C 48 12 42 16 37 18 L 36 30 Z" fill="#6b737d" stroke="#4a525c" strokeWidth="1.6" />
              <path d="M 10 12 L 16 22 M 50 12 L 44 22" stroke="#4a525c" strokeWidth="1.2" />
              {/* Crouched stone body */}
              <path d="M 14 62 C 13 48 19 42 30 42 C 41 42 47 48 46 62 Z" fill="#828b96" stroke="#5a626c" strokeWidth="1.8" />
              {/* Clawed feet */}
              <path d="M 19 62 L 17 66 M 23 62 L 22 66 M 37 62 L 38 66 M 41 62 L 43 66" stroke="#4a525c" strokeWidth="2" strokeLinecap="round" />
              {/* Stone head with horn stubs */}
              <path d="M 18 28 C 18 17 42 17 42 28 L 42 33 C 42 41 36 45 30 45 C 24 45 18 41 18 33 Z" fill="#9aa3ad" stroke="#6b737d" strokeWidth="1.8" />
              <polygon points="20,20 17,12 25,16" fill="#828b96" stroke="#5a626c" strokeWidth="1" />
              <polygon points="40,20 43,12 35,16" fill="#828b96" stroke="#5a626c" strokeWidth="1" />
              {/* Glowing white eyes */}
              <circle cx="24.5" cy="28" r="2.4" fill="#f2f2f7" />
              <circle cx="35.5" cy="28" r="2.4" fill="#f2f2f7" />
              {/* Muzzle + stone cracks */}
              <path d="M 25 36 Q 30 39 35 36" stroke="#5a626c" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              <polygon points="26,36.4 28.2,37.2 27,40" fill="#e8e8ee" />
              <polygon points="34,36.4 31.8,37.2 33,40" fill="#e8e8ee" />
              <path d="M 38 22 L 35 26 M 20 50 L 24 54 L 22 58" stroke="#5a626c" strokeWidth="1.1" fill="none" />
            </svg>
          );
        default: // 2 - Cursed Crown
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Purple aura */}
              <ellipse cx="30" cy="36" rx="24" ry="20" fill="#7b4fd0" opacity="0.18" />
              {/* Floating sparks */}
              <circle cx="12" cy="20" r="1.4" fill="#a482e8" />
              <circle cx="49" cy="24" r="1.6" fill="#a482e8" />
              <circle cx="44" cy="12" r="1.1" fill="#a482e8" />
              {/* Iron crown */}
              <polygon points="14,46 10,20 22,33 30,14 38,33 50,20 46,46" fill="#4a4a55" stroke="#2c2c36" strokeWidth="2" />
              {/* Band */}
              <rect x="13" y="44" width="34" height="7" rx="2" fill="#5a5a66" stroke="#2c2c36" strokeWidth="1.6" />
              {/* Crack in the band */}
              <path d="M 26 44 L 28 47 L 26 51 M 28 47 L 31 48" stroke="#1d1d26" strokeWidth="1.2" fill="none" />
              {/* Cursed gems */}
              <circle cx="10.5" cy="19" r="2.6" fill="#7b4fd0" stroke="#4a2b8c" strokeWidth="1" />
              <circle cx="30" cy="13" r="3.2" fill="#52e06d" stroke="#2c8c43" strokeWidth="1" />
              <circle cx="49.5" cy="19" r="2.6" fill="#7b4fd0" stroke="#4a2b8c" strokeWidth="1" />
              <polygon points="30,44.5 33.5,47.5 30,50.5 26.5,47.5" fill="#c1121f" stroke="#7a0b14" strokeWidth="0.8" />
              <circle cx="19" cy="47.5" r="1.6" fill="#7b4fd0" />
              <circle cx="41" cy="47.5" r="1.6" fill="#7b4fd0" />
            </svg>
          );
      }

    case 'season': // MOON PHASES (wildcards — all match each other)
      return (
        <svg viewBox="0 0 60 70" className="tile-svg">
          {/* Shared night-sky card so the wildcard family reads as a set */}
          <rect x="6" y="8" width="48" height="54" rx="5.5" fill="#101522" />
          <circle cx="13" cy="16" r="1" fill="#fff2c2" />
          <circle cx="47" cy="20" r="1.3" fill="#fff2c2" />
          <circle cx="44" cy="54" r="1" fill="#fff2c2" />
          <circle cx="14" cy="50" r="1.2" fill="#fff2c2" />
          {value === 0 && ( // New Moon
            <>
              <circle cx="30" cy="34" r="14" fill="#1c2333" stroke="#55617d" strokeWidth="1.6" />
              <path d="M 20 26 A 13 13 0 0 1 27 21.5" stroke="#3a4459" strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          )}
          {value === 1 && ( // Crescent Moon
            <path d="M 24 20 A 15 15 0 1 0 41 44 A 12 12 0 1 1 24 20 Z" fill="#f2e9c9" stroke="#d9cb96" strokeWidth="1.4" />
          )}
          {value === 2 && ( // Half Moon
            <>
              <circle cx="30" cy="34" r="14" fill="#1c2333" stroke="#55617d" strokeWidth="1.2" />
              <path d="M 30 20 A 14 14 0 0 1 30 48 Z" fill="#f2e9c9" stroke="#d9cb96" strokeWidth="1.4" />
              <circle cx="34" cy="28" r="2.2" fill="#ddd0a4" />
              <circle cx="36" cy="39" r="1.7" fill="#ddd0a4" />
            </>
          )}
          {value === 3 && ( // Harvest Moon
            <>
              <circle cx="30" cy="34" r="15" fill="#ff8c2e" opacity="0.25" />
              <circle cx="30" cy="34" r="13.5" fill="#f0a04b" stroke="#c97a2b" strokeWidth="1.6" />
              <circle cx="24.5" cy="29" r="3" fill="#d9853a" />
              <circle cx="35" cy="39" r="2.4" fill="#d9853a" />
              <circle cx="34" cy="27.5" r="1.5" fill="#d9853a" />
            </>
          )}
        </svg>
      );

    case 'flower': // POISON PLANTS (wildcards — all match each other)
      switch (value) {
        case 0: // Black Rose
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Thorned stem */}
              <path d="M 30 40 Q 30 53 26 61" fill="none" stroke="#2c4030" strokeWidth="3" strokeLinecap="round" />
              <polygon points="29.5,47 34.5,49.5 29,51.5" fill="#2c4030" />
              <polygon points="28.5,55 23.5,56.5 28.5,58.5" fill="#2c4030" />
              {/* Drooping leaf */}
              <path d="M 30 45 Q 40 43 43 48 C 38 51 32 49 30 45 Z" fill="#3e5a44" stroke="#2c4030" strokeWidth="1" />
              {/* Dark bloom */}
              <circle cx="30" cy="27" r="16" fill="#2c1b2e" stroke="#171019" strokeWidth="1.8" />
              <path d="M 18 23 C 20 13 40 13 42 23 C 42 31 36 36 30 36 C 24 36 18 31 18 23 Z" fill="#43293f" stroke="#171019" strokeWidth="1.2" />
              <circle cx="30" cy="25" r="7" fill="#5b2a55" stroke="#171019" strokeWidth="1" />
              <path d="M 26 25 C 27 21 33 21 34 25 C 33 28 27 28 26 25 Z" fill="#7c3a6e" />
              {/* Purple shimmer */}
              <path d="M 20 19 A 13 13 0 0 1 27 14" stroke="#9b6fb5" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.8" />
              {/* Falling petal */}
              <ellipse cx="43" cy="52" rx="3" ry="2" fill="#43293f" transform="rotate(-30,43,52)" />
            </svg>
          );
        case 1: // Nightshade
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Arched stem */}
              <path d="M 14 62 C 16 40 24 24 44 16" fill="none" stroke="#3e5a44" strokeWidth="3" strokeLinecap="round" />
              {/* Leaves */}
              <path d="M 22 40 Q 30 34 36 38 C 31 44 25 44 22 40 Z" fill="#3e5a44" stroke="#2c4030" strokeWidth="1" />
              <path d="M 36 22 Q 44 18 49 22 C 44 27 38 27 36 22 Z" fill="#3e5a44" stroke="#2c4030" strokeWidth="1" />
              {/* Hanging purple bells */}
              <g>
                <path d="M 26 46 l 0 5" stroke="#3e5a44" strokeWidth="1.4" />
                <path d="M 20 51 C 20 47 32 47 32 51 L 30 58 L 28 56 L 26 59 L 24 56 L 22 58 Z" fill="#7b4fd0" stroke="#4a2b8c" strokeWidth="1.2" />
                <circle cx="26" cy="59.5" r="1.3" fill="#ffd23f" />
              </g>
              <g transform="translate(14,-14)">
                <path d="M 26 46 l 0 5" stroke="#3e5a44" strokeWidth="1.4" />
                <path d="M 20 51 C 20 47 32 47 32 51 L 30 58 L 28 56 L 26 59 L 24 56 L 22 58 Z" fill="#7b4fd0" stroke="#4a2b8c" strokeWidth="1.2" />
                <circle cx="26" cy="59.5" r="1.3" fill="#ffd23f" />
              </g>
              {/* Deadly black berries */}
              <circle cx="45" cy="38" r="3.4" fill="#16121e" stroke="#0b0913" strokeWidth="1" />
              <circle cx="50" cy="32" r="3" fill="#16121e" stroke="#0b0913" strokeWidth="1" />
              <circle cx="44.2" cy="37" r="1" fill="#55617d" />
              <circle cx="49.2" cy="31" r="0.9" fill="#55617d" />
            </svg>
          );
        case 2: // Flytrap
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Stem + base leaves */}
              <path d="M 30 40 C 28 50 30 56 30 62" fill="none" stroke="#3e7a4a" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M 30 56 Q 18 54 13 60 Q 22 64 30 60 Z" fill="#52a05f" stroke="#2c6e3a" strokeWidth="1.2" />
              <path d="M 30 56 Q 42 54 47 60 Q 38 64 30 60 Z" fill="#52a05f" stroke="#2c6e3a" strokeWidth="1.2" />
              {/* Open jaws */}
              <path d="M 29 38 C 12 38 8 20 18 12 C 26 6 33 14 31 24 Z" fill="#52a05f" stroke="#2c6e3a" strokeWidth="1.8" />
              <path d="M 31 38 C 48 38 52 22 44 14 C 36 8 30 16 31.5 25 Z" fill="#3e7a4a" stroke="#2c6e3a" strokeWidth="1.8" />
              {/* Red mouth interiors */}
              <path d="M 28 34 C 17 34 13 22 20 15 C 25 12 29 17 28.5 24 Z" fill="#c1313f" />
              <path d="M 32 34 C 43 34 47 23 41 16 C 36 13 32 18 32.5 25 Z" fill="#a8202e" />
              {/* Teeth */}
              <g fill="#f2ead8">
                <polygon points="18,13 16,7 21,11" />
                <polygon points="24,10 24,4 27,9" />
                <polygon points="14,20 9,17 13,24" />
                <polygon points="42,12 44,6 39,10" />
                <polygon points="36,9 36,3 33,8" />
                <polygon points="46,19 51,16 47,23" />
              </g>
              {/* Eye spots */}
              <circle cx="22" cy="20" r="1.8" fill="#16121e" />
              <circle cx="38" cy="21" r="1.8" fill="#16121e" />
            </svg>
          );
        default: // 3 - Toadstool
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Grass tufts */}
              <path d="M 10 60 Q 30 55 50 60" stroke="#3e5a44" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <path d="M 14 59 L 12 53 M 47 58 L 49 53" stroke="#3e5a44" strokeWidth="1.6" strokeLinecap="round" />
              {/* Stalk */}
              <path d="M 25 38 C 25 50 24 55 22 59 L 38 59 C 36 55 35 50 35 38 Z" fill="#e8dcc0" stroke="#b3a380" strokeWidth="1.6" />
              <path d="M 24 46 Q 30 48.5 36 46" stroke="#b3a380" strokeWidth="1.2" fill="none" />
              {/* Red cap */}
              <path d="M 9 38 C 9 18 51 18 51 38 C 44 41 16 41 9 38 Z" fill="#c1121f" stroke="#7a0b14" strokeWidth="2" />
              {/* White spots */}
              <ellipse cx="20" cy="29" rx="3.4" ry="2.8" fill="#f2ead8" />
              <ellipse cx="33" cy="24" rx="2.8" ry="2.4" fill="#f2ead8" />
              <ellipse cx="42" cy="32" rx="3" ry="2.4" fill="#f2ead8" />
              <ellipse cx="28" cy="35" rx="2.2" ry="1.8" fill="#f2ead8" />
              {/* Cap sheen */}
              <path d="M 14 30 C 16 24 22 21 28 20" stroke="#e23b47" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
            </svg>
          );
      }

    default:
      return null;
  }
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
