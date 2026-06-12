# Vita Mahjong — Game Design & Stacking Reference

A comprehensive design document for building a polished Mahjong‑Solitaire‑style
tile game: how the game is designed, how the gameplay loop works, and — in the
most detail — **how the tiles stack on top of each other** so the board reads as
a real 3‑D pile instead of a flat mosaic.

This document is written specifically against the Vita Mahjong codebase
(`src/App.tsx`, `src/components/Tile.tsx`, `src/components/MahjongBoard.tsx`,
`src/mahjong/gameEngine.ts`, `src/mahjong/layouts.ts`, `src/index.css`) but the
principles are general.

> Research grounding: the rules and history below are consistent with the
> public descriptions of the genre. See **Sources** at the end.

---

## Table of Contents

1. What this game is
2. A short history of the genre
3. The core gameplay loop
4. The tile set (what 144 tiles actually are)
5. Matching rules
6. The "free tile" rule (the heart of the game)
7. Board layouts and the coordinate system
8. **How tiles stack — the 3‑D model** (the big one)
9. **Rendering the stack so it reads as 3‑D** (CSS specifics)
10. Diagnosing the "flat mosaic" bug in the current build
11. Concrete fix plan for Vita Mahjong
12. Guaranteed‑solvable board generation
13. Difficulty and balancing
14. Player aids / powers
15. The holder‑tray variant (the current Vita loop)
16. UX, accessibility, and onboarding
17. Feedback, juice, and audio
18. Art direction
19. Technical architecture
20. Performance
21. Retention and monetization (light)
22. QA and testing
23. Production checklist mapping
24. Glossary
25. Sources

---

## 1. What this game is

Mahjong Solitaire (also historically called *Shanghai*) is a **single‑player
tile‑matching puzzle**. It borrows the 144 tiles of a four‑player Mahjong set,
but it is **not** the four‑player game — there are no hands, melds, or scoring
hands. The only thing it keeps is the *tiles* and their *art*.

The fantasy is simple and timeless:

- A beautiful pile of carved tiles sits in front of you in a sculpted shape.
- You remove them two at a time by matching identical, reachable tiles.
- As you peel tiles off, new ones become reachable.
- You win when the table is clear.

It is a **perfect‑information, deterministic** puzzle (the whole board is
visible), which makes it relaxing: no hidden information, no opponent, no timer
unless you add one. That calm, meditative quality is the genre's core appeal and
why it skews toward an older, casual audience — which is exactly Vita Mahjong's
target.

Two important truths shape every design decision:

1. **Readability is everything.** The player must be able to tell, at a glance,
   which tiles are playable and how the pile is stacked. If they can't, the game
   feels random and frustrating.
2. **Calm beats flashy.** Feedback should be gentle and satisfying, not loud.

---

## 2. A short history of the genre

- **1981** — Brodie Lockard builds the first computer version on the PLATO
  system at the University of Illinois, inspired by Mahjong tiles.
- **1986** — Activision licenses it and ships *Shanghai* for home computers.
  This is the version most people picture when they think "computer Mahjong."
- **1990s–2000s** — Thousands of shareware/Flash clones; the **Turtle** layout
  becomes the default everyone recognizes.
- **2010s–present** — Mobile free‑to‑play versions add layouts, daily puzzles,
  hints/undo/shuffle as "props," cosmetics, and accessibility for seniors
  (large tiles, high contrast). Vita Mahjong sits in this lineage.

The genre's longevity comes from a tiny, elegant ruleset that produces deep
puzzles. Respect that simplicity.

---

## 3. The core gameplay loop

The classic loop is:

```
   ┌─────────────────────────────────────────────┐
   │  See the board (a 3-D pile of tiles)          │
   │            │                                  │
   │            ▼                                  │
   │  Identify FREE tiles (reachable)              │
   │            │                                  │
   │            ▼                                  │
   │  Select two matching free tiles               │
   │            │                                  │
   │            ▼                                  │
   │  They clear → tiles beneath/beside open up    │
   │            │                                  │
   │            ▼                                  │
   │  Repeat until the board is empty (WIN)        │
   │  …or no moves remain (STUCK → shuffle/lose)   │
   └─────────────────────────────────────────────┘
```

Every turn is a small planning problem: *which* pair you remove changes what
becomes free next. Good players think a few moves ahead, the way you do in
Solitaire (cards). That is the entire game. Everything else — layouts, themes,
powers, scoring — is dressing on this loop.

**Win condition:** all tiles removed.
**Loss / stuck condition:** tiles remain but no two *free* tiles match.

The Vita build adds a **holder‑tray variant** on top of this (see §15), but the
underlying "free tile" and "stacking" concepts are identical and must be solid
first.

---

## 4. The tile set (what 144 tiles actually are)

A standard set is 144 tiles. In code (`gameEngine.ts → generateStandardDeck`)
this is:

**Suits (108 tiles).** Three suits, numbered 1–9, four copies each:

- **Circles / Dots** (筒) — `type: 'circle'`, `value: 1..9`
- **Bamboo / Bams** (條) — `type: 'bamboo'`, `value: 1..9`
- **Characters / Craks** (萬) — `type: 'character'`, `value: 1..9`
  - Authentic craks show the **number on top + the 萬 glyph below**.

`3 suits × 9 values × 4 copies = 108`.

**Honors (28 tiles).**

- **Winds** — East/South/West/North, four copies each = 16
- **Dragons** — Red (中), Green (發), White (□), four copies each = 12

**Bonus tiles (8 tiles).**

