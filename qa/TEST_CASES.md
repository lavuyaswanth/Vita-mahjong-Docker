# Vita Mahjong — QA Test Suite

> Branch: `age-14plus` (Midnight / Gothic Legends edition, `APP_VERSION = v0.1.0-legends`)
> Target: the running game (dev: `npm run dev`, or the built `dist/`).
> Harness deep-links: `?bot=1` (auto-play), `?level=N` (1–240), `?daily=1` (Daily Challenge).
> Engine guarantees every campaign board is **solvable**; the bot has deep booster stock (999) and never pollutes real saves.

## How to read a case
- **ID** — stable identifier, cite in findings.
- **Pri** — P0 (blocker) / P1 (major) / P2 (minor) / P3 (polish).
- **Steps** — what the tester does (real-user actions in a headless browser).
- **Expected** — the pass condition. Anything else is a finding.

A case **passes** only if the expected result is fully met with no console errors. Capture a screenshot for every visual/UX case and on every failure.

---

## 1. App load & smoke (TC-001 … TC-012)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-001 | P0 | Load app root `/`. | Main menu renders; no blank/white screen. |
| TC-002 | P0 | Load app root and read console. | Zero console errors or uncaught exceptions on load. |
| TC-003 | P1 | Inspect version badge. | Badge shows `v0.1.0-legends`. |
| TC-004 | P1 | Confirm menu background image loads. | Realm menu background renders (no broken-image icon). |
| TC-005 | P1 | Check logo / title renders. | Game title/logo visible and not clipped. |
| TC-006 | P1 | Load with a cold (cleared) localStorage. | App initialises defaults without throwing. |
| TC-007 | P1 | Reload the page twice in a row. | State restores cleanly each time; no duplicate audio/timers. |
| TC-008 | P2 | Load on a slow throttled network. | Loading does not leave permanently broken assets. |
| TC-009 | P0 | Load `?bot=1`. | Game auto-starts into a board (tray mode), not stuck on menu. |
| TC-010 | P0 | Load `?bot=1` and let it run. | Bot makes valid matches and progresses toward a win without errors. |
| TC-011 | P2 | Verify favicon / PWA manifest present. | `manifest.webmanifest` + icons load (no 404 in console). |
| TC-012 | P2 | Verify service worker registers (if used). | `sw.js` registers without console error, or is cleanly absent. |

## 2. Main menu & navigation (TC-013 … TC-027)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-013 | P0 | Click the central Play / Classic medallion. | A board starts in tray gameplay mode. |
| TC-014 | P1 | Open Settings from the top quick bar. | Settings modal opens. |
| TC-015 | P1 | Open Achievements from the top bar. | Achievements view opens and lists achievements. |
| TC-016 | P1 | Open "How to Play". | How-to-play overlay opens with readable rules. |
| TC-017 | P1 | Close How-to-Play via its close control. | Overlay dismisses; menu interactive again. |
| TC-018 | P1 | Read the realm badge on the menu. | Shows the current realm name (e.g. "Gothic Legends"). |
| TC-019 | P1 | Start Daily Challenge from the menu. | Daily board starts; daily mode active. |
| TC-020 | P1 | From a game, return to the menu. | Menu re-renders; in-progress board state handled sanely. |
| TC-021 | P2 | Rapidly open/close Settings 5×. | No stuck overlay, no leaked listeners, no console errors. |
| TC-022 | P2 | Tab/keyboard-focus the menu buttons. | Focus is visible and ordered. |
| TC-023 | P2 | Each menu button has an aria-label. | Settings/Achievements/Help expose accessible names. |
| TC-024 | P2 | Click Play medallion twice quickly. | Only one board starts (no double-init). |
| TC-025 | P3 | Hover states on menu buttons. | Visual hover feedback present on pointer devices. |
| TC-026 | P2 | Menu after completing a level (return path). | "Continue" / next-level affordance reflects progress. |
| TC-027 | P3 | Menu layout at 320px width. | Buttons reachable, nothing overflows off-screen. |

