// Every localStorage access in the app goes through this module.
//
// Two hazards it exists to contain:
//  1. Storage THROWS outright in Safari private mode and wherever a browser
//     blocks site data — an unguarded getItem takes the whole app down.
//  2. `JSON.parse` returns `any`, so a parsed value type-checks against
//     whatever you claim it is. `strict` does not help here: the unsoundness
//     comes from the lib signature, not from anything the compiler can see.
//     Storage is user-writable and survives across versions, so treat every
//     stored value as untrusted input and narrow it exactly once, here.

export const lsGet = (key: string): string | null => {
  try { return localStorage.getItem(key); } catch { return null; }
};

// ---- Legacy key migration (vita_* -> skyjong_*) ---------------------------
// The app was called Vita Mahjong, and every stored value was prefixed `vita_`:
// campaign level, unlocked levels, achievements, best records, the saved game,
// the daily streak and all settings. Renaming the prefix without moving the
// data would silently reset every existing player to level 1.
//
// So on first load after the rename, copy anything under the old prefix across.
// Deliberately:
//  - COPIES rather than moves, so rolling the release back finds its data intact
//  - never overwrites a key that already exists under the new prefix
//  - enumerates the prefix instead of listing key names, so a key added since
//    (or one only some editions have, like vita_daily) can't be forgotten
//  - runs once, guarded by a marker, so a later legacy write can't resurrect
//    stale values over real progress
const LEGACY_PREFIX = 'vita_';
const PREFIX = 'skyjong_';
const MIGRATION_MARKER = `${PREFIX}storage_migrated`;

export const migrateLegacyStorage = (): void => {
  try {
    if (localStorage.getItem(MIGRATION_MARKER) === 'true') return;
    // Snapshot the key names first: writing while walking by index reshuffles
    // the very list being walked.
    const legacyKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LEGACY_PREFIX)) legacyKeys.push(key);
    }
    for (const key of legacyKeys) {
      const renamed = PREFIX + key.slice(LEGACY_PREFIX.length);
      if (localStorage.getItem(renamed) !== null) continue; // new data wins
      const value = localStorage.getItem(key);
      if (value !== null) localStorage.setItem(renamed, value);
    }
    localStorage.setItem(MIGRATION_MARKER, 'true');
  } catch {
    // Storage unavailable (Safari private mode). Nothing to migrate, and the
    // marker stays unset so a later load with working storage still tries.
  }
};

// Run at module load: this file is the single entry point for storage, so
// importing it anywhere guarantees the migration happens before the first read.
migrateLegacyStorage();

export const lsSet = (key: string, value: string): void => {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
};

export const lsRemove = (key: string): void => {
  try { localStorage.removeItem(key); } catch { /* storage unavailable */ }
};

/** Finite number, clamped. A corrupt value yields `fallback`, never NaN. */
export const lsNumber = (key: string, fallback: number, min: number, max: number): number => {
  const raw = lsGet(key);
  // `Number('')` and `Number('   ')` are 0, not NaN — an empty stored value
  // would otherwise clamp to `min` and read as a deliberate zero. That silently
  // muted audio instead of falling back to the default volume.
  if (raw === null || raw.trim() === '') return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

/** As lsNumber, but integral (radix 10 — `parseInt` without one is a trap). */
export const lsInt = (key: string, fallback: number, min: number, max: number): number => {
  const raw = lsGet(key);
  if (raw === null) return fallback;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
};

/**
 * Parse a stored JSON value as `unknown` and hand it to `narrow`, which must
 * either return a well-typed value or null to reject it. Returning `unknown`
 * rather than `any` is the whole point: callers cannot skip the check.
 */
export const lsParse = <T>(key: string, narrow: (value: unknown) => T | null, fallback: T): T => {
  const raw = lsGet(key);
  if (raw === null) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    return narrow(parsed) ?? fallback;
  } catch {
    return fallback;
  }
};

export const lsSetJson = (key: string, value: unknown): void => {
  try { lsSet(key, JSON.stringify(value)); } catch { /* unserialisable */ }
};

// ---- Shared shapes -------------------------------------------------------

/** Array of strings, dropping any non-string entries. */
export const lsStringArray = (key: string): string[] =>
  lsParse<string[]>(key, v => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : null), []);

/** Record of finite numbers, dropping any entry that isn't one. */
export const lsNumberMap = (key: string): Record<string, number> =>
  lsParse<Record<string, number>>(key, v => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
    const out: Record<string, number> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (typeof val === 'number' && Number.isFinite(val)) out[k] = val;
    }
    return out;
  }, {});

/** True only for a finite number — the guard most stored scalars need. */
export const isFiniteNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);
