import React, { useState, useEffect } from 'react';
import { formatTime } from '../skyjong/formatTime';

interface GameClockProps {
  // False when the run is over or the menu is up — the clock holds its value.
  running: boolean;
  // Seconds to start from; a resumed save continues from its elapsed time.
  // Read once per mount, so App remounts this via `key` to begin a new run.
  startAt: number;
  // Kept in step with every tick so the rest of the app can read the elapsed
  // time (saves, star ratings, best records) without re-rendering per second.
  elapsedRef: React.RefObject<number>;
  // Once the run has ended, the exact elapsed value the rest of the UI reports.
  // A pending tick can be mid-flush when the winning tap lands, leaving `secs`
  // one ahead of the value the victory modal and star rating were computed from;
  // rendering this instead makes the two agree by construction.
  freezeAt?: number | null;
}

/**
 * The stopwatch lives in its own component so its once-a-second state change
 * only re-renders this <span>. Held in App, each tick reconciled the whole
 * tree — including the ~130-element tile map — every single second.
 */
const GameClock: React.FC<GameClockProps> = ({ running, startAt, elapsedRef, freezeAt = null }) => {
  const [secs, setSecs] = useState(startAt);

  // Publish the tick to the shared ref from an effect, NOT from inside the
  // setSecs updater. React 19 StrictMode double-invokes updaters on purpose, so
  // an updater must stay a pure function of its argument — assigning in there
  // happens to be idempotent today, but stops being safe the moment the write
  // is anything other than a plain overwrite.
  useEffect(() => { elapsedRef.current = secs; }, [secs, elapsedRef]);

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
      setSecs(s => s + 1);
    }, 1000);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [running]);

  const shown = freezeAt ?? secs;
  return (
    <span className="header-timer" aria-label={`Elapsed time ${formatTime(shown)}`}>
      {formatTime(shown)}
    </span>
  );
};

export default GameClock;
