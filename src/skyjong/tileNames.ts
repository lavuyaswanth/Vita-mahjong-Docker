// Human-friendly names for each tile face — used for screen-reader labels.

const TILE_NAMES: Record<string, string[]> = {
  bamboo: ['Panda', 'Fox', 'Bear', 'Lion', 'Rabbit', 'Cat', 'Elephant', 'Monkey', 'Frog'],
  circle: ['Lantern', 'Cherry Blossom', 'Gift Box', 'Camera', 'Watch', 'Coffee Mug', 'Umbrella', 'Book', 'Key'],
  character: ['Car', 'Helicopter', 'Train', 'Rocket', 'Bicycle', 'Airplane', 'Sailboat', 'Submarine', 'Tractor'],
  wind: ['Sun', 'Moon', 'Storm Cloud', 'Rainbow'],
  dragon: ['Dragon', 'Phoenix', 'Crown'],
  season: ['Tulip', 'Watermelon', 'Maple Leaf', 'Snowflake'],
  flower: ['Rose', 'Sunflower', 'Hibiscus', 'Daisy']
};

export function tileDisplayName(type: string, value: number): string {
  const names = TILE_NAMES[type];
  if (!names) return `${type} ${value}`;
  // Suits are 1-indexed; winds/dragons/seasons/flowers are 0-indexed
  const idx = (type === 'bamboo' || type === 'circle' || type === 'character') ? value - 1 : value;
  return names[idx] ?? `${type} ${value}`;
}
