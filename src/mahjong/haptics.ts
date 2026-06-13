// Subtle haptic feedback for touch devices. No-ops where unsupported (desktop,
// iOS Safari) so it's always safe to call. Kept short so it reads as a tactile
// "tick", never a buzz.

const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

function buzz(pattern: number | number[]): void {
  if (!canVibrate) return;
  try { navigator.vibrate(pattern); } catch { /* ignore */ }
}

export const haptics = {
  match: () => buzz(12),            // a pair cleared
  blocked: () => buzz(8),           // tapped a blocked tile
  combo: (mult: number) => buzz(Math.min(8 + mult * 3, 40)), // streak grows
  win: () => buzz([0, 40, 60, 40, 60, 90]),
  lose: () => buzz([0, 80, 50, 120])
};