## 3. Settings modal (TC-028 … TC-047)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-028 | P1 | Toggle High Contrast on. | UI switches to high-contrast palette immediately. |
| TC-029 | P1 | Toggle High Contrast off. | Reverts to normal palette. |
| TC-030 | P1 | Reload after enabling High Contrast. | Setting persists (localStorage `vita_high_contrast`). |
| TC-031 | P1 | Drag Effects (SFX) volume slider to 0. | Click/chime SFX become silent. |
| TC-032 | P1 | Drag Effects volume to max. | SFX audible (where audio permitted). |
| TC-033 | P1 | Toggle Ambient music on. | Ambient track starts during gameplay. |
| TC-034 | P1 | Toggle Ambient music off. | Ambient stops; no residual audio. |
| TC-035 | P1 | Adjust Ambient volume slider. | Ambient loudness changes accordingly. |
| TC-036 | P1 | Reload after changing volumes. | SFX/ambient volumes persist. |
| TC-037 | P1 | Use the level-select dropdown to jump to level 50. | Board for level 50 loads. |
| TC-038 | P1 | Level-select dropdown lists levels within 1–240. | No out-of-range or duplicate entries. |
| TC-039 | P2 | Select a locked/future level via dropdown. | Either allowed by design or gated consistently (no crash). |
| TC-040 | P1 | Close Settings with the X button. | Modal closes; gameplay/menu resumes. |
| TC-041 | P2 | Close Settings by clicking the backdrop (if supported). | Modal closes or stays — behaviour is consistent. |
| TC-042 | P2 | Open Settings mid-game, change nothing, close. | Game state and timer resume unaffected. |
| TC-043 | P2 | Volume slider keyboard operability. | Arrow keys adjust the slider value. |
| TC-044 | P2 | Each toggle has an associated label. | Checkboxes/labels are correctly paired (clickable label). |
| TC-045 | P2 | Settings modal traps focus. | Tab cycles within the modal while open. |
| TC-046 | P3 | Settings modal at 320px width. | Controls fit; no horizontal scroll. |
| TC-047 | P2 | Sliders at exact 0 and exact max. | No NaN/Infinity in audio config; no console error. |

## 4. Core matching engine & rules (TC-048 … TC-072)

> **Mechanic note:** this build has a single unified **holder-tray** mode (`GameMode = 'menu' | 'tray'`). There is no separate "classic" tap-two-tiles-on-the-board flow. Tapping a free tile sends it to the tray; it clears when a **matching pair** meets in the tray (`App.tsx:635`). Only free (unblocked) tiles can be taken. Board distance is irrelevant — matches happen in the tray.

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-048 | P0 | Start any board and tap a free tile. | It lifts into the holder tray. |
| TC-049 | P0 | Tap a free tile whose match already sits in the tray. | The pair auto-clears from the tray (match succeeds). |
| TC-050 | P0 | Tap free tiles that match nothing in the tray. | They collect in the tray (no clear) until a match arrives or the tray fills. |
| TC-051 | P0 | Attempt to select a blocked (covered) tile. | Tile cannot be taken; wobble/reject feedback shown. |
| TC-052 | P0 | Attempt to select a tile blocked on both sides. | Tile is not selectable (blockage rule enforced). |
| TC-053 | P1 | Tap the same selected tile again. | Deselects (toggles off), no match consumed. |
| TC-054 | P1 | Match a Season/Flower group (any-of-suit). | Group-match rule clears them per Mahjong rules. |
| TC-055 | P1 | Match a Dragon/Wind pair correctly. | Matches per type/value rules. |
| TC-056 | P0 | Clear the entire board. | Win state triggers (victory screen). |
| TC-057 | P1 | Free-state recalculates after each removal. | Newly-exposed tiles become selectable. |
| TC-058 | P1 | Tile on top of two others. | Top tile is free; tiles beneath become free after it clears. |
| TC-059 | P1 | Left-edge / right-edge tiles. | Edge tiles correctly free when one side is open. |
| TC-060 | P1 | A 3D-stacked tile at the apex. | Apex tile free regardless of horizontal neighbours. |
| TC-061 | P0 | Run `?bot=1&level=1` to completion. | Level 1 solves fully; victory fires. |
| TC-062 | P0 | Run `?bot=1&level=120` to completion. | Mid-campaign board solves fully. |
| TC-063 | P0 | Run `?bot=1&level=240` to completion. | Final level solves fully. |
| TC-064 | P1 | Same seed/level loaded twice. | Identical tile layout both times (deterministic). |
| TC-065 | P1 | Tile count is even at start. | Board has an even number of tiles (matchable). |
| TC-066 | P1 | Every tile type appears an even number of times. | No unmatchable singleton type. |
| TC-067 | P1 | Park tile A in the tray, then tap a far, non-adjacent matching tile B. | They clear regardless of board distance (collection rule). |
| TC-068 | P1 | Match feedback (particles) fires on success. | Particle burst appears at match location. |
| TC-069 | P2 | Match SFX plays on success. | Chime plays (when SFX enabled). |
| TC-070 | P1 | Remaining-pairs/available-moves indicator. | Reflects actual matchable pairs after each move. |
| TC-071 | P2 | Rapidly tap two matching tiles. | Exactly one match registers (no double-clear). |
| TC-072 | P1 | Select free tile, then tap empty space. | Selection clears cleanly; no error. |

