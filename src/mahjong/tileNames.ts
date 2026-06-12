// Human-friendly names for each tile face (Midnight Edition) — used for
// screen-reader labels and the high-contrast name tags.

const TILE_NAMES: Record<string, string[]> = {
  bamboo: ['Dracula', 'Werewolf', 'Frankenstein', 'Mummy', 'Zombie', 'Ghost', 'Witch', 'Reaper', 'Skeleton'],
  circle: ['Potion', 'Crystal Ball', 'Spell Book', 'Cauldron', 'Coffin', 'Candle', 'Amulet', 'Dagger', 'Hourglass'],
  character: ['Castle', 'Full Moon', 'Tombstone', 'Dead Tree', 'Haunted House', 'Bat', 'Spider', 'Raven', 'Black Cat'],
  wind: ['Storm', 'Blood Moon', 'Fog', 'Eclipse'],
  dragon: ['Demon', 'Gargoyle', 'Cursed Crown'],
  season: ['New Moon', 'Crescent Moon', 'Half Moon', 'Harvest Moon'],
  flower: ['Black Rose', 'Nightshade', 'Flytrap', 'Toadstool']
};

export function tileDisplayName(type: string, value: number): string {
  const names = TILE_NAMES[type];
  if (!names) return `${type} ${value}`;
  // Suits are 1-indexed; winds/dragons/seasons/flowers are 0-indexed
  const idx = (type === 'bamboo' || type === 'circle' || type === 'character') ? value - 1 : value;
  return names[idx] ?? `${type} ${value}`;
}
