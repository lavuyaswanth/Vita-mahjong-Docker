import React, { useState, useEffect } from 'react';
import { formatTime } from '../mahjong/formatTime';

interface GameClockProps {
  // False when the run is over or the menu is up — the clock holds its value.
  running: boolean;
  // Seconds to start from; a resumed save continues from its elapsed time.
  // Read once per mount, so App remounts this via `key` to begin a new run.
  startAt: number;
  // Kept in step with every tick so the rest of the app can read the elapsed
  // time (saves, star ratings, best records) without re-rendering per second.
  elapsedRef: React.RefObject<number>;
}

/**
 * The stopwatch lives in its own component so its once-a-second state change
 * only re-renders this <span>. Held in App, each tick reconciled the whole
 * tree — including the ~130-element tile map — every single second.
 */
const GameClock: React.FC<GameClockProps> = ({ running, startAt, elapsedRef }) => {
  const [secs, setSecs] = useState(startAt);

  useEffect(() => {
    if (!running) return;
    // Background time shouldn't count against star ratings or best times
    // (phone calls, app switches), so ticks are skipped while hidden rather
    // than the interval being torn down and re-registered.
    let hidden = document.hidden;
    const onVisibility = () => { hidden = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);
    const id = setInterval(() => {
      if (hidden) return;
      setSecs(s => {
        const next = s + 1;
        elapsedRef.current = next;
        return next;
      });
    }, 1000);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [running, elapsedRef]);

  return (
    <span className="header-timer" aria-label={`Elapsed time ${formatTime(secs)}`}>
      {formatTime(secs)}
    </span>
  );
};

export default GameClock;
