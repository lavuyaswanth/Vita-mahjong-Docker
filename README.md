# 🀄 Vita Mahjong

A soothing, senior-friendly Mahjong Solitaire game built with React and TypeScript, containerized with Docker for easy local deployment.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Game Modes](#game-modes)
- [Board Layouts](#board-layouts)
- [Tile Style Sets](#tile-style-sets)
- [Background Themes](#background-themes)
- [Audio System](#audio-system)
- [Accessibility](#accessibility)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Docker Deployment](#docker-deployment)
- [How to Play](#how-to-play)
- [Configuration & Settings](#configuration--settings)
- [Architecture Overview](#architecture-overview)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Vita Mahjong** is a browser-based Mahjong Solitaire game designed with relaxation and cognitive wellness in mind. It features multiple game modes, five hand-crafted board layouts, four visual tile styles, ambient audio synthesis, and full Docker containerization for portable deployment.

The game is entirely self-contained — all tile graphics are rendered as inline SVG, and all sound effects are synthesized in real-time using the Web Audio API. There are **zero external asset dependencies**, meaning the game works fully offline once loaded.

---

## Features

### 🎮 Core Gameplay
- **Classic Mahjong Solitaire** tile-matching mechanics with proper blockage rules
- **3D stacked tile rendering** with layered depth, side shadows, and elevation offsets
- **Real-time move validation** — only "free" (unblocked) tiles can be selected
- **Automatic move detection** — the game tracks available matching pairs in real-time
- **Undo system** — revert your last match and try a different strategy
- **Hint system** — highlights a valid matching pair when you're stuck
- **Shuffle** — rearrange remaining tiles while guaranteeing at least one valid move
- **Stalemate detection** — warns you when no moves remain, with shuffle/undo options
- **Stopwatch timer** — tracks your solve time per session

### ✨ Visual Effects
- **Particle burst system** — canvas-based sparkle effects on tile matches
- **Theme-aware particle colors** — sparks match the active background theme
- **Glassmorphism UI** — frosted-glass panels for headers, toolbars, and modals
- **Smooth animations** — fade-in/scale-up transitions for modals and victory screens
- **Floating zen decorations** — ambient petal/leaf animations in the board background

### 🧩 Zoom & Pan Controls
- **Pinch-to-zoom** style zoom in/out buttons for accessibility
- **Click-and-drag panning** — grab the board and drag to reposition
- **Auto-fit** — the board automatically scales to fit your screen on load and resize
- **Reset view** — snap back to the centered, fitted view at any time

---

## Game Modes

| Mode | Icon | Description |
|------|------|-------------|
| **Relaxing Solitaire** | 🐢 | Traditional tile matching with unlimited hints, shuffles, and undo. No stress, pure relaxation. |
| **Memory Mahjong** | 🧠 | Cognitive training mode — tiles start face-down. Flip to reveal and match pairs from memory. No hints or undo available. |
| **Daily Zen Quest** | 📅 | A seeded puzzle unique to each calendar day. Earn visual completion stamps and build a daily relaxation habit. Progress is tracked in a 7-day calendar widget. |

---

## Board Layouts

Five meticulously hand-crafted layouts with varying tile counts and difficulty:

| Layout | Tiles | Description |
|--------|-------|-------------|
| 🐢 **Golden Turtle** | 144 | The classic, legendary Mahjong layout. A full deck spread across 5 layers with wing extensions. |
| 🏰 **Zen Fortress** | 80 | An architectural castle with thick walls, four corner watchtowers, and a central elevated keep. |
| 🔺 **Twin Pyramids** | 64 | Two step-pyramids standing side by side, connected at the baseline by a zen path. |
| 🦋 **Flying Papillon** | 96 | A butterfly silhouette with wide spread wings and a dense central body spine across 3 layers. |
| 🐱 **Lucky Kitten** | 72 | A cute cat head with raised ears, eye elevations, and a multi-layered snout. Senior-friendly sizing. |

Layouts can be changed mid-game via the Settings modal — the board will rebuild with the new shape.

---

## Tile Style Sets

Switch between four distinct visual styles via Settings:

| Style | Icon | Description |
|-------|------|-------------|
| **Classic Chinese** | 🀄 | Traditional Mahjong tiles with Chinese characters (萬), SVG bamboo stems, circles, winds (東南西北), dragons (中發白), seasons, and flowers. |
| **Large Western Print** | 🅰️ | Bold, oversized letters and numbers (B1–B9, C1–C9, K1–K9, E/S/W/N) for maximum readability. Designed for seniors or vision-impaired players. |
| **Relaxing Nature** | 🌲 | Emoji-based nature-themed tiles — flora, fauna, cosmic objects, weather, and seasonal symbols for a calming aesthetic. |
| **Modern Neon Pop** | 💎 | Futuristic neon-glow SVGs with gradient fills, glowing outlines, and dark tile backgrounds. Uses cyberpunk-inspired color palettes. |

---

## Background Themes

Four ambient background themes that change the entire visual atmosphere:

| Theme | Palette |
|-------|---------|
| 🎋 **Zen Garden** | Warm bamboo greens, soft earth tones |
| 🌊 **Deep Ocean** | Cool blues, teals, deep navy |
| 🪵 **Sunset Amber** | Rich oranges, warm golds, ember reds |
| 🌌 **Healing Dark** | Deep purples, midnight blacks, soft glows |

Each theme also adjusts the **particle burst colors** on tile matches for visual cohesion.

---

## Audio System

Vita Mahjong features a fully synthesized audio engine built on the **Web Audio API** — no audio files are loaded.

### Sound Effects
| Sound | Trigger | Character |
|-------|---------|-----------|
| **Wood-block click** | Tapping a blocked tile or UI interaction | Short triangle-wave tick |
| **Selection pop** | Selecting a free tile | Rising sine-wave chirp |
| **Match chime** | Clearing a matching pair | Pentatonic arpeggio (C5–E5–G5) with organic decay |
| **Shuffle slide** | Shuffling remaining tiles | Rapid randomized triangle-wave clicks (14 steps) |
| **Victory fanfare** | Clearing the board | Ascending pentatonic melody (C4 → C6) with vibrato |

### Ambient Synthesizer
An optional continuous ambient soundscape consisting of:
- **Ocean waves** — low-pass filtered white noise with 8-second swell cycles
- **Wind chimes** — random high pentatonic glass tones (E6–E7) every 6–18 seconds

Both SFX volume and ambient volume are independently adjustable via sliders in Settings.

---

## Accessibility

Vita Mahjong is designed with senior accessibility as a core priority:

- **👁️ High-Contrast Mode** — adds large text badges on top of every tile showing a short code (e.g., B3, K7, 中, 梅) for effortless identification regardless of the active style set
- **Large Print tile style** — a dedicated style set with oversized Western labels
- **Keyboard navigation** — tiles have `tabIndex` and `aria-label` attributes for screen readers
- **Zoom/pan controls** — dedicated buttons for users who cannot use pinch gestures
- **Auto-fit scaling** — the board adapts to any viewport size including tablets and small monitors
- **No time pressure** — the timer is informational only with no penalties

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | Component-based UI framework |
| **TypeScript 6** | Static type safety across the entire codebase |
| **Vite 8** | Lightning-fast dev server and production bundler |
| **Web Audio API** | Real-time sound synthesis (zero audio file dependencies) |
| **Canvas API** | Particle burst effects on tile matches |
| **Inline SVG** | All tile graphics rendered as React SVG components (zero image files) |
| **CSS3** | Glassmorphism, animations, grid layout, custom properties |
| **Nginx** | Production static file server (Docker) |
| **Docker** | Multi-stage containerized build and deployment |

---

## Project Structure

```
vita-mahjong-game/
├── public/
│   ├── favicon.svg            # App favicon (SVG)
│   └── icons.svg              # Shared icon sprite
├── src/
│   ├── mahjong/
│   │   ├── gameEngine.ts      # Core solitaire logic: board builder, matching rules,
│   │   │                      #   blockage detection, shuffle, hints, seeded RNG
│   │   ├── layouts.ts         # Five hand-crafted board layouts with coordinate generators
│   │   └── soundSynth.ts      # Web Audio API synthesizer: SFX + ambient ocean/chimes
│   ├── components/
│   │   ├── MahjongBoard.tsx   # Board renderer with zoom/pan, particle canvas, zen decorations
│   │   ├── MainMenu.tsx       # Landing screen with mode cards, daily stamp tracker, how-to-play
│   │   ├── SettingsModal.tsx   # Layout selector, visual style, theme, audio controls
│   │   └── Tile.tsx           # Individual tile with 4 style renderers (Classic, LargePrint,
│   │                          #   Nature, ModernPop), 3D depth, high-contrast overlay
│   ├── App.tsx                # Root component: game state machine, mode logic, undo/hint/shuffle
│   ├── App.css                # Minimal app-level overrides
│   ├── index.css              # Full design system: themes, glassmorphism, animations, grid layout
│   └── main.tsx               # React DOM entry point
├── Dockerfile                 # Multi-stage build: Node 20 → Nginx Alpine
├── docker-compose.yml         # Single-command container orchestration
├── nginx.conf                 # Production Nginx config with SPA fallback and asset caching
├── index.html                 # Vite HTML entry point
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript project references
├── tsconfig.app.json          # App TypeScript config
├── tsconfig.node.json         # Node/Vite TypeScript config
├── eslint.config.js           # ESLint configuration
├── vite.config.ts             # Vite build configuration
└── .gitignore                 # Git ignore rules
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20 (for local development)
- **npm** ≥ 9
- **Docker** & **Docker Compose** (for containerized deployment)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/lavuyaswanth/Vita-mahjong-Docker.git
   cd Vita-mahjong-Docker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The game will be available at `http://localhost:5173` with hot module replacement enabled.

4. **Build for production (optional):**
   ```bash
   npm run build
   ```
   Static output is generated in the `dist/` directory.

5. **Preview the production build (optional):**
   ```bash
   npm run preview
   ```

### Docker Deployment

1. **Build and start the container:**
   ```bash
   docker compose up --build -d
   ```

2. **Access the game:**
   Open `http://localhost:8080` in your browser.

3. **Stop the container:**
   ```bash
   docker compose down
   ```

#### Docker Details

The Dockerfile uses a **multi-stage build**:
- **Stage 1 (Builder):** Uses `node:20-alpine` to install dependencies and compile the TypeScript/React app via `npm run build`.
- **Stage 2 (Server):** Uses `nginx:stable-alpine` to serve the static `dist/` output on port `8080`.

The Nginx configuration includes:
- SPA-friendly `try_files` fallback to `index.html`
- Aggressive asset caching (1 month for CSS, JS, images, media)
- Standard error pages

---

## How to Play

### Basic Rules

1. **Match identical tiles** — Click two tiles with the same face to clear them from the board.
2. **Only free tiles can be selected** — A tile is "free" when:
   - No tile is stacked directly on top of it (higher Z-layer overlap)
   - It has at least one open side (no neighbor tile on its immediate left **or** right at the same layer)
3. **Clear all tiles to win!**

### Special Matching Rules

- **Season tiles** (春 Spring, 夏 Summer, 秋 Autumn, 冬 Winter) — all four match with each other regardless of specific season
- **Flower tiles** (梅 Plum, 蘭 Orchid, 竹 Bamboo, 菊 Chrysanthemum) — all four match with each other regardless of specific flower

### Toolbar Actions

| Button | Function |
|--------|----------|
| ↩️ **Undo** | Restore the last matched pair back to the board |
| 💡 **Hint** | Highlight a valid matching pair for 3 seconds |
| 🔀 **Shuffle** | Rearrange remaining tiles (guarantees at least one valid move) |
| 🔄 **Restart** | Start a fresh puzzle with the same mode and layout |

---

## Configuration & Settings

All preferences are persisted to `localStorage` and restored on reload:

| Setting | Key | Default |
|---------|-----|---------|
| Background Theme | `vita_theme` | `zen` |
| Tile Style Set | `vita_style_set` | `classic` |
| High Contrast Mode | `vita_high_contrast` | `false` |
| SFX Volume | `vita_sfx_vol` | `0.5` |
| Ambient Volume | `vita_ambient_vol` | `0.3` |
| Ambient Enabled | `vita_ambient_enabled` | `false` |
| Daily Challenge Stamps | `vita_mahjong_dailies` | `[]` |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                       App.tsx                           │
│  ┌──────────────┐  ┌────────────┐  ┌─────────────────┐ │
│  │  MainMenu    │  │ GameBoard  │  │ SettingsModal   │ │
│  │  • Mode cards│  │ • Header   │  │ • Layout select │ │
│  │  • Daily     │  │ • Board    │  │ • Style set     │ │
│  │    stamps    │  │ • Toolbar  │  │ • Theme         │ │
│  │  • How-to-  │  │ • Modals   │  │ • Audio         │ │
│  │    play     │  │            │  │ • Accessibility │ │
│  └──────────────┘  └─────┬──────┘  └─────────────────┘ │
│                          │                               │
│              ┌───────────┴───────────┐                  │
│              │    MahjongBoard.tsx   │                  │
│              │  • Zoom/pan controls  │                  │
│              │  • Canvas particles   │                  │
│              │  • Tile grid renderer │                  │
│              └───────────┬───────────┘                  │
│                          │                               │
│              ┌───────────┴───────────┐                  │
│              │      Tile.tsx         │                  │
│              │  • 4 style renderers  │                  │
│              │  • 3D depth effects   │                  │
│              │  • High contrast tag  │                  │
│              │  • ARIA labels        │                  │
│              └───────────────────────┘                  │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │               mahjong/ (Game Logic)                 │ │
│  │  ┌──────────────┐ ┌──────────┐ ┌────────────────┐  │ │
│  │  │ gameEngine.ts│ │layouts.ts│ │ soundSynth.ts  │  │ │
│  │  │• buildBoard  │ │• 5 layout│ │• Web Audio API │  │ │
│  │  │• tilesMatch  │ │  configs │ │• SFX synthesis │  │ │
│  │  │• checkFree   │ │• overlaps│ │• Ambient ocean │  │ │
│  │  │• findMoves   │ │• coords  │ │• Wind chimes   │  │ │
│  │  │• shuffle     │ │          │ │• Volume ctrl   │  │ │
│  │  │• SeededRNG   │ │          │ │                │  │ │
│  │  └──────────────┘ └──────────┘ └────────────────┘  │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Zero external assets** — All graphics are inline SVG React components; all audio is synthesized via Web Audio API. The entire game works offline.
- **Seedable RNG** — The `SeededRandom` class uses a sine-based LCG to produce deterministic shuffles, enabling reproducible Daily Challenge puzzles from date-derived seeds.
- **Balanced deck subsets** — When a layout uses fewer than 144 tiles, the engine groups tiles by matching identity and draws balanced pairs to guarantee solvability.
- **Multi-attempt shuffle** — The shuffle algorithm retries up to 30 times to find an arrangement with at least one valid move.
- **Coordinate-based grid** — Tiles use a 2-unit grid system where each tile occupies 2×2 cells. Z-axis layers create the 3D stacking effect via CSS transform offsets.

---

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run linting: `npm run lint`
5. Build successfully: `npm run build`
6. Commit and push your branch
7. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with 🍵 for relaxation and cognitive wellness
</p>