- **Flowers** — Plum, Orchid, Bamboo, Chrysanthemum (4 unique)
- **Seasons** — Spring, Summer, Autumn, Winter (4 unique)

`108 + 16 + 12 + 8 = 144`. ✔

In a *cute* art style (the current Vita look), these identities are mapped to
friendly icons (animals, fruit, vehicles, weather). That's fine — **the only
thing that matters mechanically is the match identity**, not the artwork. Keep a
clean mapping from `(type, value)` → icon so you can re‑skin freely.

---

## 5. Matching rules

Two tiles match if they are the *same identity*:

- **Suits / Winds / Dragons:** match only if `type` **and** `value` are equal.
  (3‑circle matches 3‑circle, not 4‑circle; East matches East, not South.)
- **Flowers:** any Flower matches any other Flower (a 4‑tile wild group).
- **Seasons:** any Season matches any other Season (a 4‑tile wild group).

This is exactly `tilesMatch()` in `gameEngine.ts`:

```ts
export function tilesMatch(a, b) {
  if (a.type !== b.type) return false;
  if (a.type === 'season' || a.type === 'flower') return true; // wild groups
  return a.value === b.value;
}
```

The wild groups exist because there is only one of each Flower/Season, so they'd
be unmatchable otherwise. They also add a small strategic wrinkle: a Flower can
pair with *any* free Flower, giving flexibility.

---

## 6. The "free tile" rule (the heart of the game)

A tile is **free** (a.k.a. open, exposed, playable) when **both**:

1. **Nothing is on top of it** — no tile on the layer directly above overlaps
   its footprint, and
2. **At least one long side is open** — there is no tile immediately to its
   **left** *or* no tile immediately to its **right** (on the same layer).

A tile blocked on **both** left and right, or covered from above, is **not**
free, even if it's fully visible.

In `gameEngine.ts → checkIfTileIsFree`:

```ts
// 1. Covered from above?
const topOverlap = tiles.some(o => o.z === tile.z + 1 && overlaps(tile, o));
if (topOverlap) return false;

// 2. Blocked on a side?
const leftBlocked  = tiles.some(o => o.z === tile.z && o.x === tile.x - 2 && |o.y - tile.y| < 2);
const rightBlocked = tiles.some(o => o.z === tile.z && o.x === tile.x + 2 && |o.y - tile.y| < 2);

return !leftBlocked || !rightBlocked;  // free if a side is open
```

Two design notes:

- **"Overlap" uses a half‑tile grid.** Tiles are 2 grid units wide and tall, so
  a tile at `x` occupies columns `x` and `x+1`; two tiles overlap if their
  centers are within 2 units on each axis (`overlaps()` in `layouts.ts`). This
  half‑step grid is what allows the classic *offset* stacking (a tile resting on
  the seam between two lower tiles).
- **Communicate it.** The single biggest usability win is to **visually mark
  free tiles** (brighten them) and **dim blocked tiles**. Vita already does this
  via `.mahjong-tile.free` / `.mahjong-tile.blocked` filters in `index.css`.
  Keep that contrast strong.

---

## 7. Board layouts and the coordinate system

A *layout* is just a list of tile positions `{ x, y, z }` in grid units. Vita
defines five in `layouts.ts` (Turtle, Castle, Pyramids, Butterfly, Cat).

The coordinate system:

- `x` — column, in **half‑tile units**. A tile spans `x .. x+2` (2 units wide).
- `y` — row, in half‑tile units. A tile spans `y .. y+2` (2 units tall).
- `z` — **layer / elevation**, integer `0` (table) and up. The Turtle peaks at
  `z = 4`.

Because positions are in half‑units, you can place an upper tile at `x+1`
(half‑offset) so it straddles two lower tiles — the iconic Mahjong look.

**The Turtle** (the default, 144 tiles) is built in `generateTurtle()`:

- **Layer 0:** ~88 tiles — a wide flat shell with two single "wing" tiles poking
  out left and right.
- **Layer 1:** ~36 tiles — a smaller rounded slab centered on the shell.
- **Layer 2:** ~16 tiles — smaller again.
- **Layer 3:** 4 tiles — a tight cluster near the peak.
- **Layer 4:** 1 tile — the single capstone on top.

The result is a stepped pyramid/dome — a *turtle shell*. The shape matters for
two reasons: (a) it's instantly recognizable, and (b) the stepped sides mean
many tiles have an open flank, keeping the puzzle moving.

**Design guidance for layouts:**

- Keep layouts **symmetric** — it looks intentional and reads cleanly.
- Ensure most tiles have **an open side most of the time**, or the board feels
  locked.
- Vary silhouette per level (turtle, pyramid, butterfly, cat) for visual
  novelty without changing rules.
- The bounding box should be **centered and fit the screen** (see
  `MahjongBoard.tsx → computeFitTransform`, which fits the *actual tile bounding
  box*, not the whole grid).

---

## 8. How tiles stack — the 3‑D model (the big one)

This is the section that addresses the screenshot problem: *the non‑greyed tiles
don't look stacked on top of each other.*

### 8.1 The mental model

Think of each tile as a **physical domino‑thick block**:

- It has a **top face** (the art) and **four side walls** (the thickness).
- It sits at an integer **elevation `z`**. A tile at `z=1` literally rests on top
  of the `z=0` tiles below it.
- When you look at the pile from a **fixed camera angle** (slightly above, light
  from the upper‑left), a higher tile is drawn **shifted up and to the left**,
  and it **casts a shadow** down‑right onto whatever is beneath it.

The illusion of a 3‑D pile is produced by exactly three things, in priority
order:

