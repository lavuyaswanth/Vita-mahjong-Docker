// Midnight achievement definitions — single source of truth shared by the
// game screen (unlock toasts) and the main-menu Trophy Room.

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
}

export const achievementsList: AchievementDef[] = [
  { id: 'zen_beginner', name: 'Night Initiate', desc: 'Complete your first puzzle to join the creatures of the night.' },
  { id: 'combo_master', name: 'Monster Streak', desc: 'Attain a x5 combo streak by matching tiles within 3 seconds.' },
  { id: 'speedy_thinker', name: 'Lightning Reflexes', desc: 'Solve any layout in under 3 minutes.' },
  { id: 'mindful_path', name: 'Fearless Path', desc: 'Clear a full layout without using a Hint or Shuffle.' },
  { id: 'trophy_collector', name: 'Master of the Night', desc: 'Prove your power by conquering all 5 haunted layouts.' }
];
