// Predefined Symmetrical Layouts for Vita Mahjong Solitaire
// Coordinate system:
// Width of tile is 2 grid units, Height of tile is 2 grid units.
// Layer is 'z' (0 = bottom, up to 4 = top).
// Coordinates are grid offsets.

export interface TileCoords {
  x: number;
  y: number;
  z: number;
  id: string;
}

export type LayoutName = 'Turtle' | 'Castle' | 'Pyramids' | 'Butterfly' | 'Cat';

export interface LayoutConfig {
  name: LayoutName;
  displayName: string;
  description: string;
  coords: { x: number; y: number; z: number }[];
}

// Helper to check overlaps in grid units
export function overlaps(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  return Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2;
}

// Generator for Turtle Layout (144 tiles)
function generateTurtle(): { x: number; y: number; z: number }[] {
  const list: { x: number; y: number; z: number }[] = [];

  // LAYER 0 (Bottom - 88 tiles)
  // Standard grid: x in [2 .. 24] (even), y in [2 .. 14] (even)
  const layer0 = [
    // Center rows
    { r: 2, cols: [6, 8, 10, 12, 14, 16, 18, 20] },
    { r: 4, cols: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22] },
    { r: 6, cols: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22] },
    { r: 8, cols: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24] }, // Extended row
    { r: 10, cols: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22] },
    { r: 12, cols: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22] },
    { r: 14, cols: [6, 8, 10, 12, 14, 16, 18, 20] }
  ];

  layer0.forEach(row => {
    row.cols.forEach(col => {
      list.push({ x: col, y: row.r, z: 0 });
    });
  });

  // Outliers on Left & Right wings at Layer 0 (classic Mahjong wings)
  list.push({ x: 0, y: 8, z: 0 });  // Left-most extension
  list.push({ x: 26, y: 8, z: 0 }); // Right-most extension

  // LAYER 1 (Second level - 36 tiles)
  const layer1 = [
    { r: 4, cols: [6, 8, 10, 12, 14, 16, 18, 20] },
    { r: 6, cols: [8, 10, 12, 14, 16, 18] },
    { r: 8, cols: [8, 10, 12, 14, 16, 18] },
    { r: 10, cols: [8, 10, 12, 14, 16, 18] },
    { r: 12, cols: [6, 8, 10, 12, 14, 16, 18, 20] }
  ];

  layer1.forEach(row => {
    row.cols.forEach(col => {
      list.push({ x: col, y: row.r, z: 1 });
    });
  });

  // LAYER 2 (Third level - 16 tiles)
  // Trim corners to make it rounder
  list.push({ x: 10, y: 6, z: 2 }); list.push({ x: 12, y: 6, z: 2 }); list.push({ x: 14, y: 6, z: 2 }); list.push({ x: 16, y: 6, z: 2 });
  list.push({ x: 10, y: 8, z: 2 }); list.push({ x: 12, y: 8, z: 2 }); list.push({ x: 14, y: 8, z: 2 }); list.push({ x: 16, y: 8, z: 2 });
  list.push({ x: 10, y: 10, z: 2 }); list.push({ x: 12, y: 10, z: 2 }); list.push({ x: 14, y: 10, z: 2 }); list.push({ x: 16, y: 10, z: 2 });
  list.push({ x: 12, y: 4, z: 2 }); list.push({ x: 14, y: 4, z: 2 });
  list.push({ x: 12, y: 12, z: 2 }); list.push({ x: 14, y: 12, z: 2 });

  // LAYER 3 (Fourth level - 4 tiles)
  list.push({ x: 12, y: 7, z: 3 });
  list.push({ x: 14, y: 7, z: 3 });
  list.push({ x: 12, y: 9, z: 3 });
  list.push({ x: 14, y: 9, z: 3 });

  // LAYER 4 (Top Cap - 1 tile)
  // Perfectly center overlap
  list.push({ x: 13, y: 8, z: 4 });

  return list;
}