## 5. Boosters — hint / shuffle / magnet / undo (TC-073 … TC-094)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-073 | P1 | Use Hint with a valid pair available. | A valid matching pair is highlighted. |
| TC-074 | P1 | Hint decrements its counter (non-bot). | Hint count drops by 1 (starts at 5). |
| TC-075 | P1 | Hint highlight times out. | Highlight auto-clears after its timeout. |
| TC-076 | P1 | Use Hint when no moves exist. | Graceful message / no false highlight. |
| TC-077 | P1 | Exhaust all hints, then press Hint. | Disabled state / no negative count. |
| TC-078 | P1 | Use Undo after a match. | Last match is reverted (tiles return). |
| TC-079 | P1 | Undo decrements its counter. | Undo count drops by 1 (starts at 5). |
| TC-080 | P1 | Undo at game start (no moves yet). | No-op; no error, no negative count. |
| TC-081 | P1 | Undo multiple times in a row. | Reverts moves in correct LIFO order. |
| TC-082 | P1 | Use Shuffle. | Remaining tiles rearrange; ≥1 valid move guaranteed. |
| TC-083 | P1 | Shuffle decrements its counter. | Shuffle count drops by 1 (starts at 5). |
| TC-084 | P1 | Shuffle keeps the same tile multiset. | Same tiles, new positions (no tiles added/removed). |
| TC-085 | P1 | Use Magnet booster with tiles in the tray. | Pulls up to 3 of the last-collected tiles back from the tray onto the board (`App.tsx:585`). |
| TC-086 | P1 | Magnet decrements its counter. | Magnet count drops by 1 (starts at 3). |
| TC-087 | P1 | Exhaust Magnet, then press it. | Disabled; no negative count. |
| TC-088 | P2 | Booster counts persist across levels (non-bot). | Counts saved to localStorage and restored. |
| TC-089 | P2 | Bot mode booster stock. | `?bot=1` shows 999 / effectively unlimited. |
| TC-090 | P2 | Using a hint affects star rating. | Star computation counts hintsUsed (see §6). |
| TC-091 | P2 | Using a shuffle affects star rating. | Star computation counts shufflesUsed (see §6). |
| TC-092 | P2 | Booster buttons have labels/tooltips. | Shuffle/Magnet/Hint/Undo are labelled. |
| TC-093 | P2 | Rapidly spam Hint. | No flicker bug, no leaked timeouts, count correct. |
| TC-094 | P2 | Undo immediately after a Shuffle. | Defined behaviour; no corruption of board. |

