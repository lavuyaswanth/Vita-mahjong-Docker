// Realms — visual "worlds" the campaign journeys through. Each realm reskins the
// same 42 tile slots (art in src/assets/tiles/<id>/) plus a menu background and a
// board felt/particle palette. The engine is identical across realms.

import menuLegends from '../assets/menu_bg.png';
import menuFrost from '../assets/menu_bg_frost.png';
import menuDesert from '../assets/menu_bg_desert.png';
import menuSeas from '../assets/menu_bg_seas.png';
import menuInferno from '../assets/menu_bg_inferno.png';
import menuForest from '../assets/menu_bg_forest.png';
import menuCelestial from '../assets/menu_bg_celestial.png';

export type RealmId = 'legends' | 'frost' | 'desert' | 'seas' | 'inferno' | 'forest' | 'celestial';

export interface Realm {
  id: RealmId;
  name: string;
  menuBg: string;
  // Maps to the board particle palette already implemented in MahjongBoard
  particleTheme: 'dark' | 'ocean' | 'sunset' | 'zen';
}

export const realms: Record<RealmId, Realm> = {
  legends:   { id: 'legends',   name: 'Gothic Legends',          menuBg: menuLegends,   particleTheme: 'dark' },
  frost:     { id: 'frost',     name: 'Frozen North',            menuBg: menuFrost,     particleTheme: 'ocean' },
  desert:    { id: 'desert',    name: 'Desert of the Pharaohs',  menuBg: menuDesert,    particleTheme: 'sunset' },
  seas:      { id: 'seas',      name: 'Cursed Seas',             menuBg: menuSeas,      particleTheme: 'ocean' },
  inferno:   { id: 'inferno',   name: 'Infernal Depths',         menuBg: menuInferno,   particleTheme: 'sunset' },
  forest:    { id: 'forest',    name: 'Enchanted Forest',        menuBg: menuForest,    particleTheme: 'zen' },
  celestial: { id: 'celestial', name: 'Celestial Realm',         menuBg: menuCelestial, particleTheme: 'dark' }
};

// Campaign rotation: a new realm every 10 levels, cycling in order — so the
// player journeys legends -> frost -> desert -> seas -> inferno -> forest ->
// celestial -> legends ... across the 240-level campaign.
const ROTATION: RealmId[] = ['legends', 'frost', 'desert', 'seas', 'inferno', 'forest', 'celestial'];
const LEVELS_PER_REALM = 10;

export function realmForLevel(level: number): Realm {
  const band = Math.floor((Math.max(1, level) - 1) / LEVELS_PER_REALM);
  return realms[ROTATION[band % ROTATION.length]];
}
