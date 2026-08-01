// Zen achievement definitions — single source of truth shared by the game
// screen (unlock toasts) and the main-menu Trophy Room.

interface AchievementDef {
  id: string;
  name: string;
  desc: string;
}

export const achievementsList: AchievementDef[] = [
  { id: 'zen_beginner', name: 'Zen Sprout', desc: 'Complete your first puzzle to begin your journey.' },
  { id: 'combo_master', name: 'Combo Catalyst', desc: 'Attain a x5 combo streak by matching tiles within 3 seconds.' },
  { id: 'speedy_thinker', name: 'Speedy Mind', desc: 'Solve any layout in under 3 minutes.' },
  { id: 'mindful_path', name: 'Mindful Path', desc: 'Clear a full layout without using a Hint or Shuffle.' },
  // The unlock needs all 5 boards, but the campaign rotates only the two gentle
  // ones (see LAYOUT_CYCLE) — the rest are reachable solely through the settings
  // board picker. Without naming that, this is the badge most likely to sit
  // locked forever because nothing tells the player where the other boards are.
  { id: 'trophy_collector', name: 'Zen Master', desc: 'Solve all 5 board shapes — choose the bigger ones from Settings.' }
];