## 6. Peek (press-and-hold) (TC-095 … TC-102)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-095 | P1 | Press and hold a tile. | Peek reveals what's underneath / the tile identity. |
| TC-096 | P1 | Release the hold. | Peek state ends; board returns to normal. |
| TC-097 | P1 | Peek a covered tile. | Reveals the covered tile beneath without taking it. |
| TC-098 | P1 | Peek does not consume the tile. | No match/removal happens from a peek. |
| TC-099 | P2 | Peek on a free top tile. | Shows its identity; no side effects. |
| TC-100 | P2 | Quick tap (below hold threshold). | Registers as a select, not a peek. |
| TC-101 | P2 | Peek then drag finger off the tile. | Peek cancels cleanly, no stuck overlay. |
| TC-102 | P2 | Peek with touch vs. mouse. | Works on both input types. |

## 7. Level progression & 240 levels (TC-103 … TC-122)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-103 | P0 | `?level=1`. | Loads level 1. |
| TC-104 | P0 | `?level=240`. | Loads level 240. |
| TC-105 | P1 | `?level=0`. | Rejected/clamped (valid range 1–240). |
| TC-106 | P1 | `?level=241`. | Rejected/clamped to valid range. |
| TC-107 | P1 | `?level=abc`. | Falls back to default; no crash. |
| TC-108 | P1 | Complete a level → next-level prompt. | Next level offered when `currentLevel < 240`. |
| TC-109 | P1 | Completing level N unlocks N+1. | `maxUnlockedLevel` advances (≤ 240). |
| TC-110 | P1 | Complete level 240. | No "next level" prompt; campaign-complete handling. |
| TC-111 | P1 | Early levels (1–10) tile sizing. | Tiles render larger / board fits per difficulty ramp. |
| TC-112 | P1 | Difficulty ramps with level. | Later levels are visibly harder (more tiles/types). |
| TC-113 | P1 | Sample `?bot=1&level=30/60/90/150/200`. | Each solves to victory. |
| TC-114 | P2 | Unlock progress persists across reload. | maxUnlockedLevel restored from storage. |
| TC-115 | P2 | Level label/number shown during play. | Current level displayed in HUD. |
| TC-116 | P2 | Board pan/clamp on a large layout. | Panning clamps to board bounds (no infinite scroll). |
| TC-117 | P1 | Layout variety across levels. | Multiple of the 5 layouts (Meadow/Tower/Pyramid/Butterfly/…) appear. |
| TC-118 | P2 | Replay a previously completed level. | Loads correctly; record compared (see §8). |
| TC-119 | P2 | maxTypes/variety differs early vs late. | Early levels use fewer tile types. |
| TC-120 | P2 | Deep-link `?level=N` jumps without menu detour. | Goes straight into the board. |
| TC-121 | P2 | Negative/huge `?level=999999`. | Clamped; no NaN board. |
| TC-122 | P3 | Level transition animation. | Smooth transition, no flash of empty board. |

## 8. Scoring, stars, combos & records (TC-123 … TC-142)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-123 | P1 | Win with 0 hints, 0 shuffles, fast time. | 3-star rating awarded. |
| TC-124 | P1 | Win with ≤1 hint, ≤1 shuffle, medium time. | 2-star rating awarded. |
| TC-125 | P1 | Win slowly / with many helpers. | 1-star rating awarded. |
| TC-126 | P1 | Star thresholds scale with tile count. | Larger boards get proportionally more time. |
| TC-127 | P1 | First completion saves a best record. | Per-level best (time/stars) stored. |
| TC-128 | P1 | Beat a previous best. | Record updates to the better result. |
| TC-129 | P1 | Finish worse than best. | Best record is NOT downgraded. |
| TC-130 | P1 | Best record persists across reload. | Stored in localStorage and shown on replay. |
| TC-131 | P1 | Chain matches quickly → combo. | Combo counter/popup appears. |
| TC-132 | P1 | Combo popup placement. | Does not overlap the victory modal (known prior bug). |
| TC-133 | P1 | Combo resets after a pause. | Combo breaks when matches stop chaining. |
| TC-134 | P2 | Combo affects score/feedback. | Higher combo → bigger reward/feedback. |
| TC-135 | P2 | Star-gated rewards. | Rewards unlock only at the required star count. |
| TC-136 | P1 | Victory screen shows stars + time. | Correct stars and elapsed time displayed. |
| TC-137 | P2 | Victory screen has NO Replay button. | Replay was intentionally removed (regression check). |
| TC-138 | P2 | Stopwatch counts up during play. | Timer increments; pauses appropriately. |
| TC-139 | P2 | Timer stops at victory. | Final time frozen on the victory screen. |
| TC-140 | P2 | Genius-tier celebration on top result. | Special celebration fires for top performance. |
| TC-141 | P2 | Records keyed per level (not global). | Level 5 record independent of level 6. |
| TC-142 | P3 | Score numbers formatted readably. | No raw floats / overflow in score display. |