// Generator for Castle Layout (80 tiles)
function generateCastle(): { x: number; y: number; z: number }[] {
  const list: { x: number; y: number; z: number }[] = [];

  // Bottom Layer (Foundation)
  // Outer castle wall and inner square
  for (let x = 4; x <= 22; x += 2) {
    list.push({ x, y: 2, z: 0 });
    list.push({ x, y: 14, z: 0 });
  }
  for (let y = 4; y <= 12; y += 2) {
    list.push({ x: 4, y, z: 0 });
    list.push({ x: 22, y, z: 0 });
  }
  // Inside rooms
  list.push({ x: 8, y: 6, z: 0 });
  list.push({ x: 10, y: 6, z: 0 });
  list.push({ x: 16, y: 6, z: 0 });
  list.push({ x: 18, y: 6, z: 0 });
  list.push({ x: 8, y: 10, z: 0 });
  list.push({ x: 10, y: 10, z: 0 });
  list.push({ x: 16, y: 10, z: 0 });
  list.push({ x: 18, y: 10, z: 0 });

  // Level 1: Middle columns and central fort
  const midCols = [6, 12, 14, 20];
  midCols.forEach(col => {
    list.push({ x: col, y: 4, z: 1 });
    list.push({ x: col, y: 8, z: 1 });
    list.push({ x: col, y: 12, z: 1 });
  });
  list.push({ x: 10, y: 8, z: 1 });
  list.push({ x: 16, y: 8, z: 1 });

  // Level 2: Towers and arches
  list.push({ x: 6, y: 4, z: 2 });
  list.push({ x: 20, y: 4, z: 2 });
  list.push({ x: 6, y: 12, z: 2 });
  list.push({ x: 20, y: 12, z: 2 });

  list.push({ x: 12, y: 8, z: 2 });
  list.push({ x: 14, y: 8, z: 2 });

  // Level 3: Turrets
  list.push({ x: 6, y: 4, z: 3 });
  list.push({ x: 20, y: 4, z: 3 });
  list.push({ x: 6, y: 12, z: 3 });
  list.push({ x: 20, y: 12, z: 3 });
  list.push({ x: 13, y: 8, z: 3 });

  return list;
}

// Generator for Pyramids Layout (64 tiles)
function generatePyramids(): { x: number; y: number; z: number }[] {
  const list: { x: number; y: number; z: number }[] = [];

  // Left Pyramid (z: 0 to 3)
  // Layer 0: 4x4 base (16 tiles) centered at x=8, y=8
  for (let x = 5; x <= 11; x += 2) {
    for (let y = 5; y <= 11; y += 2) {
      list.push({ x, y, z: 0 });
    }
  }
  // Layer 1: 3x3 base (9 tiles)
  for (let x = 6; x <= 10; x += 2) {
    for (let y = 6; y <= 10; y += 2) {
      list.push({ x, y, z: 1 });
    }
  }
  // Layer 2: 2x2 base (4 tiles)
  list.push({ x: 7, y: 7, z: 2 });
  list.push({ x: 9, y: 7, z: 2 });
  list.push({ x: 7, y: 9, z: 2 });
  list.push({ x: 9, y: 9, z: 2 });
  // Layer 3: Cap (1 tile)
  list.push({ x: 8, y: 8, z: 3 });

  // Right Pyramid (z: 0 to 3)
  // Layer 0: 4x4 base (16 tiles) centered at x=18, y=8
  for (let x = 15; x <= 21; x += 2) {
    for (let y = 5; y <= 11; y += 2) {
      list.push({ x, y, z: 0 });
    }
  }
  // Layer 1: 3x3 base (9 tiles)
  for (let x = 16; x <= 20; x += 2) {
    for (let y = 6; y <= 10; y += 2) {
      list.push({ x, y, z: 1 });
    }
  }
  // Layer 2: 2x2 base (4 tiles)
  list.push({ x: 17, y: 7, z: 2 });
  list.push({ x: 19, y: 7, z: 2 });
  list.push({ x: 17, y: 9, z: 2 });
  list.push({ x: 19, y: 9, z: 2 });
  // Layer 3: Cap (1 tile)
  list.push({ x: 18, y: 8, z: 3 });

  // Connective bridge at bottom
  list.push({ x: 13, y: 8, z: 0 });
  list.push({ x: 13, y: 6, z: 0 });

  return list;
}

