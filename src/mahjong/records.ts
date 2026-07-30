import { lsParse, lsSetJson, isFiniteNumber } from './storage';

const RECORDS_KEY = 'vita_records';

/** A player's best result on one campaign level — the reason to replay a board. */
export type LevelRecord = { iq: number; time: number; stars: number };

/**
 * All stored records, keyed by level.
 *
 * A partial or corrupt entry is dropped rather than repaired: letting NaN into
 * the "beat your best" comparison would make every later run silently fail to
 * register as a new best.
 */
export const loadRecords = (): Record<string, LevelRecord> =>
  lsParse<Record<string, LevelRecord>>(RECORDS_KEY, v => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
    const out: Record<string, LevelRecord> = {};
    for (const [level, rec] of Object.entries(v as Record<string, unknown>)) {
      if (!rec || typeof rec !== 'object') continue;
      const r = rec as Record<string, unknown>;
      if (isFiniteNumber(r.iq) && isFiniteNumber(r.time) && isFiniteNumber(r.stars)) {
        out[level] = { iq: r.iq, time: r.time, stars: r.stars };
      }
    }
    return out;
  }, {});

/** The stored best for one level, or null if it has never been cleared. */
export const recordFor = (level: number): LevelRecord | null =>
  loadRecords()[String(level)] ?? null;

/**
 * Merge a finished run into the stored best: highest IQ, most stars, fastest
 * time — each tracked independently, so a fast-but-sloppy run still improves the
 * time without dragging the IQ down. Returns the merged record and whether this
 * run beat the previous best on any axis.
 */
export const mergeRecord = (
  level: number,
  run: LevelRecord
): { merged: LevelRecord; isNewBest: boolean } => {
  const records = loadRecords();
  const prev = records[String(level)] ?? null;
  const isNewBest = !prev ||
    run.iq > prev.iq ||
    run.stars > prev.stars ||
    (run.iq === prev.iq && run.time < prev.time);
  const merged: LevelRecord = {
    iq: Math.max(run.iq, prev?.iq ?? 0),
    stars: Math.max(run.stars, prev?.stars ?? 0),
    time: prev ? Math.min(run.time, prev.time) : run.time
  };
  records[String(level)] = merged;
  lsSetJson(RECORDS_KEY, records);
  return { merged, isNewBest };
};
