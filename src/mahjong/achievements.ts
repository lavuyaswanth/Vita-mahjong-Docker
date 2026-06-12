// Zen achievement definitions — single source of truth shared by the game
// screen (unlock toasts) and the main-menu Trophy Room.

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
}

export const achievementsList: AchievementDef[] = [
  { id: 'zen_beginner', name: 'Zen Sprout', desc: 'Complete your first puzzle to begin your journey.' },
  { id: 'combo_master', name: 'Combo Catalyst', desc: 'Attain a x5 combo streak by matching tiles within 3 seconds.' },
  { id: 'speedy_thinker', name: 'Speedy Mind', desc: 'Solve any layout in under 3 minutes.' },
  { id: 'mindful_path', name: 'Mindful Path', desc: 'Clear a full layout without using a Hint or Shuffle.' },
  { id: 'trophy_collector', name: 'Zen Master', desc: 'Prove your dedication by solving all 5 board layouts.' }
];