// Generator for Butterfly Layout (96 tiles)
function generateButterfly(): { x: number; y: number; z: number }[] {
  const list: { x: number; y: number; z: number }[] = [];

  // Left wing and Right wing (symmetric on x-axis around 13)
  const leftWing = [
    // Outer butterfly wings shape
    { r: 2, cols: [4, 6] },
    { r: 4, cols: [2, 4, 6, 8] },
    { r: 6, cols: [2, 4, 6, 8, 10] },
    { r: 8, cols: [4, 6, 8, 10, 12] },
    { r: 10, cols: [2, 4, 6, 8, 10] },
    { r: 12, cols: [2, 4, 6, 8] },
    { r: 14, cols: [4, 6] }
  ];

  // Layer 0: Flat base wings
  leftWing.forEach(row => {
    row.cols.forEach(col => {
      // Left side
      list.push({ x: col, y: row.r, z: 0 });
      // Right side (symmetrical reflection)
      const reflectedX = 26 - col;
      list.push({ x: reflectedX, y: row.r, z: 0 });
    });
  });

  // Center spine/body (z=0, 1, 2)
  list.push({ x: 13, y: 4, z: 0 });
  list.push({ x: 13, y: 6, z: 0 });
  list.push({ x: 13, y: 8, z: 0 });
  list.push({ x: 13, y: 10, z: 0 });
  list.push({ x: 13, y: 12, z: 0 });

  // Layer 1: Intermediate layer on body and wings
  const wingL1 = [
    { r: 4, cols: [4, 6] },
    { r: 6, cols: [6, 8] },
    { r: 8, cols: [8, 10] },
    { r: 10, cols: [6, 8] },
    { r: 12, cols: [4, 6] }
  ];

  wingL1.forEach(row => {
    row.cols.forEach(col => {
      list.push({ x: col, y: row.r, z: 1 });
      list.push({ x: 26 - col, y: row.r, z: 1 });
    });
  });

  // Spine L1 and L2
  list.push({ x: 13, y: 6, z: 1 });
  list.push({ x: 13, y: 8, z: 1 });
  list.push({ x: 13, y: 10, z: 1 });

  list.push({ x: 13, y: 8, z: 2 });

  return list;
}

// Generator for Cat Layout (72 tiles)
function generateCat(): { x: number; y: number; z: number }[] {
  const list: { x: number; y: number; z: number }[] = [];

  // Let's build a cute cat face outline!
  // Ears
  list.push({ x: 4, y: 2, z: 0 });
  list.push({ x: 6, y: 4, z: 0 });
  list.push({ x: 20, y: 4, z: 0 });
  list.push({ x: 22, y: 2, z: 0 });

  // Face base outline (symmetrical)
  for (let x = 6; x <= 20; x += 2) {
    list.push({ x, y: 6, z: 0 });
    list.push({ x, y: 12, z: 0 });
  }
  for (let y = 8; y <= 10; y += 2) {
    list.push({ x: 4, y, z: 0 });
    list.push({ x: 22, y, z: 0 });
    list.push({ x: 6, y, z: 0 });
    list.push({ x: 20, y, z: 0 });
  }

  // Cheeks and Chin (Inside face)
  const innerFace = [
    { r: 8, cols: [8, 10, 12, 14, 16, 18] },
    { r: 10, cols: [8, 10, 12, 14, 16, 18] }
  ];
  innerFace.forEach(row => {
    row.cols.forEach(col => {
      list.push({ x: col, y: row.r, z: 0 });
    });
  });

  // Layer 1: Nose, eyes, and brow elevation
  // Eyes
  list.push({ x: 8, y: 6, z: 1 });
  list.push({ x: 18, y: 6, z: 1 });
  // Cheeks
  list.push({ x: 8, y: 8, z: 1 });
  list.push({ x: 18, y: 8, z: 1 });
  // Bridge of Nose
  list.push({ x: 12, y: 8, z: 1 });
  list.push({ x: 14, y: 8, z: 1 });
  list.push({ x: 12, y: 10, z: 1 });
  list.push({ x: 14, y: 10, z: 1 });

  // Layer 2: Elevated snout / Whiskers base
  list.push({ x: 13, y: 9, z: 2 });
  list.push({ x: 11, y: 9, z: 2 });
  list.push({ x: 15, y: 9, z: 2 });

  return list;
}

// Master Layout Registry
export const layouts: Record<LayoutName, LayoutConfig> = {
  Turtle: {
    name: 'Turtle',
    displayName: '🐢 Golden Turtle',
    description: 'The ancient, legendary 144-tile classic configuration. A standard layout that challenges your patience and strategy.',
    coords: generateTurtle()
  },
  Castle: {
    name: 'Castle',
    displayName: '🏰 Zen Fortress',
    description: 'An architectural 80-tile set featuring thick walls, four tall corner watchtowers, and a central elevated keep.',
    coords: generateCastle()
  },
  Pyramids: {
    name: 'Pyramids',
    displayName: '🔺 Twin Pyramids',
    description: 'A 64-tile set representing two step-pyramids standing side by side, connected at the baseline by a zen path.',
    coords: generatePyramids()
  },
  Butterfly: {
    name: 'Butterfly',
    displayName: '🦋 Flying Papillon',
    description: 'A beautifully balanced 96-tile layout representing wings spread wide. Plenty of free lateral tiles, but a very dense body.',
    coords: generateButterfly()
  },
  Cat: {
    name: 'Cat',
    displayName: '🐱 Lucky Kitten',
    description: 'A delightful, senior-friendly 72-tile layout forming the shape of a cute cat head with raised ears and elevated cheeks.',
    coords: generateCat()
  }
};