## 9. Realms / themes (TC-143 … TC-162)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-143 | P1 | Gothic Legends realm. | Menu bg + dark particle theme load. |
| TC-144 | P1 | Frozen North realm. | Frost bg + ocean particles. |
| TC-145 | P1 | Desert of the Pharaohs realm. | Desert bg + sunset particles. |
| TC-146 | P1 | Cursed Seas realm. | Seas bg + ocean particles. |
| TC-147 | P1 | Infernal Depths realm. | Inferno bg + sunset particles. |
| TC-148 | P1 | Enchanted Forest realm. | Forest bg + zen particles. |
| TC-149 | P1 | Celestial Realm. | Celestial bg + dark particles. |
| TC-150 | P1 | Each realm's tile spritesheet loads. | Tiles render with the realm's art (no broken image). |
| TC-151 | P1 | Particle color matches active realm theme. | Sparks tinted per `particleTheme`. |
| TC-152 | P1 | Realm assigned by campaign progression. | Realm changes as the campaign advances. |
| TC-153 | P2 | Switching realm updates menu bg immediately. | No stale background from prior realm. |
| TC-154 | P2 | Realm name matches realm art. | Label and visuals are consistent. |
| TC-155 | P2 | All 7 menu backgrounds present. | No 404 for any `menu_bg_*` asset. |
| TC-156 | P2 | All 7 spritesheets present. | No 404 for any `spritesheet_*` asset. |
| TC-157 | P2 | Realm transition is smooth. | No flash of unstyled/old theme. |
| TC-158 | P1 | Tiles legible against each realm bg. | Sufficient contrast in every realm. |
| TC-159 | P2 | High-contrast mode within each realm. | Tiles remain readable in all realms. |
| TC-160 | P2 | Realm persists across reload. | Current realm restored from progress. |
| TC-161 | P3 | Particle perf in busy realm. | No frame collapse during heavy bursts. |
| TC-162 | P2 | Daily Challenge realm assignment. | `dailyRealmId` set and rendered (see §10). |

## 10. Daily Challenge & streak (TC-163 … TC-177)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-163 | P1 | Start Daily via `?daily=1`. | Today's daily board loads (deterministic seed). |
| TC-164 | P1 | Daily seed is date-based. | Same calendar day → same board for everyone. |
| TC-165 | P1 | Daily uses full tile variety. | maxTypes = 0 (full variety, a fair test). |
| TC-166 | P1 | Complete today's daily. | Marks `lastCompleted = today`; streak increments. |
| TC-167 | P1 | Re-open daily after completing today. | Shows "already done today" state. |
| TC-168 | P1 | Streak counter displays. | Current streak value visible. |
| TC-169 | P1 | Consecutive-day completion increments streak. | Streak +1 on the next day. |
| TC-170 | P1 | Missing a day resets streak. | Streak resets to start per rules. |
| TC-171 | P1 | Daily progress persists (`vita_daily`). | Stored and restored across reloads. |
| TC-172 | P2 | Daily does NOT affect campaign records. | Daily completion isolated from per-level bests. |
| TC-173 | P2 | Daily has its own realm. | Daily realm rendered independently. |
| TC-174 | P2 | Daily victory screen. | Shows daily-specific result, not "next level". |
| TC-175 | P2 | Daily board is solvable. | Bot-completable to victory. |
| TC-176 | P2 | Corrupt `vita_daily` JSON. | App falls back to defaults without crashing. |
| TC-177 | P3 | Streak display at large values (e.g. 99). | Renders without layout break. |

