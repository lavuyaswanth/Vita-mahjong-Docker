# Vita Mahjong — QA Run Results

**Branch:** `age-14plus` (Midnight / Gothic Legends, `v0.1.0-legends`)
**Date:** 2026-06-14
**Suite:** `qa/TEST_CASES.md` (270 cases)
**How run:** headless `chrome-headless-shell` (mac_arm-148) driving the dev server at `http://localhost:5173` via `qa/harness.mjs` (puppeteer-core), plus direct probes and a visual sweep. Screenshots in `/tmp/qa_shots/`.

> Note: the `mahjong-betatester` subagent was used first but its Bash sandbox blocked Node/Chrome mid-run, so the automated harness was run directly instead. The agent did capture a visual screenshot sweep before it was blocked.

## Headline
**34/34 automated P0–P1 checks PASS.** No console errors in any flow. No P0/P1 functional defects found. A few minor UX/polish notes below.

## Automated results

| ID | Status | Evidence |
|----|--------|----------|
| TC-001 Menu renders | PASS | `.main-menu-container` present |
| TC-002 Clean console on load | PASS | 0 console errors |
| TC-003 / TC-254 Version badge | PASS | `v0.1.0-legends` |
| TC-004 / TC-011 Assets + manifest load | PASS | no failed image/manifest requests |
| TC-018 Realm badge | PASS | "🗺️ Realm: Gothic Legends" |
| TC-249 Edition branding | PASS | subtitle "Match the Creatures of Legend — Ages 14+" |
| TC-009 `?bot=1` auto-starts | PASS | 52 tiles, board live |
| TC-010 Bot reaches victory | PASS | level 1 solved |
| TC-065 Even tile count | PASS | 52 tiles |
| TC-061 Bot solves level 1 | PASS | win |
| TC-113a Bot solves level 30 | PASS | win (132 tiles) |
| TC-062 Bot solves level 90 | PASS | win (132 tiles) |
| TC-113b Bot solves level 150 | PASS | win, 78s |
| TC-063 Bot solves level 240 | PASS | win, **76s, IQ 200, layout "Citadel"** (see note 1) |
| TC-104 Level 240 loads | PASS | board renders |
| TC-163 Daily loads (`?daily=1`) | PASS | board live |
| TC-175 Daily solvable | PASS | bot win |
| TC-166 Daily streak shown | PASS | "🔥 1-day streak!" |
| TC-064 Determinism (level 50 ×2) | PASS | identical 132-tile sets |
| TC-105/106/107/121 Level param clamp (0/241/abc/999999) | PASS | renders, no crash, clean console |
| TC-030 / TC-200 Settings persist | PASS | `vita_high_contrast` survives reload |
| TC-190 Tray slot count | PASS | **4** slots (matches `TRAY_CAPACITY`) |
| TC-014 Settings modal opens | PASS | modal rendered |
| *-console (all bot levels) | PASS | clean console throughout |

## Visually confirmed (screenshot sweep)
- **TC-247** Gothic tile set renders (Dracula, Raven, Spider, Flytrap, crowns, ghosts, moons).
- **TC-028** High-contrast mode applies (tile name tags shown).
- **TC-074 / TC-079 / TC-083 / TC-086** Booster defaults: SHUFFLE 5 · MAGNET 3 · HINT 5 · UNDO 5.
- **TC-095 / TC-099** Press-and-hold peek shows the tile identity ("Half Moon" label).
- **TC-117** Multiple layouts seen (Meadow, Pyramid, Citadel).
- **TC-136 / TC-140** Victory screen shows stars, IQ tier, time, moves, layout, level reward; Genius celebration at IQ 200.
- **TC-179** "Tray Full!" game-over modal exists with Return-a-Tile / Restart / Menu.
- Menu at 320px and desktop landscape captured without layout breakage.

## Notes / minor findings (no blockers)
1. **TC-063 false-negative in the batch run.** Level 240 timed out once during the 5-level sequential batch (system load), but two isolated re-runs solved it cleanly at 76s / 78s with a smooth tile-by-tile clear and no console errors. Not a game defect — the harness per-level timeout was raised and the level is confirmed solvable. (An early probe also misreported a stall because matched tiles intentionally stay in the DOM — `MahjongBoard.tsx:528` / comment at `:214` — so counting `[data-tile-id]` is not a progress signal; count `.mahjong-tile:not(.matched)` instead.)
2. **P3 — High-contrast labels truncate.** On small tiles the high-contrast name tags clip ("Nights…", "Hourgl…") and crowd. Legible but tight; consider shorter tags or a tooltip on small viewports.
3. **P3 — Star vs. IQ tension.** A board can show "Genius · IQ 200 / New Best" with only **1 of 3 stars** (stars track speed + no-helpers; IQ tracks completion + combos). Internally consistent but can read as contradictory to a player.

## Spec corrections applied to `qa/TEST_CASES.md`
Static analysis (and DOM inspection) surfaced cases written against an assumed "classic solitaire" model that doesn't match this build. Corrected:
- **Single unified holder-tray mode** (`GameMode = 'menu' | 'tray'`) — no separate Classic/Rush. Matches happen via the tray, not by tapping two board tiles. (§4 reframed, mechanic note added.)
- **Tray capacity is 4, not 7** (`TRAY_CAPACITY = 4`). (TC-190/193/199 fixed.)
- **Tray clears on a matching pair**, not three-of-a-kind. (TC-192 fixed.)
- **Only loss = "Tray Full!"** (4 non-matching tiles); game-over offers Return-a-Tile (Undo) + Restart, not Shuffle; there is no separate no-moves stalemate. (§11 reframed.)
- **Magnet** pulls up to 3 tiles back from the tray, it doesn't auto-clear a pair. (TC-085 fixed.)

## Not auto-tested (need human/manual judgement)
Audio audibility, haptics, screen-reader announcement quality, contrast-ratio measurement, reduced-motion, real touch gestures, and subjective animation smoothness. These remain in the suite (§14–16) for a manual pass.

## Reproduce
```bash
npm run dev                 # serves http://localhost:5173
PUPPETEER_SKIP_DOWNLOAD=1 npm install puppeteer-core@24 --no-save
node qa/harness.mjs         # writes /tmp/qa_results.md + /tmp/qa_shots/*
```
