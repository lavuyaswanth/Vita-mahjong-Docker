// Realms — visual "worlds" the campaign journeys through. Each realm reskins the
// same 42 tile slots (art in src/assets/tiles/<id>/) plus a menu background and a
// board felt/particle palette. The engine is identical across realms.

import menuLegends from '../assets/menu_bg.png';
import menuFrost from '../assets/menu_bg_frost.png';
import menuDesert from '../assets/menu_bg_desert.png';
import menuSeas from '../assets/menu_bg_seas.png';

export type RealmId = 'legends' | 'frost' | 'desert' | 'seas';

export interface Realm {
  id: RealmId;
  name: string;
  menuBg: string;
  // Maps to the board particle palette already implemented in MahjongBoard
  particleTheme: 'dark' | 'ocean' | 'sunset';
}

export const realms: Record<RealmId, Realm> = {
  legends: { id: 'legends', name: 'Gothic Legends',          menuBg: menuLegends, particleTheme: 'dark' },
  frost:   { id: 'frost',   name: 'Frozen North',            menuBg: menuFrost,   particleTheme: 'ocean' },
  desert:  { id: 'desert',  name: 'Desert of the Pharaohs',  menuBg: menuDesert,  particleTheme: 'sunset' },
  seas:    { id: 'seas',    name: 'Cursed Seas',             menuBg: menuSeas,    particleTheme: 'ocean' }
};

// Campaign rotation: a new realm every 10 levels, cycling in order. So levels
// 1-10 = Gothic Legends, 11-20 = Frozen North, 21-30 = Desert, 31-40 = Cursed
// Seas, 41-50 = Gothic Legends again, etc.
const ROTATION: RealmId[] = ['legends', 'frost', 'desert', 'seas'];
const LEVELS_PER_REALM = 10;

export function realmForLevel(level: number): Realm {
  const band = Math.floor((Math.max(1, level) - 1) / LEVELS_PER_REALM);
  return realms[ROTATION[band % ROTATION.length]];
}