## 11. Win / loss states (TC-178 … TC-189)

> **Loss model:** the only loss is **"Tray Full!"** — the holder tray reaches `TRAY_CAPACITY` (4) tiles with no match (`App.tsx:656`). There is no separate "no-moves stalemate" warning; the game-over modal offers **Return a Tile (Undo)**, **Restart**, and **Main Menu** (no Shuffle). Win = board empty **and** tray empty.

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-178 | P0 | Clear all tiles (board + tray empty). | Victory screen appears. |
| TC-179 | P1 | Fill the tray to 4 tiles with no match. | "Tray Full!" game-over screen appears. |
| TC-180 | P1 | On the Tray-Full screen, press Restart. | Level rebuilds fresh; counters/timer reset. |
| TC-181 | P1 | On the Tray-Full screen, press "Return a Tile" (Undo). | Last tile returns to the board; play continues (Undos remain). |
| TC-182 | P1 | Win with exactly 2 tiles left (final matching pair). | Final pair clears → victory. |
| TC-183 | P2 | Victory screen dismiss/continue path. | Leads to next level or menu, not a dead end. |
| TC-184 | P2 | Tray fills before the board clears. | Loss (Tray Full), not victory. |
| TC-185 | P1 | No false game-over while a tray match is still possible. | Game-over only when tray is full with no pair. |
| TC-186 | P2 | Win then start a new level. | Fresh board; counters/timer reset. |
| TC-187 | P2 | Reach Tray-Full with 0 Undos left. | Message states out of Undos; only Restart/Menu offered. |
| TC-188 | P2 | Victory persists best record before navigating. | Record saved even if user leaves quickly. |
| TC-189 | P3 | Victory celebration audio/visual. | Plays once, not repeatedly. |

## 12. Holder-tray mode (the single game mode) (TC-190 … TC-199)

> The tray holds **`TRAY_CAPACITY = 4`** tiles (`App.tsx:37`). Matching **pairs** auto-clear from the tray; 4 non-matching tiles = loss.

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-190 | P1 | Enter tray gameplay mode. | **4-slot** holder tray renders. |
| TC-191 | P1 | Send a tile to the tray. | Tile occupies a tray slot. |
| TC-192 | P1 | A matching pair meets in the tray. | The pair auto-clears from the tray. |
| TC-193 | P1 | Fill all 4 tray slots without a match. | "Tray Full!" loss condition handled correctly. |
| TC-194 | P1 | Combo on consecutive tray clears (within the 3s window). | Combo audio/feedback fires on chained clears. |
| TC-195 | P2 | Tray slide animation. | Smooth, no overlap/jank. |
| TC-196 | P2 | Magnet booster pulls last tiles back from the tray. | Up to 3 tiles return to the board. |
| TC-197 | P2 | Tray state during reload. | Either restored or cleanly reset (no corruption). |
| TC-198 | P2 | Tray-mode win condition. | Board empty **and** tray empty ends the round with victory. |
| TC-199 | P3 | Tray legibility on small screens. | All 4 slots visible at 320px. |

## 13. Persistence / localStorage (TC-200 … TC-207)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-200 | P1 | Settings survive reload. | High contrast + volumes restored. |
| TC-201 | P1 | Booster counts survive reload. | Counts restored (non-bot). |
| TC-202 | P1 | Records survive reload. | Per-level bests restored. |
| TC-203 | P1 | Daily state survives reload. | `vita_daily` restored. |
| TC-204 | P1 | Bot mode does NOT write real saves. | `?bot=1` leaves localStorage records untouched. |
| TC-205 | P2 | Corrupt records JSON. | App tolerates and resets that key. |
| TC-206 | P2 | localStorage disabled/blocked. | App still runs (in-memory fallback, no crash). |
| TC-207 | P2 | Clear storage mid-session then reload. | Returns to first-run defaults cleanly. |

