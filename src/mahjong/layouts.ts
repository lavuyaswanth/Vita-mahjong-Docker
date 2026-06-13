// Predefined Symmetrical Layouts for Vita Mahjong Solitaire
// Coordinate system:
//   x, y are in HALF-TILE grid units (a tile spans 2 units on each axis).
//   z is the layer / elevation (0 = table, up to 4 = top).
//
// The board renderer auto-fits the bounding box to the viewport and, in
// portrait, transposes x<->y. We therefore author every layout LANDSCAPE-wide
// (x is the long axis) so it becomes a tall, dense pile on a phone in portrait.
//
// Every layout here is a DEEP, DENSE pyramid pile: multiple stacked layers,
// each inset and offset by a half tile so upper tiles straddle the seams of the
// ones below — the classic, instantly-readable 3-D Mahjong "pile" look.

export interface TileCoords {
  x: number;
  y: number;
  z: number;
  id: string;
}

export type LayoutName = 'Garden' | 'Pagoda' | 'Pyramids' | 'Butterfly' | 'Turtle';

export interface LayoutConfig {
  name: LayoutName;
  displayName: string;
  description: string;
  coords: { x: number; y: number; z: number }[];
}

// Two footprints overlap iff their centers are closer than a full tile on both
// axes. Simple, fast, and exactly right for the 2-unit tile.
export function overlaps(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  return Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2;
}

// A single stacked layer: a centered grid of (2*hx+1) x (2*hy+1) tiles. Odd
// layers are nudged by a half tile (offsets dx/dy) so they straddle the seams
// of the layer beneath — that half-tile offset is what produces the authentic
// overlapping 3-D brickwork instead of a flat, blocky stack.
interface LayerSpec {
  hx: number; // half-extent in x (number of tiles each side of center)
  hy: number; // half-extent in y
  dx?: number; // half-tile offset in x for this layer (0 or 1)
  dy?: number; // half-tile offset in y
}

// Build a dense pyramid pile from a list of layer specs (z = index).
function buildPile(center: { x: number; y: number }, layers: LayerSpec[]): { x: number; y: number; z: number }[] {
  const list: { x: number; y: number; z: number }[] = [];

  layers.forEach((layer, z) => {
    // Default straddle offset alternates per layer so each layer sits on the
    // seams of the one below; specs can override for organic silhouettes.
    const offX = layer.dx ?? (z % 2);
    const offY = layer.dy ?? (z % 2);

    for (let cx = -layer.hx; cx <= layer.hx; cx++) {
      for (let cy = -layer.hy; cy <= layer.hy; cy++) {
        list.push({
          x: center.x + cx * 2 + offX,
          y: center.y + cy * 2 + offY,
          z
        });
      }
    }
  });

  // Tiles are removed in pairs, so the count MUST be even. If a pile comes out
  // odd, drop the last top-layer tile (a small corner of the cap) to balance it.
  if (list.length % 2 === 1) list.pop();

  return list;
}

// All piles share a common center so they stay framed nicely after transpose.
const CENTER = { x: 13, y: 8 };

// 🌿 Zen Garden (Level 1) — a gentle but real 3-layer pile (~52 tiles).
function generateGarden() {
  return buildPile(CENTER, [
    { hx: 3, hy: 2 },
    { hx: 2, hy: 1 },
    { hx: 1, hy: 0 }
  ]);
}

// 🏯 Jade Pagoda (Level 2) — a taller stacked tower (~70 tiles).
function generatePagoda() {
  return buildPile(CENTER, [
    { hx: 3, hy: 2 },
    { hx: 2, hy: 2 },
    { hx: 1, hy: 1 },
    { hx: 0, hy: 0 }
  ]);
}

// 🔺 Twin Pyramids (Level 3) — a broad, steep 4-layer pyramid (~98 tiles).
function generatePyramids() {
  return buildPile(CENTER, [
    { hx: 4, hy: 2 },
    { hx: 3, hy: 2 },
    { hx: 2, hy: 1 },
    { hx: 1, hy: 0 }
  ]);
}

// 🦋 Flying Papillon (Level 4) — wide base with a clustered core (~122 tiles).
function generateButterfly() {
  return buildPile(CENTER, [
    { hx: 4, hy: 3 },
    { hx: 3, hy: 2 },
    { hx: 2, hy: 1 },
    { hx: 1, hy: 1 }
  ]);
}

// 🐢 Golden Turtle (Level 5) — the legendary deep 5-layer dome (~132 tiles).
function generateTurtle() {
  return buildPile(CENTER, [
    { hx: 4, hy: 3 },
    { hx: 3, hy: 2 },
    { hx: 2, hy: 2 },
    { hx: 1, hy: 1 },
    { hx: 0, hy: 0 }
  ]);
}

// Master Layout Registry — ordered by level (1→5), gentle → deep pile.
// Registry order MUST match getLevelNum() in App.tsx and the Settings level list.
export const layouts: Record<LayoutName, LayoutConfig> = {
  Garden: {
    name: 'Garden',
    displayName: '🌲 Enchanted Grove',
    description: 'A misty grove to begin your quest — three gentle layers, big easy-to-read tiles.',
    coords: generateGarden()
  },
  Pagoda: {
    name: 'Pagoda',
    displayName: '🏰 Castle Keep',
    description: 'A four-layer tower rising toward the centre — a step deeper into the realm.',
    coords: generatePagoda()
  },
  Pyramids: {
    name: 'Pyramids',
    displayName: '⚔️ Ancient Crypt',
    description: 'A broad, steep stone pyramid — plenty of free flanks but a deep ancient core.',
    coords: generatePyramids()
  },
  Butterfly: {
    name: 'Butterfly',
    displayName: '🐉 Dragon Lair',
    description: 'A wide sprawling lair crowned by a clustered hoard. Balanced and perilous.',
    coords: generateButterfly()
  },
  Turtle: {
    name: 'Turtle',
    displayName: '👑 Throne of Legends',
    description: 'The legendary deep throne-dome — the biggest, deepest pile and the ultimate test of skill.',
    coords: generateTurtle()
  }
};