1. **Draw order** (painter's algorithm) — lower/back tiles drawn first, upper/
   front tiles drawn last so they paint *over* the ones they rest on.
2. **A consistent elevation offset** — every layer shifts by a fixed vector
   (e.g. up‑left), and crucially the offset must be **big enough to see**.
3. **A shadow / darkening under elevated tiles** — so the eye reads "this tile
   floats above that one," not "these are two tiles side by side."

If any one of those is wrong, the board flattens. The current build gets #1 and a
weak #2 but is missing a strong, *localized* #3 (a real drop shadow cast by the
elevated tile onto the tiles directly beneath it).

### 8.2 The offset vector

Pick one light/camera direction and never change it. The classic choice is
**light from the top‑left, camera slightly above**, which means:

- Higher tiles shift **up and left** by a per‑layer amount.
- Their thickness (side walls) is visible on the **bottom and right**.
- Shadows fall **down and right**.

In Vita, `Tile.tsx` uses:

```ts
const shiftX = z * -6; // each layer up moves 6px left
const shiftY = z * -7; // each layer up moves 7px up
```

That offset is *in the right direction* but small relative to a ~52px tile. The
half‑tile grid offset (placing upper tiles at `x+1`) does most of the structural
work; the pixel shift is a secondary "lift." The reason the screenshot looks flat
is **not** mainly the offset — it's the missing cast shadow (see §8.4) plus
uniform wall depth.

### 8.3 Draw order (painter's algorithm)

The golden rule: **render back‑to‑front and bottom‑to‑top.** Sort tiles by:

```
primary:   z ascending     (lower layers first)
secondary: y ascending      (back rows first)
tertiary:  x ascending      (left to right)
```

Then either append to the DOM in that order, or set `z-index` from that order.
Vita uses CSS `z-index: 10 + z*5` plus DOM order. This works **as long as a
higher‑z tile always has a higher z‑index than every tile it visually overlaps.**
The `*5` multiplier gives headroom for selected/hover boosts. Keep it.

A subtle gotcha: tiles on the **same layer** must also paint in back‑to‑front
order so the right/bottom side walls of a left/upper tile don't poke through a
right/lower neighbor. Sorting by `(z, y, x)` handles this.

### 8.4 The cast shadow — the missing ingredient

A tile that is *physically on top of* another must drop a shadow onto it. Without
that shadow the brain has no depth cue and reads the whole thing as flat — which
is exactly what the screenshot shows.

Two ways to do it:

1. **A drop shadow on the tile element**, offset down‑right, sized so it lands on
   the lower tile:

   ```css
   .mahjong-tile { filter: drop-shadow(-5px 8px 6px rgba(0,0,0,.55)); }
   ```

   This is what Vita has. The problem: a uniform drop shadow on *every* tile
   (including flat layer‑0 tiles that aren't on top of anything) makes the whole
   board look equally "lifted," which paradoxically flattens the *relative*
   depth. Layer‑0 tiles should have a **small** contact shadow; higher layers
   should have **progressively larger, darker** shadows.

2. **Scale the shadow by elevation.** This is the key fix:

   ```css
   .layer-0 { box-shadow: -2px 2px 4px  rgba(0,0,0,.35); }
   .layer-1 { box-shadow: -4px 5px 9px  rgba(0,0,0,.45); }
   .layer-2 { box-shadow: -6px 8px 14px rgba(0,0,0,.50); }
   .layer-3 { box-shadow: -9px 11px 20px rgba(0,0,0,.55); }
   .layer-4 { box-shadow: -12px 14px 26px rgba(0,0,0,.60); }
   ```

   A tile on layer 2 now visibly hovers above layer 1, which hovers above layer
   0. The shadow grows with height exactly like real stacked objects.

   Vita already scales layer shadows — but they should be **darker and softer**
   than the per‑tile drop‑shadow, and the per‑tile `drop-shadow` should be
   reduced so the layer shadow dominates the depth cue.

### 8.5 The side walls (tile thickness)

Each tile draws two visible side walls — left and bottom — skewed 45° to fake
isometric thickness (`.tile-3d-side-left`, `.tile-3d-side-bottom` in
`index.css`). The wall is split: a thin bright bevel cap (the rounded top edge of
the tile) then the colored "plastic" body (red in the current theme).

Design rules for the walls:

- **Wall depth should be uniform across layers** (Vita's current `wallDepth = 10`
  is correct now that the per‑z height was removed). Per‑z‑tall walls looked
  "ugly" because they made high tiles into weird tall pillars; real Mahjong tiles
  are all the same thickness — the *stack* gives height, not the individual tile.
- **The lit edge faces the light** (top‑left), the shadowed edge faces away.
- Keep walls **thin relative to the face** (~15–20% of tile size). Too thick and
  the board looks like a brick wall (an earlier Vita iteration had this).

### 8.6 Putting it together — the depth recipe

To make a tile unmistakably "on top," combine, in order of impact:

1. Correct **draw order** (`z, y, x`) and `z-index`. ✔ (Vita has this)
2. **Elevation‑scaled cast shadow** under each tile (bigger/darker per layer).
   ⚠ (Vita scales it but too weakly vs. the global drop‑shadow)
3. A **half‑tile structural offset** for upper tiles (from the layout). ✔
4. A **small per‑layer pixel lift** up‑left. ✔ (`shiftX/shiftY`)
5. **Thin, consistent side walls** with a fixed light direction. ✔
6. Optional: a **subtle dark gradient** on the lower tile where an upper tile
   covers it (ambient occlusion in the crevice).

The single change that will most fix the screenshot is **#2** — make the cast
shadow clearly grow with elevation and ease off the flat global drop‑shadow.

### 8.7 ASCII illustration

Side view of three stacked layers (light from upper‑left):

```
                 ┌───────────┐        z=2  (drawn last, on top)
                 │   TOP     │
                 │   FACE    │░░       ← shadow cast down-right
            ┌────┴───────────┴────┐   z=1
            │      TOP FACE       │░░░
            │                     │░░░░ ← bigger shadow
       ┌────┴─────────────────────┴────┐ z=0 (drawn first)
       │          TOP FACE             │░
       └───────────────────────────────┘
        ▒▒ left/bottom side walls (thickness)
```

Top‑down with the up‑left offset (numbers = layer):

```
        0 0 0 0 0 0
        0 1 1 1 1 0     ← layer-1 tiles shifted up-left,
        0 1 2 2 1 0        sitting on the seams of layer-0
        0 1 2 2 1 0
        0 1 1 1 1 0
        0 0 0 0 0 0
```

The capstone (`z=4`) sits dead center, highest, with the deepest shadow.

---

## 9. Rendering the stack so it reads as 3‑D (CSS specifics)

Concrete, Vita‑specific guidance for `index.css` / `Tile.tsx`:

**Grid placement.** The board is a CSS grid (`.mahjong-grid`,
`grid-template-columns: repeat(30, 26px)`); each tile spans 2 columns/rows. The
inline transform applies the per‑layer pixel lift:

```ts
transform: `translate(${shiftX}px, ${shiftY}px)`;  // shiftX=z*-6, shiftY=z*-7
zIndex: 10 + z * 5 + (selected ? 100 : 0);
```

**Tile face.** Warm ivory radial gradient, thin colored border
(`--tile-border-3d`), inner bevel via inset box‑shadows. Keep the **specular
sheen** (`.tile-face::after`) subtle.

**The fix for depth (recommended values):**

```css
/* Reduce the flat global drop-shadow … */
.mahjong-tile { filter: drop-shadow(-3px 5px 4px rgba(0,0,0,.40)); }

/* …and let elevation-scaled cast shadows do the depth talking */
.layer-0 .tile-face { box-shadow: 0 1px 2px rgba(0,0,0,.25); }
.layer-1 { filter: drop-shadow(-4px 7px 7px rgba(0,0,0,.45)); }
.layer-2 { filter: drop-shadow(-7px 11px 12px rgba(0,0,0,.52)); }
.layer-3 { filter: drop-shadow(-10px 15px 18px rgba(0,0,0,.58)); }
.layer-4 { filter: drop-shadow(-13px 19px 24px rgba(0,0,0,.62)); }
```

(Apply the growing shadow as a `filter: drop-shadow` on the whole tile so it
follows the skewed silhouette, not a rectangular `box-shadow`.)

**Hover & selection.** A free tile should lift a touch more on hover
(`translate(-3px,-3px) scale(1.04)`) and a selected tile should glow. These are
*temporary* boosts on top of the base elevation — never let them exceed a higher
real layer's z‑index, or a hovered low tile will jump above a high tile.

**Matched/clearing tiles** animate up‑and‑out (`tileClear` keyframes) so the
removal feels physical and the tiles beneath are revealed with a beat.

---

## 10. Diagnosing the "flat mosaic" bug in the current build

From the screenshot, the elevated (non‑greyed) tiles don't read as stacked.
Likely causes, in order of probability:

1. **Uniform global drop‑shadow, weak per‑layer differentiation.** Every tile has
   roughly the same shadow, so there's no *relative* depth cue. → Fix per §8.4 /
   §9 (scale shadow by layer, reduce the global one).
2. **Offset too small to read at the current zoom.** When the board is zoomed out
   to fit 144 tiles, a 6–7px per‑layer shift becomes ~2–3px on screen —
   invisible. → Consider a slightly larger per‑layer shift, **and** rely on the
   shadow (which scales visually with zoom) for the primary cue.
3. **The dim/bright contrast competes with depth.** Heavy dimming of blocked
   tiles can read as "these are a different color," not "these are lower."
   Make sure the brightness delta is moderate and the *shadow* carries depth.
4. **Side walls same brightness as the face**, so the tile edge doesn't separate
   from the face. → Ensure the wall's lit cap and shadowed body contrast with the
   ivory face.

Note the half‑tile offset in the layouts is correct (tiles do straddle seams),
so the *structure* is right — it's the *lighting/shadow* that's underselling it.

---

## 11. Concrete fix plan for Vita Mahjong

Minimal, high‑impact changes (no gameplay risk):

1. **Elevation‑scaled cast shadows.** Replace the flat per‑tile `drop-shadow`
   with the layered `drop-shadow` ramp in §9. This is the #1 fix.
2. **Slightly increase the per‑layer lift** to `shiftX = z*-7`, `shiftY = z*-9`
   so the structural offset survives zoom‑out.
3. **Add crevice shading**: a 1px inset dark line on the top/left of the tile
   face so the seam where an upper tile meets a lower tile reads as a recess.
4. **Keep wall depth uniform** (already done) and ensure the wall's shadowed edge
   is distinctly darker than the face.
5. **Re‑test at multiple zoom levels** (the 144‑tile Turtle zoomed out is the
   worst case; verify depth still reads).

Acceptance test: at default zoom, a player should be able to point to any tile
and say which layer it's on, and the capstone should obviously be "the top one."

---

## 12. Guaranteed‑solvable board generation

A naive shuffle (random faces on random positions) produces **unsolvable** boards
~3% of the time and *frustratingly hard* ones far more often. Vita uses the
correct approach (`gameEngine.ts → buildSolvableBoard`): the **reverse‑placement
algorithm**.

1. Start with all positions "filled" (faceless).
2. Repeatedly find two currently‑*free* positions, remove them as a pair, and
   record the removal order. Continue until the board is empty.
3. If you ever can't find two free positions, retry with a new random stream
   (up to N attempts).
4. **Reverse** the removal order → a valid *placement* order. Walk it, assigning
   each pair of positions a matching tile face from a shuffled, balanced deck.

Because every pair was free at removal time, the reversed order guarantees a
solution path exists. This is the single most important "fun" guarantee in the
genre — never ship random boards.

Notes:

- For layouts with < 144 slots, draw a **balanced subset** of pairs so the deck
  stays matchable (Vita groups by match identity and pops pairs).
- Keep a **legacy random fallback** for the rare case all attempts fail
  (`buildBoardLegacy`) so the game never hard‑fails.

---

## 13. Difficulty and balancing

Difficulty in this genre comes from:

- **Layout shape** — more layers and tighter clusters = harder (fewer open
  sides). Turtle is medium; a tall narrow tower is hard.
- **Tile distribution** — where matching pairs end up. Solvable‑generation
  doesn't mean *easy*; a pair split across deep, opposite positions is hard.
- **"Trap" pairs** — three of a kind exposed where matching the wrong two locks
  the fourth. Good players plan around this.

Tuning levers:

- Number of layers / silhouette per level.
- Whether to **bias generation toward more open boards** (place pairs so more
  tiles stay free) for an easier, more relaxing curve — appropriate for Vita's
  senior audience.
- Difficulty select (Easy/Medium/Hard) by choosing layouts and generation bias.

For a *relaxing* game, err easy. For a *challenging* one, allow tight layouts and
expose the genre's natural traps.

---

## 14. Player aids / powers

The three canonical aids (Vita has all three):

- **Hint** — highlight a currently‑playable matching pair. Cheap, reduces
  frustration. Optionally limited/charged so it's not a crutch.
- **Shuffle** — re‑assign faces to remaining tiles (keeping positions), used when
  stuck. Should **re‑roll until at least one move exists** (Vita does this in
  `shuffleActiveTiles`).
- **Undo** — step back the last removal. Removes the fear of irreversible
  mistakes — important for older players.

Design guidance:

- Make them **generous but visible as a resource** (charges, refilled per level
  or by watching an ad / earning coins). The little "+" badges in many mobile
  versions imply earnable refills.
- Always show **how many uses remain** (Vita's badge counts).
- Never let aids feel mandatory; the base game must be winnable with planning.

---

## 15. The holder‑tray variant (the current Vita loop)

Vita currently runs a **holder‑tray** twist (Tile‑Master / "Sheep"‑style) layered
on the classic board:

- Tapping a **free** tile sends it to a **tray** of N slots (currently 7).
- When two tiles in the tray match, they **auto‑clear** and score.
- If the tray fills with no match, it's **game over** unless you spend a power
  (Undo returns the last tile to the board).
- Win when the board and tray are both empty.

Why it's compelling: it adds *tension* (the filling tray) and *commitment* (once
collected, a tile is off the board) to the otherwise calm base loop, which is
exactly what drives the genre's modern viral hits.

Design rules specific to the tray:

- **Tray size tunes difficulty more than anything.** 3 slots is brutal; 7 is
  forgiving; 5 is tense. Vita moved 4 → 7 for accessibility — good.
- **Auto‑clear pairs immediately** so the player isn't doing tray bookkeeping.
- **Telegraph danger**: the tray should turn amber at N‑1 and pulse red at N
  (Vita does this with `.tray-warn` / `.tray-danger`).
- **Onboard the rule**: this loop is *not* what "Mahjong" players expect, so a
  first‑run tutorial is mandatory (Vita now has one).
- **Solvability is softer here**: because you can hold tiles, you can grab one
  half of a pair now and its partner later — but you can also strand yourself.
  Powers (Undo/Shuffle/Hint) are the safety net.

Honest caveat: a tray game called "Mahjong" can confuse store visitors expecting
classic solitaire. Either lean into the twist in the store copy, or offer classic
solitaire as the headline mode and the tray as a variant.

---

## 16. UX, accessibility, and onboarding

This audience makes accessibility non‑negotiable:

- **Large tiles, large hit targets.** Min 44px touch targets; the board should
  auto‑fit so tiles are as big as possible (Vita's bounding‑box fit does this).
- **High‑contrast mode** and a **colorblind‑safe** tile palette (don't rely on
  red vs. green alone to distinguish tiles).
- **Clear free/blocked signaling** (brighten free, dim blocked) — already
  present; keep it strong.
- **First‑run tutorial** (now present) — 3–4 short steps, dismissible, remembered
  via `localStorage`.
- **Forgiving controls** — generous tap tolerance, no double‑tap required,
  wobble feedback when tapping a blocked tile (Vita has the wobble).
- **Readable typography** and a calm color story.
- **Pause/resume**, no punishing timers by default.

---

## 17. Feedback, juice, and audio

Calm but satisfying:

- **Match:** a soft chime (pitch can rise with a combo streak), a gentle particle
  burst at the cleared tiles, and tiles animating up‑and‑out.
- **Combo:** chaining matches quickly multiplies score with an escalating chime —
  rewards flow without being frantic.
- **Invalid tap:** a quiet "tock" + a small wobble.
- **Win:** a warm fanfare, star rating (Vita rates 1–3 on time + aids used),
  confetti/petals.
- **Ambient:** optional looping nature/zen pad, volume‑controlled, off by
  default for those who dislike it.

Keep SFX short, soft, and non‑repetitive (vary pitch slightly per match).

---

## 18. Art direction

The current cute style (friendly animals/objects, ivory tiles, red edges, light
sage felt, bamboo frame) is **good** and differentiated — keep it. Principles:

- **One light source, one camera angle** — consistency is what makes the 3‑D
  read. Top‑left light, slightly‑above camera.
- **Tiles are the hero.** Background and frame should recede; the felt is a
  stage, not a feature.
- **Icons must be distinguishable at small size** — strong silhouettes, limited
  palette per icon, thick outlines. At 144 tiles zoomed out, fine detail is lost,
  so design for the *small* size first.
- **Cohesion** — the cute icons, the red tile edges, the felt, and the UI chrome
  should share a palette and roundness.
- Keep **assets light** (the logo/bg were optimized 1.78MB → 0.34MB) for fast
  load.

---

## 19. Technical architecture

A clean separation (which Vita roughly follows):

- **Engine (`gameEngine.ts`)** — pure functions: deck generation, match rules,
  free‑state calculation, solvable board building, shuffle, hint search. No React,
  no DOM → unit‑testable.
- **Layouts (`layouts.ts`)** — data only: arrays of `{x,y,z}` per named layout.
- **State (`App.tsx`)** — React state for the board, tray, score, combo, powers,
  modals; orchestrates engine calls and transitions (menu ↔ game ↔ win/lose).
- **View (`MahjongBoard.tsx`, `Tile.tsx`)** — pure rendering of `TileState[]`:
  grid placement, 3‑D transforms, zoom/pan, particle canvas.
- **Styling (`index.css`)** — themes via CSS custom properties
  (`--tile-border-3d`, `--tile-edge-light`, etc.) so re‑skinning is one block.

Data model (`TileState`): `{ x, y, z, id, type, value, iconIndex, isFree,
selected, matched, ... }`. The board is a flat array; `recalculateFreeState()`
re‑derives `isFree` after every removal.

Keep the engine deterministic and seedable (Vita has `SeededRandom`) so daily
puzzles and reproducible bug reports are possible.

---

## 20. Performance

- **144 DOM nodes** is fine; avoid re‑rendering all of them every tap. Use stable
  `key={tile.id}` and only update changed tiles.
- The **particle layer** is a single `<canvas>` with a capped particle count and
  a single RAF loop — don't spawn unbounded particles.
- **CSS transforms/filters** are GPU‑friendly but stacked `drop-shadow` filters on
  144 nodes can cost; test on a low‑end phone and dial shadow blur radii down if
  needed.
- Lazy‑load nothing critical; the whole game is tiny once assets are compressed.
- Avoid layout thrash: batch state updates (React 18 auto‑batches), don't read
  layout in a loop.

---

## 21. Retention and monetization (light)

For a casual/senior title, keep it gentle and honest:

- **Daily puzzle** (seeded by date) + a **streak** counter — the strongest free
  retention lever.
- **Soft progression** — unlock new layouts/levels as you win (Vita does this).
- **Cosmetics** — tile skins, felt colors, frames; the cleanest monetization.
- **Power refills** — optional rewarded video or coin economy for extra
  hint/undo/shuffle. Never gate *winning* behind payment.
- **Achievements / trophy room** for intrinsic reward (Vita has this).

Avoid: aggressive interstitials, energy/lives timers, pay‑to‑win. They poison the
calm the genre sells.

---

## 22. QA and testing

- **Engine unit tests** (the highest ROI): `tilesMatch`, `checkIfTileIsFree`,
  `recalculateFreeState`, and a property test that **every generated board is
  solvable** by replaying the recorded order.
- **Solver smoke test**: generate 10k boards per layout; assert 0 unsolvable.
- **Interaction tests**: tap a free tile → it moves to tray; tap a blocked tile →
  wobble, no move; fill tray → game over; undo → tile returns.
- **Visual regression**: screenshot the board at a few zooms/themes; eyeball the
  3‑D read.
- **Accessibility audit**: contrast ratios, hit‑target sizes, keyboard/focus,
  screen‑reader labels (Vita has `aria-label`s on powers).
- **Device matrix**: small phone, large phone, tablet, desktop; portrait and
  landscape.

The current build lacks automated tests — this is the main gap keeping it out of
a "production" score.

---

## 23. Production checklist mapping

Mapping to the repo's `production-ready-checklist`:

- *Enjoyable / fun / engaging* — strong (tray tension + calm base).
- *Easy / accessible* — improved (tutorial, big tiles, free/blocked signaling);
  still needs colorblind/large‑text defaults.
- *Beautiful / unique* — strong (cute art + red‑edge zen theme).
- *Rewarding* — stars, achievements, combos. Add daily streak.
- *Optimized* — assets compressed, small bundle. Good.
- *Polished* — close, **once the 3‑D stacking read is fixed** (this doc's §11).
- *Production‑ready* — blocked mainly by: automated tests, accessibility
  defaults, the dead tile‑style setting, and the stacking polish.

Fix the stacking (§11) + add tests + accessibility defaults and the score crosses
from "beta" into "production."

---

## 24. Glossary

- **Free / open / exposed** — a tile with nothing on top and an open left or
  right side; the only tiles you can play.
- **Layer (z)** — elevation; integer 0 (table) upward.
- **Footprint** — the 2×2‑grid area a tile occupies.
- **Painter's algorithm** — draw back‑to‑front so nearer objects paint over
  farther ones.
- **Cast shadow** — shadow an elevated tile drops on tiles beneath it (the key
  3‑D cue).
- **Capstone** — the single top tile of the Turtle (z=4).
- **Wild group** — Flowers (any↔any) and Seasons (any↔any).
- **Reverse‑placement** — solvable‑board algorithm: simulate removal of free
  pairs, then place faces in reverse.
- **Holder tray** — the N‑slot bin in the Vita variant; collect to match,
  overflow to lose.

---

## 25. Sources

- [Mahjong solitaire — Wikipedia](https://en.wikipedia.org/wiki/Mahjong_solitaire)
- [Mahjong Solitaire: Rules and How to Play — freesolitaire.com](https://www.freesolitaire.com/posts/posts-guides/mahjong-solitaire-rules)
- [How to Play Mahjong Solitaire: Complete Beginner's Guide — trymahjong.com](https://trymahjong.com/how-to-play-mahjong)
- [Play Turtle Mahjong Solitaire — trysolitaire.com](https://trysolitaire.com/en/play/mahjong?layout=turtle)
- [Tile Matching Solitaire — pagat.com](https://www.pagat.com/tile/matching.html)
- [Mahjong Solitaire — solitaire.org](https://www.solitaire.org/mahjong/)

---

---

## Appendix A — The half‑tile grid, worked in detail

The whole geometry hinges on one idea: **a tile is 2 grid units wide and 2 tall,
but positions can be placed at any integer coordinate.** That half‑tile
granularity is what lets an upper tile straddle the seam between two lower tiles.

Concrete example. Place three tiles:

```
A at (x=0, y=0, z=0)   → occupies columns 0–1, rows 0–1
B at (x=2, y=0, z=0)   → occupies columns 2–3, rows 0–1   (right of A)
C at (x=1, y=0, z=1)   → occupies columns 1–2, rows 0–1   (on top, straddling A&B)
```

Top‑down footprints (each digit is one grid unit; `.`=empty):

```
        col: 0 1 2 3
 z=0  row0: A A B B
       row1: A A B B

 z=1  row0: . C C .     ← C overlaps the right half of A and the left half of B
       row1: . C C .
```

Now apply the free‑tile rule:

- **C** (z=1): nothing above it, and both sides open → **free**.
- **A** (z=0): C overlaps A's footprint from z=1 (`overlaps(A,C)` is true because
  centers are within 2 units) → A is **covered** → **not free**.
- **B** (z=0): likewise covered by C → **not free**.

Remove C. Re‑run `recalculateFreeState`:

- **A**: now nothing on top; right side has B at `x+2` (blocked right), left side
  open (nothing at `x-2`) → free on the **left** → **free**.
- **B**: nothing on top; left blocked by A at `x-2`, right open → **free**.

So clearing the capstone exposes both tiles under it — the fundamental "peel"
that drives the whole game. This is why generation must guarantee that such a
peel sequence exists all the way down (see §12).

The `overlaps()` helper (in `layouts.ts`) is just:

```ts
function overlaps(a, b) {
  return Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2;
}
```

Two footprints overlap iff their centers are closer than a full tile on both
axes. Simple, fast, and exactly right for the 2‑unit tile.

---

## Appendix B — The full render pipeline, step by step

Pseudocode for one frame (matches what `MahjongBoard.tsx` + `Tile.tsx` do):

```
function renderBoard(tiles, zoom, pan):
    # 1. Sort for painter's algorithm
    drawList = tiles.filter(not matched)
                    .sort(by z asc, then y asc, then x asc)

    # 2. Compute the tight bounding box of *active* tiles
    bbox = boundingBox(drawList)            # in grid units
    # 3. Fit it to the viewport (scale) and center it (pan)
    scale = min(viewportW / bbox.w, viewportH / bbox.h) * 0.97
    panToCenter = center(viewport) - center(bbox) * scale

    # 4. Apply the board transform once (container)
    container.transform = translate(pan + panToCenter) scale(scale)

    # 5. Render each tile in sorted order
    for tile in drawList:
        el = tileElement(tile)
        el.gridColumn = tile.x + 1 .. span 2
        el.gridRow    = tile.y + 1 .. span 2
        el.transform  = translate(z*-7px, z*-9px)      # per-layer lift
        el.zIndex     = 10 + z*5 + (selected ? 100 : 0)
        el.filter     = elevationShadow(z)             # bigger per layer
        drawFace(el, tile.icon)
        drawLeftWall(el); drawBottomWall(el)
```

Key invariants:

1. **Sort before assigning z‑index.** Even though CSS `z-index` does the final
   compositing, DOM order is the tiebreaker; keep them consistent.
2. **One transform on the container** for zoom/pan, **one transform per tile**
   for the lift. Don't nest scales — it compounds rounding error.
3. **Re‑fit only on new board / resize**, not every tap (Vita gates this on
   `isNewGame`), or the board will visibly "breathe" as you clear tiles.

---

## Appendix C — Building it from scratch (a 12‑step recipe)

If you were to rebuild this from nothing, in order:

1. **Tile data type.** `{ id, x, y, z, type, value }`. Nothing visual yet.
2. **Deck generator.** Produce the 144 `(type,value)` faces (§4). Unit‑test the
   counts.
3. **A layout.** Hand‑author or generate a list of `{x,y,z}` positions. Start
   with a single flat layer to get matching working before adding height.
4. **Match rule.** `tilesMatch(a,b)` (§5). Unit‑test wild groups.
5. **Free rule.** `checkIfTileIsFree` + `recalculateFreeState` (§6). Unit‑test
   the worked example in Appendix A.
6. **Flat render.** Lay tiles on a CSS grid, no 3‑D yet. Click two free matching
   tiles → remove. You now have a playable (ugly) game.
7. **Solvable generation.** Add reverse‑placement (§12). Verify 10k boards solve.
8. **Stacking visuals.** Add per‑layer lift, side walls, and **elevation‑scaled
   shadows** (§8–§9). This is where it becomes *Mahjong*.
9. **Free/blocked signaling.** Brighten free, dim blocked (§6, §16).
10. **Aids.** Hint, shuffle, undo (§14).
11. **Juice.** Match SFX, particles, clear animation, win screen (§17).
12. **Polish.** Themes, accessibility, tutorial, daily puzzle, achievements.

Do them in this order; each step is playable, so you always have something to
test. Don't build the 3‑D before the rules work — you'll waste effort tuning
shadows on a broken game.

---

## Appendix D — Edge cases and how to handle them

- **Odd total tiles.** Must always be even (you remove pairs). Generation should
  assert `coords.length % 2 === 0`. Vita's layouts are all even.
- **Three/four of a kind exposed.** With 4 copies of most tiles, you can have 3
  free at once. Matching the "wrong" two can strand the others. This is a
  *feature* (skill), but the solvable generator guarantees *a* path exists; it
  doesn't guarantee *your* path is safe. Undo is the safety valve.
- **Deadlock (no free pair).** Detect by `findAvailableMoves(tiles).length === 0`
  with tiles remaining → offer Shuffle (classic) or it's a loss (tray). Always
  detect, never let the player sit on an unwinnable board with no prompt.
- **Shuffle must re‑roll to a solvable‑ish state.** Vita re‑rolls up to 30 times
  until at least one move exists. Without this, shuffle can hand back another
  dead board.
- **Seasons/Flowers parity.** Because they're wild within their group of 4, you
  must place them in *even counts per group* or one will be unmatchable. The
  balanced‑subset logic handles this.
- **Zoom extremes.** Very small layouts (e.g. 64‑tile Pyramids) shouldn't zoom so
  far in that tiles clip the frame; clamp max zoom (Vita clamps to 2.4×).
- **Reduced motion.** Respect `prefers-reduced-motion`: cut the clear/lift
  animations and petal particles for players who need it.

---

## Appendix E — Tray‑variant math (capacity tuning)

The holder tray's difficulty is dominated by **capacity N** and the number of
distinct face identities you might be forced to hold.

Intuition: with pair‑matching, you can safely hold up to **N−1 distinct,
unmatched** tiles; the moment you're forced to take an N‑th tile that matches
none of them, you lose. So the failure mode is "too many distinct tiles with no
partner currently reachable."

- **N = 3:** you can hold only 2 distinct → brutal; almost every non‑matching tap
  is fatal. Avoid except for "expert" modes.
- **N = 4:** hold 3 distinct → tense and punishing (Vita's first try). Hardcore.
- **N = 5:** hold 4 distinct → a good challenge sweet spot.
- **N = 7:** hold 6 distinct → forgiving; matches the popular "Sheep" feel and
  suits a casual/senior audience (Vita's current choice). ✔

Levers besides N:

- **Auto‑clear on contact** (pairs vanish immediately) effectively frees slots
  constantly, so larger N feels *much* easier than the raw number suggests.
- **Undo charges** are the real difficulty dial once N is set — they let players
  recover from a near‑fill. 3 charges is generous; 1 is hardcore.
- **Hint that points to a tray‑clearing tile** (Vita prioritizes this) hugely
  reduces accidental losses — keep it.

Rule of thumb for a relaxing title: **N = 7, 3 undos, generous hints**, and bias
board generation so partners are reachable in similar timeframes.

---

## Appendix F — Why the screenshot looks flat (recap, with the fix in code)

The elevated tiles in the current build don't read as stacked because depth is
carried almost entirely by a **uniform** drop‑shadow plus a tiny offset. The eye
needs the shadow to **grow with height**. Minimal diff:

```css
/* BEFORE: every tile, same flat shadow → no relative depth */
.mahjong-tile { filter: drop-shadow(-5px 8px 6px rgba(0,0,0,.55)); }

/* AFTER: small base, shadow ramps up per layer → clear stacking */
.mahjong-tile          { filter: drop-shadow(-3px 4px 4px rgba(0,0,0,.38)); }
.mahjong-tile.layer-1  { filter: drop-shadow(-5px 7px 8px rgba(0,0,0,.46)); }
.mahjong-tile.layer-2  { filter: drop-shadow(-7px 11px 13px rgba(0,0,0,.52)); }
.mahjong-tile.layer-3  { filter: drop-shadow(-10px 15px 18px rgba(0,0,0,.57)); }
.mahjong-tile.layer-4  { filter: drop-shadow(-13px 19px 24px rgba(0,0,0,.62)); }
```

Plus bump the per‑layer lift so the structural offset survives zoom‑out:

```ts
// Tile.tsx
const shiftX = z * -7;   // was -6
const shiftY = z * -9;   // was -7
```

That's the whole fix — no art change, no gameplay change. The art style is good;
it's purely the lighting/shadow hierarchy that needs to express elevation.

---

*End of document. The single most actionable takeaway: the board looks flat
because elevated tiles aren't casting a clearly bigger shadow than the tiles
beneath them. Make the cast shadow grow with layer (§8.4, §9, §11, Appendix F)
and the pile "pops" into 3‑D without touching the art or the gameplay.*