## 14. Accessibility (TC-208 … TC-217)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-208 | P1 | High-contrast mode contrast ratios. | Text/tiles meet readable contrast. |
| TC-209 | P1 | Interactive controls have accessible names. | Buttons expose aria-labels/text. |
| TC-210 | P1 | Keyboard navigation through menu/settings. | All actions reachable without a mouse. |
| TC-211 | P2 | Focus visible on all controls. | Focus ring/outline present. |
| TC-212 | P2 | Modal focus management. | Focus moves into modal on open, returns on close. |
| TC-213 | P2 | Tile selection has non-color cue. | Selection not conveyed by color alone. |
| TC-214 | P2 | Reduced-motion respected (if supported). | Heavy animation reduced when `prefers-reduced-motion`. |
| TC-215 | P2 | Hit targets large (senior-friendly origin). | Tiles/buttons meet comfortable touch size. |
| TC-216 | P3 | Screen-reader pass on menu. | Landmarks/labels announced sensibly. |
| TC-217 | P2 | Text scales without breaking layout. | 125% zoom keeps UI usable. |

## 15. Mobile / responsive / haptics (TC-218 … TC-229)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-218 | P1 | Portrait phone viewport (375×812). | Board fits; tiles upright; no horizontal squash. |
| TC-219 | P1 | Landscape phone viewport. | Layout adapts without clipping. |
| TC-220 | P1 | Tablet viewport (768×1024). | Board scales up appropriately. |
| TC-221 | P1 | Pinch/board pan on mobile. | Pan clamps to bounds; no runaway scroll. |
| TC-222 | P1 | Tap accuracy on small tiles. | Correct tile selected on tap (no mis-hit). |
| TC-223 | P2 | Haptic feedback on match (touch device). | Vibration fires where supported. |
| TC-224 | P2 | Haptic on invalid/blocked tap. | Distinct feedback for rejects. |
| TC-225 | P2 | Orientation change mid-game. | Board reflows without losing state. |
| TC-226 | P2 | Very narrow 320px width. | Core UI usable, nothing cut off. |
| TC-227 | P2 | Large desktop 1920px. | Board centered, not over-stretched. |
| TC-228 | P3 | Notch / safe-area insets. | Controls not hidden behind notch. |
| TC-229 | P2 | Touch peek (hold) on mobile. | Peek works via touch-and-hold (see §6). |

## 16. Audio (TC-230 … TC-237)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-230 | P1 | Click/select SFX synthesized. | Plays via Web Audio (no asset 404). |
| TC-231 | P1 | Match chime plays. | Distinct success sound on match. |
| TC-232 | P1 | Ambient loop plays in gameplay. | Loops without gap/click when enabled. |
| TC-233 | P1 | Ambient stops on returning to menu. | No ambient bleed where not intended. |
| TC-234 | P1 | Mute via 0 volume silences all. | No audible output at 0. |
| TC-235 | P2 | Audio respects browser autoplay policy. | Starts after user gesture; no console autoplay error. |
| TC-236 | P2 | Combo arpeggio in tray mode. | Pitched-up chain plays. |
| TC-237 | P3 | No audio glitches on rapid matches. | No clipping/overlap distortion. |

## 17. Bot harness / QA deep-links (TC-238 … TC-245)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-238 | P0 | `?bot=1` auto-plays a full board. | Bot finishes a board to victory. |
| TC-239 | P1 | `?bot=1&level=N` deep-link. | Bot plays the specified level. |
| TC-240 | P1 | `?daily=1` deep-link. | Jumps straight into Daily. |
| TC-241 | P1 | Combined `?bot=1&level=200`. | Bot solves level 200. |
| TC-242 | P1 | Bot run leaves no console errors. | Clean console across a full auto-play. |
| TC-243 | P2 | Bot pacing (one tap per tick). | No double-taps / race on board state. |
| TC-244 | P2 | Bot never gets permanently stuck. | Uses shuffle/hints to always progress. |
| TC-245 | P2 | Bot saves are isolated. | Real progress untouched after bot runs. |

