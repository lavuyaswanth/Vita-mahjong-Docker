// Elapsed seconds as MM:SS. Shared by the live header clock and the victory
// modal's frozen final time.
export const formatTime = (secs: number): string => {
  const safe = Number.isFinite(secs) && secs > 0 ? Math.floor(secs) : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
