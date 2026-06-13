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

// Gorgeous, highly-polished inline SVG modern cute art icons
const CuteIcon: React.FC<{ type: string; value: number }> = ({ type, value }) => {
  switch (type) {
    case 'bamboo': // ANIMALS (Edge-to-Edge Detailed Pictorial Drawings)
      switch (value) {
        case 1: // Panda
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              <defs>
                <radialGradient id="panda-blush-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffb7b2" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#ffb7b2" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Sitting shoulders & paws (skeuomorphic depth) */}
              <ellipse cx="30" cy="53" rx="21" ry="12" fill="#2c3e50" />
              <ellipse cx="30" cy="56" rx="14" ry="8" fill="#ffffff" />
              {/* Green bamboo shoot being held in paw */}
              <path d="M 10 50 L 50 44" stroke="#27ae60" strokeWidth="3" strokeLinecap="round" />
              <path d="M 22 48 Q 24 42 27 45 M 34 46 Q 37 40 40 43" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              {/* Arms/Paws on the stalk */}
              <circle cx="16" cy="47" r="4.5" fill="#1a252f" />
              <circle cx="44" cy="45" r="4.5" fill="#1a252f" />
              {/* Head with detailed vectors */}
              <ellipse cx="30" cy="28" rx="19" ry="16" fill="#ffffff" stroke="#2c3e50" strokeWidth="2.5" />
              {/* Symmetrical Ears */}
              <ellipse cx="12" cy="15" rx="6.5" ry="5.5" fill="#2c3e50" />
              <ellipse cx="12" cy="15" rx="3" ry="2.5" fill="#ffffff" />
              <ellipse cx="48" cy="15" rx="6.5" ry="5.5" fill="#2c3e50" />
              <ellipse cx="48" cy="15" rx="3" ry="2.5" fill="#ffffff" />
              {/* Eye Patches */}
              <ellipse cx="21" cy="28" rx="5" ry="6.5" fill="#2c3e50" transform="rotate(-15, 21, 28)" />
              <ellipse cx="39" cy="28" rx="5" ry="6.5" fill="#2c3e50" transform="rotate(15, 39, 28)" />
              {/* Eyes with distinct visual pupils */}
              <circle cx="21.5" cy="27.5" r="1.8" fill="#ffffff" />
              <circle cx="21.5" cy="27.5" r="0.8" fill="#000000" />
              <circle cx="38.5" cy="27.5" r="1.8" fill="#ffffff" />
              <circle cx="38.5" cy="27.5" r="0.8" fill="#000000" />
              {/* Blush */}
              <circle cx="14" cy="34" r="4.5" fill="url(#panda-blush-glow)" />
              <circle cx="46" cy="34" r="4.5" fill="url(#panda-blush-glow)" />
              {/* Nose & Mouth */}
              <ellipse cx="30" cy="33" rx="2.5" ry="1.8" fill="#1a252f" />
              <path d="M 27 37 Q 30 39.5 33 37" fill="none" stroke="#2c3e50" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          );
        case 2: // Fox
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Elegant fluffy tail with white tip */}
              <path d="M 38 52 C 48 50 54 36 44 32 C 40 38 34 46 38 52 Z" fill="#e67e22" stroke="#d35400" strokeWidth="1.5" />
              <path d="M 44 32 C 47 34 48 38 44 42 C 41 39 42 34 44 32 Z" fill="#ffffff" />
              {/* Sitting body & chest fluff */}
              <path d="M 18 56 Q 30 40 42 56 Z" fill="#e67e22" stroke="#d35400" strokeWidth="2" />
              <path d="M 25 44 Q 30 52 35 44 Z" fill="#ffffff" />
              {/* Front paws */}
              <rect x="23" y="52" width="4" height="10" rx="1.5" fill="#d35400" />
              <rect x="33" y="52" width="4" height="10" rx="1.5" fill="#d35400" />
              {/* Angular fox head */}
              <polygon points="12,28 30,44 48,28 38,20 22,20" fill="#e67e22" stroke="#d35400" strokeWidth="2" />
              <polygon points="12,28 20,30 30,44 20,40" fill="#ffffff" />
              <polygon points="48,28 40,30 30,44 40,40" fill="#ffffff" />
              {/* Tall ears */}
              <polygon points="14,21 9,4 21,15" fill="#d35400" stroke="#c0392b" strokeWidth="1" />
              <polygon points="16,19 12,8 20,15" fill="#ffb7b2" />
              <polygon points="46,21 51,4 39,15" fill="#d35400" stroke="#c0392b" strokeWidth="1" />
              <polygon points="44,19 48,8 40,15" fill="#ffb7b2" />
              {/* Sly glossy eyes */}
              <ellipse cx="21" cy="26" rx="2.5" ry="1.5" fill="#2c3e50" transform="rotate(-12, 21, 26)" />
              <circle cx="21.5" cy="25.5" r="0.6" fill="#ffffff" />
              <ellipse cx="39" cy="26" rx="2.5" ry="1.5" fill="#2c3e50" transform="rotate(12, 39, 26)" />
              <circle cx="38.5" cy="25.5" r="0.6" fill="#ffffff" />
              {/* Nose button */}
              <circle cx="30" cy="42" r="2.2" fill="#2c3e50" />
            </svg>
          );
        case 3: // Bear
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Sturdy body and paws */}
              <ellipse cx="30" cy="52" rx="22" ry="14" fill="#8d6e63" stroke="#5d4037" strokeWidth="2" />
              <ellipse cx="30" cy="55" rx="14" ry="8" fill="#d7ccc8" opacity="0.35" />
              <circle cx="16" cy="48" r="4.5" fill="#5d4037" />
              <circle cx="44" cy="48" r="4.5" fill="#5d4037" />
              {/* Round head */}
              <ellipse cx="30" cy="30" rx="17" ry="15" fill="#a1887f" stroke="#8d6e63" strokeWidth="2" />
              {/* Circular ears */}
              <circle cx="14" cy="18" r="6" fill="#8d6e63" />
              <circle cx="14" cy="18" r="3" fill="#ffb7b2" />
              <circle cx="46" cy="18" r="6" fill="#8d6e63" />
              <circle cx="46" cy="18" r="3" fill="#ffb7b2" />
              {/* Oval snout */}
              <ellipse cx="30" cy="35" rx="6" ry="5" fill="#d7ccc8" />
              {/* Shiny bear eyes */}
              <circle cx="23" cy="27" r="1.8" fill="#3e2723" />
              <circle cx="23.5" cy="26.3" r="0.5" fill="#ffffff" />
              <circle cx="37" cy="27" r="1.8" fill="#3e2723" />
              <circle cx="37.5" cy="26.3" r="0.5" fill="#ffffff" />
              {/* Nose button */}
              <ellipse cx="30" cy="33" rx="2.5" ry="1.5" fill="#3e2723" />
              <path d="M 27 36.5 Q 30 38.5 33 36.5" stroke="#3e2723" strokeWidth="1.2" fill="none" />
            </svg>
          );
        case 4: // Lion
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Fluffy majestic circular mane */}
              <path d="M 12 34 C 4 21 13 5 30 5 C 47 5 56 21 48 34 C 54 46 42 61 30 61 C 18 61 6 46 12 34 Z" fill="#e67e22" stroke="#d35400" strokeWidth="2" />
              {/* Symmetrical mane tuft circles for organic skeuomorphism */}
              {Array.from({ length: 8 }).map((_, idx) => {
                const angle = (idx * Math.PI) / 4;
                return (
                  <circle key={idx} cx={30 + 17 * Math.cos(angle)} cy={33 + 17 * Math.sin(angle)} r="5.5" fill="#d35400" />
                );
              })}
              {/* Lion body and paws */}
              <ellipse cx="30" cy="54" rx="18" ry="9" fill="#f1c40f" stroke="#d35400" strokeWidth="1.5" />
              <circle cx="18" cy="54" r="4.2" fill="#ffd700" stroke="#d35400" strokeWidth="1" />
              <circle cx="42" cy="54" r="4.2" fill="#ffd700" stroke="#d35400" strokeWidth="1" />
              {/* Face plate */}
              <circle cx="30" cy="33" r="14.5" fill="#f1c40f" stroke="#d35400" strokeWidth="1.5" />
              <circle cx="19" cy="21" r="4.5" fill="#e67e22" />
              <circle cx="41" cy="21" r="4.5" fill="#e67e22" />
              {/* Heavy outline eyes */}
              <circle cx="24" cy="30" r="2.2" fill="#2c3e50" />
              <circle cx="24.5" cy="29.2" r="0.6" fill="#ffffff" />
              <circle cx="36" cy="30" r="2.2" fill="#2c3e50" />
              <circle cx="36.5" cy="29.2" r="0.6" fill="#ffffff" />
              {/* White snout & dark nose */}
              <ellipse cx="30" cy="38" rx="4.5" ry="3" fill="#ffffff" />
              <polygon points="28.5,35.5 31.5,35.5 30,37.5" fill="#c0392b" />
            </svg>
          );
        case 5: // Rabbit
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Calming meadow grass & carrot */}
              <path d="M 6 56 Q 30 50 54 56 L 54 66 L 6 66 Z" fill="#2ecc71" />
              <polygon points="45,54 52,48 50,56" fill="#e67e22" />
              <path d="M 50 48 Q 52 44 48 45" fill="none" stroke="#27ae60" strokeWidth="1.2" />
              {/* Fluffy white body & tail */}
              <ellipse cx="26" cy="48" rx="18" ry="13" fill="#ffffff" stroke="#bdc3c7" strokeWidth="2" />
              <circle cx="9" cy="49" r="5" fill="#ffffff" stroke="#bdc3c7" strokeWidth="1" />
              {/* Head and large upright ears */}
              <circle cx="28" cy="31" r="12" fill="#ffffff" stroke="#bdc3c7" strokeWidth="2" />
              <ellipse cx="22" cy="13" rx="4.5" ry="11" fill="#ffffff" stroke="#bdc3c7" strokeWidth="1.5" transform="rotate(-15, 22, 13)" />
              <ellipse cx="22" cy="13" rx="2.5" ry="8.5" fill="#ffb7b2" transform="rotate(-15, 22, 13)" />
              <ellipse cx="34" cy="13" rx="4.5" ry="11" fill="#ffffff" stroke="#bdc3c7" strokeWidth="1.5" transform="rotate(15, 34, 13)" />
              <ellipse cx="34" cy="13" rx="2.5" ry="8.5" fill="#ffb7b2" transform="rotate(15, 34, 13)" />
              {/* Ruby red eyes */}
              <circle cx="24" cy="29" r="2" fill="#e74c3c" />
              <circle cx="24.5" cy="28.5" r="0.5" fill="#ffffff" />
              <circle cx="34" cy="29" r="2" fill="#e74c3c" />
              <circle cx="34.5" cy="28.5" r="0.5" fill="#ffffff" />
              {/* Pink nose */}
              <polygon points="28,34.5 30,34.5 29,36" fill="#ffb7b2" />
            </svg>
          );
        case 6: // Cat
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Playing ball of yarn */}
              <circle cx="48" cy="53" r="6.5" fill="#ff4d6d" stroke="#c9184a" strokeWidth="1" />
              <path d="M 46 53 Q 36 56 28 51" fill="none" stroke="#ff4d6d" strokeWidth="1.8" />
              {/* Ginger body & waving tail */}
              <ellipse cx="26" cy="49" rx="17" ry="13" fill="#e67e22" stroke="#d35400" strokeWidth="2" />
              <path d="M 12 51 Q 5 40 10 32 Q 13 36 12 43" fill="#e67e22" stroke="#d35400" strokeWidth="1.5" strokeLinecap="round" />
              {/* Detailed cat head */}
              <circle cx="30" cy="31" r="13.5" fill="#e67e22" stroke="#d35400" strokeWidth="2" />
              {/* Pointy ears */}
              <polygon points="18,22 13,8 24,18" fill="#d35400" stroke="#c0392b" strokeWidth="1" />
              <polygon points="19,20 16,11 23,17" fill="#ffb7b2" />
              <polygon points="42,22 47,8 36,18" fill="#d35400" stroke="#c0392b" strokeWidth="1" />
              <polygon points="41,20 44,11 37,17" fill="#ffb7b2" />
              {/* Glossy emerald slit eyes */}
              <ellipse cx="24" cy="28" rx="2.5" ry="3.5" fill="#2ecc71" stroke="#27ae60" strokeWidth="0.5" />
              <line x1="24" y1="25" x2="24" y2="31" stroke="#000000" strokeWidth="1" />
              <ellipse cx="36" cy="28" rx="2.5" ry="3.5" fill="#2ecc71" stroke="#27ae60" strokeWidth="0.5" />
              <line x1="36" y1="25" x2="36" y2="31" stroke="#000000" strokeWidth="1" />
              {/* Whiskers & snout */}
              <line x1="16" y1="32" x2="9" y2="31" stroke="#7f8c8d" strokeWidth="1" />
              <line x1="16" y1="34" x2="8" y2="35" stroke="#7f8c8d" strokeWidth="1" />
              <line x1="44" y1="32" x2="51" y2="31" stroke="#7f8c8d" strokeWidth="1" />
              <line x1="44" y1="34" x2="52" y2="35" stroke="#7f8c8d" strokeWidth="1" />
              <ellipse cx="30" cy="33.5" rx="3.5" ry="2.2" fill="#ffffff" />
              <circle cx="30" cy="32.5" r="1.5" fill="#ffb7b2" />
            </svg>
          );
        case 7: // Elephant
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Mighty grey-blue elephant body and legs */}
              <ellipse cx="30" cy="51" rx="22" ry="13.5" fill="#a6b8c7" stroke="#7f8c8d" strokeWidth="2" />
              <rect x="15" y="51" width="6" height="12" fill="#8ca0b0" stroke="#7f8c8d" strokeWidth="1" />
              <rect x="39" y="51" width="6" height="12" fill="#8ca0b0" stroke="#7f8c8d" strokeWidth="1" />
              {/* Front facing detailed head & huge side ears */}
              <ellipse cx="12" cy="32" rx="9" ry="12.5" fill="#8ca0b0" stroke="#7f8c8d" strokeWidth="1.5" />
              <ellipse cx="12" cy="32" rx="5" ry="8" fill="#ffb7b2" />
              <ellipse cx="48" cy="32" rx="9" ry="12.5" fill="#8ca0b0" stroke="#7f8c8d" strokeWidth="1.5" />
              <ellipse cx="48" cy="32" rx="5" ry="8" fill="#ffb7b2" />
              <circle cx="30" cy="33" r="14.5" fill="#a6b8c7" stroke="#7f8c8d" strokeWidth="2" />
              {/* Dynamic curved trunk */}
              <path d="M 30 37 Q 30 53 36 53 Q 41 53 39 47" fill="none" stroke="#a6b8c7" strokeWidth="5" strokeLinecap="round" />
              {/* White ivory tusks */}
              <polygon points="21,37 25,40 25,37" fill="#ffffff" />
              <polygon points="39,37 35,40 35,37" fill="#ffffff" />
              {/* Friendly black eyes */}
              <circle cx="23" cy="29" r="1.8" fill="#2c3e50" />
              <circle cx="23.5" cy="28.3" r="0.5" fill="#ffffff" />
              <circle cx="37" cy="29" r="1.8" fill="#2c3e50" />
              <circle cx="37.5" cy="28.3" r="0.5" fill="#ffffff" />
            </svg>
          );
        case 8: // Monkey
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Supporting tree branch */}
              <line x1="6" y1="58" x2="54" y2="58" stroke="#8d6e63" strokeWidth="3.5" strokeLinecap="round" />
              {/* Yellow banana in paw */}
              <path d="M 44 48 Q 48 42 42 38 Q 42 44 44 48 Z" fill="#ffd700" stroke="#b89742" strokeWidth="0.8" />
              {/* Monkey body and curly tail */}
              <ellipse cx="26" cy="47" rx="16" ry="13" fill="#8d6e63" stroke="#6d4c41" strokeWidth="2" />
              <path d="M 12 47 Q 4 45 6 35 C 8 32 12 36 10 42" fill="none" stroke="#8d6e63" strokeWidth="2.2" />
              {/* Head with heart-face plate */}
              <circle cx="30" cy="29" r="13.5" fill="#8d6e63" stroke="#6d4c41" strokeWidth="2" />
              <path d="M 23 27.5 C 23 22 28 22 30 26.5 C 32 22 37 22 37 27.5 C 37 32.5 34 35.5 30 35.5 C 26 35.5 23 32.5 23 27.5 Z" fill="#ffccbc" />
              {/* Prominent side ears */}
              <circle cx="15" cy="27" r="6" fill="#8d6e63" />
              <circle cx="15" cy="27" r="3" fill="#ffccbc" />
              <circle cx="45" cy="27" r="6" fill="#8d6e63" />
              <circle cx="45" cy="27" r="3" fill="#ffccbc" />
              {/* Playful monkey eyes */}
              <circle cx="26" cy="27" r="1.8" fill="#2c3e50" />
              <circle cx="26.3" cy="26.5" r="0.5" fill="#ffffff" />
              <circle cx="34" cy="27" r="1.8" fill="#2c3e50" />
              <circle cx="34.3" cy="26.5" r="0.5" fill="#ffffff" />
              {/* Smile & nose */}
              <circle cx="30" cy="30.5" r="1" fill="#8d6e63" />
              <path d="M 27 32.5 Q 30 34.5 33 32.5" fill="none" stroke="#8d6e63" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          );
        default: // 9 - Frog
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Massive green lily pad leaf */}
              <path d="M 6 56 C 15 52 45 52 54 56 L 50 63 C 40 65 20 65 10 63 Z" fill="#27ae60" stroke="#1e7b43" strokeWidth="1.5" />
              <polygon points="30,56 46,62 50,56" fill="#fdf6e3" opacity="0.3" /> {/* pad vein */}
              {/* Chubby frog body & legs */}
              <ellipse cx="30" cy="43" rx="19" ry="13.5" fill="#2ecc71" stroke="#27ae60" strokeWidth="2" />
              <path d="M 12 48 Q 16 56 22 52 M 48 48 Q 44 56 38 52" stroke="#27ae60" strokeWidth="3.5" strokeLinecap="round" />
              {/* Giant bulging cartoon eyes */}
              <circle cx="19" cy="25" r="6" fill="#2ecc71" stroke="#27ae60" strokeWidth="1.5" />
              <circle cx="19" cy="25" r="3.2" fill="#ffffff" />
              <circle cx="19" cy="25" r="1.5" fill="#000000" />
              <circle cx="41" cy="25" r="6" fill="#2ecc71" stroke="#27ae60" strokeWidth="1.5" />
              <circle cx="41" cy="25" r="3.2" fill="#ffffff" />
              <circle cx="41" cy="25" r="1.5" fill="#000000" />
              {/* Happy wide frog smile */}
              <path d="M 19 41 Q 30 50 41 41" fill="none" stroke="#1e7b43" strokeWidth="2.5" strokeLinecap="round" />
              {/* Pink blush cheeks */}
              <circle cx="15" cy="42" r="2" fill="#ff8a80" />
              <circle cx="45" cy="42" r="2" fill="#ff8a80" />
            </svg>
          );
      }

    case 'circle': // EVERYDAY OBJECTS (Beautiful, Large Skeuomorphic Renderings)
      switch (value) {
        case 1: // Chinese Lantern
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Black hanging thread */}
              <line x1="30" y1="4" x2="30" y2="12" stroke="#2c3e50" strokeWidth="2" />
              {/* Gold cap top */}
              <rect x="18" y="12" width="24" height="4.5" rx="1.2" fill="#ffd700" stroke="#b89742" strokeWidth="1" />
              {/* Massive red silk lantern body */}
              <ellipse cx="30" cy="34" rx="20" ry="18" fill="#ff4d6d" stroke="#c9184a" strokeWidth="2.2" />
              {/* Gold bottom cap */}
              <rect x="18" y="52" width="24" height="4.5" rx="1.2" fill="#ffd700" stroke="#b89742" strokeWidth="1" />
              {/* Silk ribs folds (gold accent) */}
              <ellipse cx="30" cy="34" rx="10" ry="18" fill="none" stroke="#ffd700" strokeWidth="1.5" />
              <line x1="30" y1="17" x2="30" y2="52" stroke="#ffd700" strokeWidth="2" />
              {/* Detailed dangling gold tassels */}
              <path d="M 30 57 L 30 67 M 26 59 L 26 65 M 34 59 L 34 65" stroke="#ffd700" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          );
        case 2: // Cherry Blossoms
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Thick dark wood branch */}
              <path d="M 6 52 C 16 48 24 32 54 24" fill="none" stroke="#8d6e63" strokeWidth="4.5" strokeLinecap="round" />
              {/* Primary gorgeous blossom */}
              <g transform="translate(24, 42)">
                {Array.from({ length: 5 }).map((_, i) => (
                  <circle key={i} cx="0" cy="-7.5" r="6.2" fill="#ffb7b2" stroke="#ff85a1" strokeWidth="1" transform={`rotate(${i * 72})`} />
                ))}
                <circle cx="0" cy="0" r="3" fill="#ffd700" stroke="#b89742" strokeWidth="0.8" />
              </g>
              {/* Secondary blossom (smaller) */}
              <g transform="translate(42, 26) scale(0.68)">
                {Array.from({ length: 5 }).map((_, i) => (
                  <circle key={i} cx="0" cy="-7.5" r="6.2" fill="#ffb7b2" stroke="#ff85a1" strokeWidth="1" transform={`rotate(${i * 72})`} />
                ))}
                <circle cx="0" cy="0" r="3" fill="#ffd700" stroke="#b89742" strokeWidth="0.8" />
              </g>
              {/* Green leaf buds */}
              <path d="M 12 48 Q 8 40 14 42 Z" fill="#2ecc71" stroke="#27ae60" strokeWidth="0.8" />
              <path d="M 32 30 Q 30 22 36 24 Z" fill="#2ecc71" stroke="#27ae60" strokeWidth="0.8" />
            </svg>
          );
        case 3: // Gift Box
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Premium sky-blue textured box body */}
              <rect x="10" y="26" width="40" height="36" rx="4.5" fill="#3498db" stroke="#2980b9" strokeWidth="2.5" />
              {/* Vertical/horizontal shiny red satin ribbons */}
              <rect x="27.5" y="26" width="5" height="36" fill="#ff4d6d" />
              <rect x="10" y="41.5" width="40" height="5" fill="#ff4d6d" />
              {/* Volumetric double ribbon bow at top */}
              <path d="M 30 26 C 21 15 15 22 28 26 C 39 22 39 15 30 26 Z" fill="#ff4d6d" stroke="#c9184a" strokeWidth="1.5" />
              <path d="M 28 26 L 15 38 M 32 26 L 45 38" stroke="#ff4d6d" strokeWidth="3.2" strokeLinecap="round" />
            </svg>
          );
        case 4: // Retro Camera
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Vibrant teal retro body */}
              <rect x="8" y="21" width="44" height="38" rx="4.5" fill="#16a085" stroke="#117a65" strokeWidth="2.2" />
              {/* Silver metallic top plate & shutter */}
              <path d="M 8 21 L 8 27 L 52 27 L 52 21 Z" fill="#bdc3c7" stroke="#7f8c8d" strokeWidth="1" />
              <rect x="14" y="17" width="8" height="4" fill="#7f8c8d" rx="0.5" />
              <rect x="36" y="16" width="10" height="5" fill="#ffd700" stroke="#b89742" strokeWidth="0.8" rx="0.5" /> {/* Flash */}
              {/* Heavy lens assembly with glint */}
              <circle cx="30" cy="40" r="14.5" fill="#2c3e50" stroke="#bdc3c7" strokeWidth="2.2" />
              <circle cx="30" cy="40" r="9.5" fill="#1a252f" />
              <path d="M 23 36 A 9.5 9.5 0 0 1 37 36" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          );
        case 5: // Watch
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Deep brown leather strap running vertically */}
              <rect x="22" y="6" width="16" height="58" rx="3.5" fill="#8d6e63" stroke="#5d4037" strokeWidth="1.5" />
              {/* Polished gold circular watch bezel */}
              <circle cx="30" cy="35" r="19" fill="#ffd700" stroke="#b89742" strokeWidth="2.5" />
              <circle cx="30" cy="35" r="14.5" fill="#2c3e50" />
              {/* Indicator dots & classic hands */}
              <circle cx="30" cy="24.5" r="1" fill="#ffd700" />
              <circle cx="30" cy="45.5" r="1" fill="#ffd700" />
              <circle cx="19.5" cy="35" r="1" fill="#ffd700" />
              <circle cx="40.5" cy="35" r="1" fill="#ffd700" />
              <line x1="30" y1="35" x2="30" y2="28" stroke="#ffd700" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="30" y1="35" x2="36" y2="35" stroke="#ffd700" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="30" y1="35" x2="27" y2="39" stroke="#e74c3c" strokeWidth="1" strokeLinecap="round" /> {/* second needle */}
            </svg>
          );
        case 6: // Coffee Mug
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Cozy steam trails */}
              <path d="M 23 15 C 21 9 26 7 24 3 M 31 15 C 29 9 34 7 32 3 M 38 15 C 36 9 41 7 39 3" fill="none" stroke="#bdc3c7" strokeWidth="2.2" strokeLinecap="round" />
              {/* Large purple ceramic body and handle */}
              <path d="M 38 25 C 49 25 49 45 38 45" fill="none" stroke="#9b59b6" strokeWidth="5.5" strokeLinecap="round" />
              <rect x="16" y="19" width="26" height="36" rx="6" fill="#9b59b6" stroke="#8e44ad" strokeWidth="2.2" />
              {/* Specular gloss shine indicator */}
              <path d="M 20 23 L 20 51" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          );
        case 7: // Umbrella
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Wide blue umbrella canopy */}
              <path d="M 6 39 C 6 20 54 20 54 39 C 45 34 37 34 30 39 C 23 34 15 34 6 39 Z" fill="#3498db" stroke="#2980b9" strokeWidth="2.2" />
              {/* Golden canopy apex tip */}
              <polygon points="30,22 27,15 33,15" fill="#ffd700" stroke="#b89742" strokeWidth="0.8" />
              {/* Silver central shaft and curved J handle */}
              <path d="M 30 39 L 30 56 A 4.5 4.5 0 0 1 21 56" fill="none" stroke="#7f8c8d" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          );
        case 8: // Open Book
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Thick organic wooden/orange hardback cover */}
              <path d="M 6 49 L 6 26 C 20 22 30 26 30 26 C 30 26 40 22 54 26 L 54 49 C 40 45 30 49 30 49 C 30 49 20 45 6 49 Z" fill="#e67e22" stroke="#d35400" strokeWidth="2.2" />
              {/* High-definition paper pages spread */}
              <path d="M 8 46 L 8 25 C 20 21 30 24 30 24 L 30 45 C 30 45 20 42 8 46 Z" fill="#ffffff" />
              <path d="M 52 46 L 52 25 C 40 21 30 24 30 24 L 30 45 C 30 45 40 42 52 46 Z" fill="#ffffff" />
              {/* Red ribbon bookmark */}
              <path d="M 30 24 L 30 53 L 33 49 L 30 45" fill="#ff4d6d" />
              {/* Simulated text lines */}
              <line x1="12" y1="30" x2="24" y2="30" stroke="#7f8c8d" strokeWidth="1" />
              <line x1="12" y1="34" x2="26" y2="34" stroke="#7f8c8d" strokeWidth="1" />
              <line x1="12" y1="38" x2="22" y2="38" stroke="#7f8c8d" strokeWidth="1" />
              <line x1="36" y1="30" x2="48" y2="30" stroke="#7f8c8d" strokeWidth="1" />
              <line x1="34" y1="34" x2="48" y2="34" stroke="#7f8c8d" strokeWidth="1" />
              <line x1="38" y1="38" x2="48" y2="38" stroke="#7f8c8d" strokeWidth="1" />
            </svg>
          );
        default: // 9 - Key
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Ornate skeleton key head (gold brass texture) */}
              <path d="M 30 24 C 20 24 19 9 30 9 C 41 9 40 24 30 24 Z" fill="none" stroke="#ffd700" strokeWidth="3" />
              {/* Inner cross accent cut */}
              <line x1="30" y1="12" x2="30" y2="21" stroke="#ffd700" strokeWidth="1.5" />
              <line x1="25" y1="16.5" x2="35" y2="16.5" stroke="#ffd700" strokeWidth="1.5" />
              {/* Solid brass long shaft */}
              <rect x="28.5" y="24" width="3" height="34" rx="1.5" fill="#ffd700" />
              {/* Masterful double teeth */}
              <rect x="31" y="45" width="9" height="4.5" fill="#ffd700" rx="0.5" />
              <rect x="31" y="51.5" width="6" height="4.5" fill="#ffd700" rx="0.5" />
            </svg>
          );
      }

    case 'character': // VEHICLES (Massive, Symmetrical, Beautiful Vector Pictogram Photos)
      switch (value) {
        case 1: // Red Car
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Road line base */}
              <line x1="6" y1="56" x2="54" y2="56" stroke="#bdc3c7" strokeWidth="2" strokeLinecap="round" />
              {/* Shiny cabin dome */}
              <path d="M 16 32 C 16 17 44 17 44 32 Z" fill="#2c3e50" stroke="#e74c3c" strokeWidth="2.5" />
              <path d="M 28 20 A 10 10 0 0 1 40 32 L 28 32 Z" fill="#e0f7fa" opacity="0.6" /> {/* window glare */}
              {/* Volumetric red beetle chassis */}
              <path d="M 10 32 L 50 32 C 55 32 55 46 50 46 L 10 46 C 5 46 5 32 10 32 Z" fill="#e74c3c" stroke="#c0392b" strokeWidth="2" />
              {/* Wheels with silver center caps */}
              <circle cx="18" cy="46" r="8" fill="#34495e" stroke="#bdc3c7" strokeWidth="1.8" />
              <circle cx="18" cy="46" r="2.5" fill="#ffffff" />
              <circle cx="42" cy="46" r="8" fill="#34495e" stroke="#bdc3c7" strokeWidth="1.8" />
              <circle cx="42" cy="46" r="2.5" fill="#ffffff" />
              {/* Headlight yellow flare */}
              <circle cx="51" cy="35" r="2.5" fill="#ffd700" />
            </svg>
          );
        case 2: // Helicopter
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Main rotors spinning spinner */}
              <line x1="10" y1="12" x2="50" y2="12" stroke="#7f8c8d" strokeWidth="3" strokeLinecap="round" />
              <rect x="28.5" y="12" width="3" height="8" fill="#7f8c8d" />
              {/* Volumetric yellow body */}
              <ellipse cx="26" cy="32" rx="16" ry="12.5" fill="#f1c40f" stroke="#d4af37" strokeWidth="2.2" />
              {/* Cockpit canopy glass reflection */}
              <path d="M 28 20 A 12.5 12.5 0 0 1 42 32 L 28 32 Z" fill="#e0f7fa" opacity="0.85" stroke="#3498db" strokeWidth="1" />
              {/* Tail boom and vertical stabilizer blades */}
              <rect x="6" y="29.5" width="12" height="4" fill="#f1c40f" />
              <polygon points="6,22 9,29 6,36" fill="#ffd700" />
              <circle cx="6" cy="29" r="2.5" fill="#7f8c8d" />
              {/* Dynamic skids brackets */}
              <line x1="16" y1="44" x2="16" y2="49" stroke="#7f8c8d" strokeWidth="2" />
              <line x1="36" y1="44" x2="36" y2="49" stroke="#7f8c8d" strokeWidth="2" />
              <line x1="8" y1="49" x2="44" y2="49" stroke="#7f8c8d" strokeWidth="3.2" strokeLinecap="round" />
            </svg>
          );
        case 3: // Train
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Train track base */}
              <line x1="6" y1="56" x2="54" y2="56" stroke="#7f8c8d" strokeWidth="2" />
              {/* Steam locomotive engine smokestack with puff */}
              <rect x="18" y="16" width="5" height="12" fill="#7f8c8d" />
              <circle cx="20.5" cy="11.5" r="5" fill="#f5f5f5" />
              {/* Cabin with window block */}
              <rect x="34" y="20" width="16" height="26" fill="#2980b9" stroke="#1f618d" strokeWidth="2" rx="1" />
              <rect x="37" y="23" width="10" height="9" fill="#e0f7fa" rx="0.5" stroke="#1f618d" strokeWidth="0.8" />
              {/* Boiler main tank */}
              <rect x="14" y="28" width="20" height="18" fill="#3498db" stroke="#2980b9" strokeWidth="2" rx="1.5" />
              {/* Red physical grill front cowcatcher */}
              <polygon points="8,46 14,37 14,46" fill="#e74c3c" />
              {/* Three heavy wheels */}
              <circle cx="17.5" cy="46.5" r="5" fill="#34495e" />
              <circle cx="28" cy="46.5" r="5" fill="#34495e" />
              <circle cx="38.5" cy="46.5" r="5" fill="#34495e" />
            </svg>
          );
        case 4: // Space Rocket
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Hyper energetic combustion engine fire */}
              <polygon points="20,49 30,68 40,49" fill="#ff4d6d" />
              <polygon points="25,49 30,61 35,49" fill="#ffd700" />
              {/* Retro rocket vector body */}
              <path d="M 30 8 C 38 20 38 42 38 50 L 22 50 C 22 42 22 20 30 8 Z" fill="#ecf0f1" stroke="#bdc3c7" strokeWidth="2" />
              {/* Saturated nose cone red paint */}
              <path d="M 30 8 C 34 14 37 20 37 20 L 23 20 C 23 14 26 14 30 8 Z" fill="#e74c3c" />
              {/* Symmetrical sweeping red stabilizer fins */}
              <path d="M 22 38 Q 12 49 22 49" fill="#e74c3c" />
              <path d="M 38 38 Q 48 49 38 49" fill="#e74c3c" />
              {/* Glass circular viewport */}
              <circle cx="30" cy="32" r="5.5" fill="#3498db" stroke="#bdc3c7" strokeWidth="1.8" />
              <path d="M 26.5 32 A 3.5 3.5 0 0 1 33.5 32" fill="none" stroke="#ffffff" strokeWidth="1" />
            </svg>
          );
        case 5: // Bicycle
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Dual spokes spoked tires */}
              <circle cx="16" cy="44" r="12" fill="none" stroke="#34495e" strokeWidth="3" />
              <circle cx="16" cy="44" r="2" fill="#7f8c8d" />
              <circle cx="44" cy="44" r="12" fill="none" stroke="#34495e" strokeWidth="3" />
              <circle cx="44" cy="44" r="2" fill="#7f8c8d" />
              {/* Double triangle robust green framework */}
              <polygon points="16,44 28,30 40,44 26,44" fill="none" stroke="#2ecc71" strokeWidth="2.5" strokeLinejoin="round" />
              <line x1="26" y1="44" x2="28" y2="30" stroke="#2ecc71" strokeWidth="2.5" />
              {/* Seat & Steering handlebars */}
              <line x1="28" y1="30" x2="26" y2="22" stroke="#7f8c8d" strokeWidth="2.2" />
              <rect x="22" y="21.5" width="7" height="1.8" rx="0.5" fill="#34495e" />
              <line x1="40" y1="44" x2="38" y2="24" stroke="#7f8c8d" strokeWidth="2.2" />
              <line x1="34" y1="24" x2="41" y2="24" stroke="#34495e" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          );
        case 6: // Airplane
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Fluffy landscape clouds */}
              <path d="M 6 49 C 14 41 24 46 30 49 C 38 46 46 49 54 49" fill="none" stroke="#ecf0f1" strokeWidth="4.5" />
              {/* Angular swept back wings */}
              <polygon points="22,34 9,48 18,48 28,34" fill="#a6b8c7" />
              <polygon points="34,26 44,12 48,16 36,26" fill="#ecf0f1" />
              {/* Aerodynamic commercial jet fuselage */}
              <ellipse cx="30" cy="30" rx="25" ry="5.8" fill="#ecf0f1" stroke="#bdc3c7" strokeWidth="1.8" transform="rotate(-15, 30, 30)" />
              {/* Red tail stabilizer fin */}
              <polygon points="12,35 5,20 12,24" fill="#e74c3c" />
              {/* Blue windows indicators */}
              <circle cx="24" cy="32" r="0.8" fill="#3498db" />
              <circle cx="28" cy="31" r="0.8" fill="#3498db" />
              <circle cx="32" cy="30" r="0.8" fill="#3498db" />
              <circle cx="36" cy="29" r="0.8" fill="#3498db" />
            </svg>
          );
        case 7: // Sailboat
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Raging blue water waves */}
              <path d="M 6 51 Q 18 47 30 51 Q 42 47 54 51 L 54 62 L 6 62 Z" fill="#3498db" />
              {/* Skeuomorphic dark wood hull */}
              <path d="M 12 43 L 48 43 Q 44 53 30 53 Q 16 53 12 43 Z" fill="#8d6e63" stroke="#5d4037" strokeWidth="1.8" />
              {/* Central high-visibility mast */}
              <line x1="30" y1="12" x2="30" y2="43" stroke="#7f8c8d" strokeWidth="3" strokeLinecap="round" />
              {/* Left white sail */}
              <path d="M 28 14 Q 14 28 28 39 Z" fill="#f5f5f5" stroke="#bdc3c7" strokeWidth="1" />
              {/* Right pink warm sail */}
              <path d="M 32 16 Q 44 27 32 37 Z" fill="#ffb7b2" />
              {/* Red wind pennant flag */}
              <polygon points="30,12 30,16 38,14" fill="#e74c3c" />
            </svg>
          );
        case 8: // Submarine
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Deep sea water bubble sparks */}
              <circle cx="12" cy="22" r="1.5" fill="#e0f7fa" />
              <circle cx="48" cy="26" r="2.2" fill="#e0f7fa" />
              {/* High periscope tracker */}
              <path d="M 32 23 L 32 15 L 37 15" fill="none" stroke="#7f8c8d" strokeWidth="2.2" strokeLinecap="round" />
              {/* Solid brass submarine body */}
              <ellipse cx="30" cy="37" rx="22" ry="13.5" fill="#f1c40f" stroke="#d4af37" strokeWidth="2.2" />
              <rect x="25" y="24" width="10" height="6" fill="#ffd700" stroke="#d4af37" strokeWidth="1" />
              {/* Sweeping rear propeller */}
              <polygon points="7,32 7,42 10,37" fill="#7f8c8d" />
              {/* 3 blue ports windows */}
              <circle cx="22" cy="37" r="2.5" fill="#3498db" stroke="#bdc3c7" strokeWidth="1" />
              <circle cx="30" cy="37" r="2.5" fill="#3498db" stroke="#bdc3c7" strokeWidth="1" />
              <circle cx="38" cy="37" r="2.5" fill="#3498db" stroke="#bdc3c7" strokeWidth="1" />
            </svg>
          );
        default: // 9 - Tractor
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Farming ground line */}
              <line x1="6" y1="56" x2="54" y2="56" stroke="#8d6e63" strokeWidth="2" />
              {/* Detailed green cab and exhaust stack */}
              <line x1="21" y1="26" x2="21" y2="17" stroke="#7f8c8d" strokeWidth="2" />
              <rect x="30" y="19" width="14" height="15" fill="none" stroke="#27ae60" strokeWidth="2" />
              <rect x="30" y="19" width="14" height="4" fill="#27ae60" />
              {/* Front block & cabin rest */}
              <rect x="16" y="28" width="16" height="13" fill="#2ecc71" stroke="#27ae60" strokeWidth="1" rx="0.5" />
              <rect x="31" y="28" width="13" height="13" fill="#2ecc71" stroke="#27ae60" strokeWidth="1" rx="0.5" />
              {/* Giant massive rear wheel */}
              <circle cx="38" cy="43" r="10.5" fill="#34495e" stroke="#bdc3c7" strokeWidth="1" />
              <circle cx="38" cy="43" r="3.5" fill="#ffffff" />
              {/* Small fast front wheel */}
              <circle cx="21" cy="47.5" r="6" fill="#34495e" stroke="#bdc3c7" strokeWidth="1" />
              <circle cx="21" cy="47.5" r="2.2" fill="#ffffff" />
            </svg>
          );
      }

    case 'wind': // WEATHER & NATURE (High contrast, Large Soothing Zen Graphics)
      switch (value) {
        case 0: // Sun
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Giant gold radiating sun sphere */}
              <circle cx="30" cy="35" r="15.5" fill="#ffcb00" stroke="#f39c12" strokeWidth="2.2" />
              {/* Concentric inner face */}
              <circle cx="30" cy="35" r="11" fill="#ffd700" />
              {/* 12 sharp dynamic radiating sunbeams */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * Math.PI) / 6;
                return (
                  <line
                    key={i}
                    x1={30 + 19 * Math.cos(angle)}
                    y1={35 + 19 * Math.sin(angle)}
                    x2={30 + 26 * Math.cos(angle)}
                    y2={35 + 26 * Math.sin(angle)}
                    stroke="#f39c12"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
          );
        case 1: // Moon
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Deep starry space backing card */}
              <rect x="6" y="8" width="48" height="54" rx="5.5" fill="#12131a" />
              {/* Glowing golden crescent moon */}
              <path d="M 18 18 A 18.5 18.5 0 1 0 43 49 A 15.5 15.5 0 1 1 18 18 Z" fill="#ffd700" stroke="#f1c40f" strokeWidth="1" />
              {/* Soothing sleeping closed eyes */}
              <path d="M 23 35 Q 25 38 27 35" fill="none" stroke="#2c1709" strokeWidth="1.5" strokeLinecap="round" />
              {/* Intricate glowing star sparkles */}
              <polygon points="38,24 40,27 43,27 41,29 42,32 39,30 37,32 38,29 36,27 39,27" fill="#ffffff" />
              <polygon points="44,40 45.5,42 47.5,42 46,43.5 46.5,45.5 44.5,44 42.5,45.5 43,43.5 41.5,42 43.5,42" fill="#ffd700" />
            </svg>
          );
        case 2: // Rain Cloud
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Dark active storm cloud */}
              <path d="M 16 38 C 12 34 12 24 22 22 C 26 14 42 14 44 22 C 50 24 50 34 44 38 Z" fill="#7f8c8d" stroke="#5d6d7e" strokeWidth="2.2" />
              {/* Heavy gold lightning bolt split */}
              <polygon points="30,35 24,46 31,46 27,56 38,44 31,44" fill="#ffd700" stroke="#b89742" strokeWidth="0.8" />
              {/* Dropping blue raindrops */}
              <line x1="16" y1="43" x2="14" y2="49" stroke="#3498db" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="44" y1="43" x2="42" y2="49" stroke="#3498db" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          );
        default: // 3 - Rainbow
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Multi-layered concentric arching rainbow bands */}
              <path d="M 10 46 A 21 21 0 0 1 50 46" fill="none" stroke="#ff4d6d" strokeWidth="4.5" />
              <path d="M 14.5 46 A 16.5 16.5 0 0 1 45.5 46" fill="none" stroke="#ffa33f" strokeWidth="4.5" />
              <path d="M 19 46 A 12 12 0 0 1 41 46" fill="none" stroke="#ffd700" strokeWidth="4.5" />
              <path d="M 23.5 46 A 7.5 7.5 0 0 1 36.5 46" fill="none" stroke="#2ecc71" strokeWidth="4.5" />
              {/* Supporting fluffy white base clouds */}
              <path d="M 4 48 C 6 42 16 42 18 48 C 20 52 14 56 8 56 C 2 56 2 52 4 48 Z" fill="#ffffff" stroke="#bdc3c7" strokeWidth="1" />
              <path d="M 42 48 C 44 42 54 42 56 48 C 58 52 52 56 46 56 C 40 56 40 52 42 48 Z" fill="#ffffff" stroke="#bdc3c7" strokeWidth="1" />
            </svg>
          );
      }

    case 'dragon': // MYTHICAL (Intricate, Premium Chinese Imperial Crests)
      switch (value) {
        case 0: // Dragon Head
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Golden horns split */}
              <path d="M 20 22 Q 12 8 8 12 Q 18 20 21 24" fill="#ffd700" stroke="#b89742" strokeWidth="1" />
              <path d="M 40 22 Q 48 8 52 12 Q 42 20 39 24" fill="#ffd700" stroke="#b89742" strokeWidth="1" />
              {/* Majestic imperial emerald head body */}
              <rect x="18" y="24" width="24" height="24" rx="6" fill="#2ecc71" stroke="#27ae60" strokeWidth="2.5" />
              {/* Prominent whiskers & snout */}
              <ellipse cx="30" cy="43" rx="10" ry="7.5" fill="#27ae60" stroke="#1e7b43" strokeWidth="1" />
              <circle cx="26" cy="42" r="2" fill="#ffd700" />
              <circle cx="34" cy="42" r="2" fill="#ffd700" />
              <path d="M 12 40 Q 18 42 21 44 M 48 40 Q 42 42 39 44" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" /> {/* whiskers */}
              {/* Ruby red dragon eyes */}
              <circle cx="24" cy="32" r="4.2" fill="#ffffff" stroke="#27ae60" strokeWidth="1" />
              <circle cx="24.5" cy="32" r="2" fill="#ff4d6d" />
              <circle cx="36" cy="32" r="4.2" fill="#ffffff" stroke="#27ae60" strokeWidth="1" />
              <circle cx="35.5" cy="32" r="2" fill="#ff4d6d" />
            </svg>
          );
        case 1: // Firebird / Phoenix
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Large sweeping majestic flaming wings */}
              <path d="M 8 36 C 4 18 24 16 30 26 C 36 16 56 18 52 36 C 56 49 38 60 30 46 C 22 60 4 49 8 36 Z" fill="#ff4d6d" stroke="#c9184a" strokeWidth="1.5" />
              <path d="M 14 36 C 12 24 26 22 30 30 C 34 22 48 24 46 36 Z" fill="#ffa33f" />
              {/* Long head crown feathers */}
              <path d="M 30 32 L 30 14 Q 30 8 34 11" fill="none" stroke="#d63031" strokeWidth="5" strokeLinecap="round" />
              <circle cx="34.5" cy="9" r="2.5" fill="#ffd700" />
              <circle cx="30" cy="7" r="1.5" fill="#ffd700" />
              {/* Triple golden tail feathers streams */}
              <path d="M 30 46 Q 20 63 16 63 C 24 57 30 52 30 46 Z" fill="#ffd700" />
              <path d="M 30 46 Q 40 63 44 63 C 36 57 30 52 30 46 Z" fill="#ffd700" />
            </svg>
          );
        default: // 2 - Crown
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Heavy gold base velvet cushion */}
              <ellipse cx="30" cy="46" rx="18" ry="8" fill="#9b59b6" stroke="#ffd700" strokeWidth="1.5" />
              <rect x="14" y="44" width="32" height="6.5" rx="2" fill="#ffd700" stroke="#b89742" strokeWidth="1.5" />
              {/* Embedded velvet gems points */}
              <circle cx="18.5" cy="47" r="1.5" fill="#ff4d6d" />
              <circle cx="30" cy="47" r="1.5" fill="#3498db" />
              <circle cx="41.5" cy="47" r="1.5" fill="#ff4d6d" />
              {/* Symmetrical sharp crown peaks points */}
              <polygon points="14,44 10,22 22,34 30,16 38,34 50,22 46,44" fill="#ffd700" stroke="#b89742" strokeWidth="1.5" />
              {/* Sparkling jewel tips */}
              <circle cx="10" cy="21" r="2.5" fill="#ff4d6d" />
              <circle cx="30" cy="15" r="3.2" fill="#3498db" stroke="#ffffff" strokeWidth="0.8" />
              <circle cx="50" cy="21" r="2.5" fill="#ff4d6d" />
            </svg>
          );
      }

    case 'season': // SEASONS (Rich, Scaled, Pure Visual Contrast Graphics)
      switch (value) {
        case 0: // Spring (Tulip)
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Green leaves base */}
              <path d="M 30 42 Q 30 59 30 62" fill="none" stroke="#2ecc71" strokeWidth="3" strokeLinecap="round" />
              <path d="M 30 52 Q 18 49 14 41 Q 23 48 30 52" fill="#2ecc71" stroke="#27ae60" strokeWidth="0.8" />
              <path d="M 30 46 Q 42 43 46 35 Q 37 42 30 46" fill="#2ecc71" stroke="#27ae60" strokeWidth="0.8" />
              {/* Vibrant blooming pink tulip bud head */}
              <path d="M 18 36 C 14 18 27 15 30 26 C 33 15 46 18 42 36 Z" fill="#ff4d6d" stroke="#c9184a" strokeWidth="2" />
              <path d="M 23 36 C 23 23 37 23 37 36 Z" fill="#ff7675" opacity="0.85" />
            </svg>
          );
        case 1: // Summer (Watermelon Slice)
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Giant triangular watermelon wedge */}
              <path d="M 6 22 L 54 22 C 54 22 54 56 30 56 C 6 56 6 22 6 22 Z" fill="#27ae60" stroke="#1e7b43" strokeWidth="2.2" />
              <path d="M 10 24 L 50 24 C 50 24 50 51 30 51 C 10 51 10 24 10 24 Z" fill="#ffffff" />
              <path d="M 13 24 L 47 24 C 47 24 47 47 30 47 C 13 47 13 24 13 24 Z" fill="#ff4d6d" />
              {/* Healthy black seeds */}
              <circle cx="21" cy="29" r="1.5" fill="#2c3e50" />
              <circle cx="30" cy="33" r="1.5" fill="#2c3e50" />
              <circle cx="39" cy="29" r="1.5" fill="#2c3e50" />
              <circle cx="26" cy="38" r="1.5" fill="#2c3e50" />
              <circle cx="34" cy="38" r="1.5" fill="#2c3e50" />
            </svg>
          );
        case 2: // Autumn (Maple Leaf)
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Detailed warm orange-red maple leaf */}
              <line x1="30" y1="44" x2="30" y2="60" stroke="#d35400" strokeWidth="4.5" strokeLinecap="round" />
              <polygon
                points="30,11 34,22 46,16 41,27 52,31 41,36 37,47 30,42 23,47 19,36 8,31 19,27 14,16 26,22"
                fill="#e67e22"
                stroke="#c0392b"
                strokeWidth="1.8"
              />
              {/* Detailed internal veins */}
              <line x1="30" y1="41" x2="30" y2="20" stroke="#c0392b" strokeWidth="2" />
              <line x1="30" y1="34" x2="41" y2="24" stroke="#c0392b" strokeWidth="1.5" />
              <line x1="30" y1="34" x2="19" y2="24" stroke="#c0392b" strokeWidth="1.5" />
              <line x1="30" y1="28" x2="38" y2="20" stroke="#c0392b" strokeWidth="1.2" />
              <line x1="30" y1="28" x2="22" y2="20" stroke="#c0392b" strokeWidth="1.2" />
            </svg>
          );
        default: // 3 - Winter (Snowflake)
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Glowing blue double layered snowflake */}
              <g stroke="#3498db" strokeWidth="3" fill="none" strokeLinecap="round" transform="translate(30, 35)">
                {/* 6 primary branches */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <g key={i} transform={`rotate(${i * 60})`}>
                    <line x1="0" y1="0" x2="0" y2="-24" />
                    <line x1="0" y1="-14" x2="-6" y2="-20" />
                    <line x1="0" y1="-14" x2="6" y2="-20" />
                    <line x1="0" y1="-8" x2="-4" y2="-12" />
                    <line x1="0" y1="-8" x2="4" y2="-12" />
                  </g>
                ))}
                {/* Inner central crystallite ring */}
                <circle cx="0" cy="0" r="4.5" fill="none" stroke="#2ec4b6" strokeWidth="2" />
              </g>
            </svg>
          );
      }

    case 'flower': // FLOWERS (Edge-to-Edge High Detail Botanicals)
      switch (value) {
        case 0: // Rose
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Saturated green stem and thorns */}
              <path d="M 30 40 Q 30 55 24 60" fill="none" stroke="#27ae60" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M 30 46 Q 40 43 42 47 C 37 49 33 48 30 46" fill="#27ae60" />
              <polygon points="30,48 35,51 30,53" fill="#27ae60" /> {/* thorn */}
              {/* Intricate layered rose petal folds */}
              <circle cx="30" cy="30" r="17" fill="#ff4d6d" stroke="#c9184a" strokeWidth="1.8" />
              <path d="M 19 26 C 19 16, 41 16, 41 26 C 41 36, 19 36, 19 26 Z" fill="#d63031" stroke="#c9184a" strokeWidth="1" />
              <circle cx="30" cy="28" r="7.5" fill="#ffd700" stroke="#b89742" strokeWidth="0.8" />
              <circle cx="30" cy="28" r="3" fill="#ffffff" />
            </svg>
          );
        case 1: // Sunflower
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Dazzling radial sunflower petals layout */}
              <g transform="translate(30, 35)">
                {Array.from({ length: 16 }).map((_, i) => (
                  <ellipse key={i} cx="0" cy="-21" rx="4.5" ry="11" fill="#ffcb00" stroke="#f39c12" strokeWidth="0.8" transform={`rotate(${i * 22.5})`} />
                ))}
              </g>
              {/* Seed face disk with dotted texture grid */}
              <circle cx="30" cy="35" r="12" fill="#5d4037" stroke="#ffd700" strokeWidth="1.5" />
              <circle cx="30" cy="35" r="9" fill="#3e2723" stroke="#8d6e63" strokeWidth="1.2" strokeDasharray="2,2" />
            </svg>
          );
        case 2: // Hibiscus
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* 5 gorgeous overlapping orchid-pink petals */}
              <g transform="translate(30, 35)">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ellipse key={i} cx="0" cy="-14" rx="10" ry="15" fill="#ff7675" stroke="#d63031" strokeWidth="1" transform={`rotate(${i * 72})`} />
                ))}
              </g>
              {/* Extended stamen & pollen tip */}
              <line x1="30" y1="35" x2="41" y2="19" stroke="#ffd700" strokeWidth="3.2" strokeLinecap="round" />
              <circle cx="41" cy="19" r="2.2" fill="#d63031" />
              <circle cx="38" cy="23" r="1.2" fill="#ffd700" />
              <circle cx="35" cy="27" r="1.2" fill="#ffd700" />
            </svg>
          );
        default: // 3 - Daisy
          return (
            <svg viewBox="0 0 60 70" className="tile-svg">
              {/* Dual layers of white daisy petals */}
              <g transform="translate(30, 35)">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ellipse key={i} cx="0" cy="-21" rx="4.5" ry="11.5" fill="#ffffff" stroke="#bdc3c7" strokeWidth="0.8" transform={`rotate(${i * 30})`} />
                ))}
              </g>
              {/* Saturated central yellow disk */}
              <circle cx="30" cy="35" r="9" fill="#ffcb00" stroke="#f39c12" strokeWidth="1.5" />
              <circle cx="30" cy="35" r="5" fill="#ffd700" />
            </svg>
          );
      }

    default:
      return null;
  }
};

// Lightweight glyph renderer (used by the matching tray)
export const TileGlyph: React.FC<{ type: string; value: number }> = ({ type, value }) => (
  <CuteIcon type={type} value={value} />
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
        <div className="tile-3d-side-right"></div>
        <div className="tile-3d-side-bottom"></div>
        <div className="tile-face">
          <CuteIcon type={type} value={value} />
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

  // High contrast helper overlay: the tile's name (last word keeps it short,
  // e.g. "Cherry Blossom" → "Blossom") so the label actually aids reading.
  const renderContrastLabel = () => {
    if (!highContrast) return null;
    const shortName = tileDisplayName(type, value).split(' ').pop();
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
      <div className="tile-3d-side-right"></div>
      <div className="tile-3d-side-bottom"></div>

      {/* Main Face of the Tile */}
      <div className="tile-face">
        <CuteIcon type={type} value={value} />
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