## 18. Branch-specific — Midnight / Gothic Legends (TC-246 … TC-255)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-246 | P1 | Default theme on this branch. | Dark/Mystic gothic theme active by default. |
| TC-247 | P1 | Gothic monster tile set renders. | Dracula/Werewolf-style SVG tiles display correctly. |
| TC-248 | P1 | All gothic tile SVGs load. | No missing/broken tile glyphs. |
| TC-249 | P1 | Branding shows Midnight/Legends edition. | Title/badge reflect the edition. |
| TC-250 | P2 | Haunted layout display names. | Layout labels use the edition's naming. |
| TC-251 | P2 | Haunted achievement names. | Achievements use edition-specific names. |
| TC-252 | P2 | Gothic tiles legible on dark realms. | Contrast adequate against dark backgrounds. |
| TC-253 | P2 | Matching logic unaffected by reskin. | Gothic tiles match by type/value identically. |
| TC-254 | P2 | Version badge `v0.1.0-legends`. | Correct edition version string. |
| TC-255 | P3 | No leftover cute-edition assets. | No kids-branch art leaks into this build. |

## 19. Edge cases & robustness (TC-256 … TC-270)

| ID | Pri | Steps | Expected |
|----|-----|-------|----------|
| TC-256 | P1 | Spam-tap many tiles rapidly. | No double-clears, no stuck selection, no errors. |
| TC-257 | P1 | Open Settings mid-match-animation. | No state corruption; animation resolves. |
| TC-258 | P1 | Undo at the exact moment of victory. | Defined behaviour; no broken win state. |
| TC-259 | P1 | Shuffle on the last 2 tiles. | Still solvable; no crash. |
| TC-260 | P1 | Resize window continuously during play. | Board reflows without losing tiles/state. |
| TC-261 | P2 | Navigate menu↔game↔menu rapidly. | No leaked timers/audio; console clean. |
| TC-262 | P2 | Background the tab then return. | Timer/audio resume sanely. |
| TC-263 | P2 | Hold-peek then immediately match. | No conflict between peek and select. |
| TC-264 | P2 | Trigger hint + shuffle simultaneously. | Both resolve without board corruption. |
| TC-265 | P2 | Complete level with all boosters at 0. | Win still possible and recorded. |
| TC-266 | P2 | Multiple rapid reloads during a bot run. | No persisted corruption. |
| TC-267 | P2 | Very long session (many levels). | No memory growth/leak symptoms. |
| TC-268 | P2 | Invalid query combo `?bot=1&level=0&daily=1`. | Sane precedence; no crash. |
| TC-269 | P3 | Emoji/RTL locale rendering of labels. | Labels render without mojibake. |
| TC-270 | P2 | Network offline after first load. | Game keeps working (zero external deps). |

---

## Coverage summary

| Area | Cases |
|------|-------|
| 1. Load & smoke | 12 |
| 2. Menu & navigation | 15 |
| 3. Settings | 20 |
| 4. Engine & rules | 25 |
| 5. Boosters | 22 |
| 6. Peek | 8 |
| 7. Progression / 240 levels | 20 |
| 8. Scoring / stars / combos | 20 |
| 9. Realms / themes | 20 |
| 10. Daily Challenge / streak | 15 |
| 11. Win / loss / stalemate | 12 |
| 12. Rush / tray mode | 10 |
| 13. Persistence | 8 |
| 14. Accessibility | 10 |
| 15. Mobile / responsive | 12 |
| 16. Audio | 8 |
| 17. Bot harness | 8 |
| 18. Branch-specific (Midnight) | 10 |
| 19. Edge cases | 15 |
| **Total** | **270** |

## Reporting format (for the QA agent)
For each executed case, record: `ID | PASS/FAIL/BLOCKED | note (+ screenshot path on visual/fail)`. Group failures by priority. Surface any console error with the case ID that triggered it. End with a prioritized findings list (P0 first).
