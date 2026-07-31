import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  lsGet, lsSet, lsRemove, lsNumber, lsInt, lsParse, lsSetJson,
  lsStringArray, lsNumberMap, isFiniteNumber, migrateLegacyStorage
} from './storage';

// A minimal in-memory localStorage, since these helpers exist precisely to
// survive a hostile one.
const installStorage = (impl?: Partial<Storage>) => {
  const store = new Map<string, string>();
  const base: Storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size; }
  };
  // Object.assign onto `base`, NOT `{ ...base }`: spreading evaluates the
  // `length` getter once and freezes it at 0, which silently made the migration
  // loop iterate zero times and "pass" nothing.
  vi.stubGlobal('localStorage', impl ? Object.assign(Object.create(base), impl) : base);
  return store;
};

beforeEach(() => { installStorage(); });
afterEach(() => { vi.unstubAllGlobals(); });

describe('storage: survives a throwing localStorage', () => {
  // Safari private mode and blocked site data throw on access rather than
  // returning null. Every helper has to absorb that.
  const throwing = () => {
    const boom = () => { throw new DOMException('denied', 'SecurityError'); };
    installStorage({ getItem: boom, setItem: boom, removeItem: boom });
  };

  it('reads fall back instead of propagating the throw', () => {
    throwing();
    expect(lsGet('k')).toBeNull();
    expect(lsNumber('k', 0.5, 0, 1)).toBe(0.5);
    expect(lsInt('k', 7, 1, 240)).toBe(7);
    expect(lsStringArray('k')).toEqual([]);
    expect(lsNumberMap('k')).toEqual({});
    expect(lsParse('k', () => 'x', 'fallback')).toBe('fallback');
  });

  it('writes are swallowed', () => {
    throwing();
    expect(() => lsSet('k', 'v')).not.toThrow();
    expect(() => lsSetJson('k', { a: 1 })).not.toThrow();
    expect(() => lsRemove('k')).not.toThrow();
  });
});

describe('lsNumber / lsInt', () => {
  it('returns the fallback for absent, non-numeric and non-finite values', () => {
    expect(lsNumber('missing', 0.3, 0, 1)).toBe(0.3);
    for (const bad of ['garbage', '', '   ', 'NaN', 'undefined', 'null', 'Infinity', '-Infinity']) {
      lsSet('v', bad);
      expect(lsNumber('v', 0.3, 0, 1), bad).toBe(0.3);
    }
  });

  it('clamps into range rather than trusting the stored value', () => {
    lsSet('v', '5');       expect(lsNumber('v', 0.5, 0, 1)).toBe(1);
    lsSet('v', '-3');      expect(lsNumber('v', 0.5, 0, 1)).toBe(0);
    lsSet('v', '0.25');    expect(lsNumber('v', 0.5, 0, 1)).toBe(0.25);
    lsSet('lvl', '99999'); expect(lsInt('lvl', 1, 1, 240)).toBe(240);
    lsSet('lvl', '0');     expect(lsInt('lvl', 1, 1, 240)).toBe(1);
  });

  it('parses integers in radix 10 (not octal/hex by prefix)', () => {
    lsSet('lvl', '08');  expect(lsInt('lvl', 1, 1, 240)).toBe(8);
    lsSet('lvl', '0x10'); expect(lsInt('lvl', 1, 1, 240)).toBe(1); // "0" then junk -> clamped up
    lsSet('lvl', '12.9'); expect(lsInt('lvl', 1, 1, 240)).toBe(12);
  });
});

describe('lsParse narrows instead of casting', () => {
  it('rejects a value the narrowing function refuses', () => {
    lsSet('k', '{"streak":"not a number"}');
    const out = lsParse<{ streak: number }>('k', v => {
      const d = v as Record<string, unknown>;
      return isFiniteNumber(d?.streak) ? { streak: d.streak } : null;
    }, { streak: 0 });
    expect(out).toEqual({ streak: 0 });
  });

  it('rejects malformed JSON without throwing', () => {
    lsSet('k', '{{{not json');
    expect(lsParse('k', () => 'accepted', 'fallback')).toBe('fallback');
  });

  it('accepts a value that passes', () => {
    lsSetJson('k', { streak: 4 });
    const out = lsParse<{ streak: number }>('k', v => {
      const d = v as Record<string, unknown>;
      return isFiniteNumber(d?.streak) ? { streak: d.streak } : null;
    }, { streak: 0 });
    expect(out).toEqual({ streak: 4 });
  });
});

describe('lsStringArray', () => {
  it('filters non-string entries rather than handing back a mixed array', () => {
    lsSet('a', '["x", 3, null, "y", {}]');
    expect(lsStringArray('a')).toEqual(['x', 'y']);
  });

  it('returns [] for a non-array, so .includes() is always safe', () => {
    // The real bug this guards: a stored object made `list.includes(id)` throw
    // and silently lose an achievement unlock.
    for (const bad of ['{}', '"str"', '42', 'null', 'true']) {
      lsSet('a', bad);
      expect(lsStringArray('a'), bad).toEqual([]);
      expect(() => lsStringArray('a').includes('x')).not.toThrow();
    }
  });
});

describe('lsNumberMap', () => {
  it('keeps only finite numeric entries', () => {
    lsSet('m', '{"Garden":3,"Pagoda":"2","Turtle":null,"Butterfly":1.5}');
    expect(lsNumberMap('m')).toEqual({ Garden: 3, Butterfly: 1.5 });
  });

  it('returns {} for arrays and scalars', () => {
    for (const bad of ['[1,2]', '"s"', '7', 'null']) {
      lsSet('m', bad);
      expect(lsNumberMap('m'), bad).toEqual({});
    }
  });

  it('never yields NaN, which would read as "no boosters left" forever', () => {
    lsSet('m', '{"hint":"abc","undo":5}');
    const m = lsNumberMap('m');
    expect(m.hint).toBeUndefined();
    expect(m.undo).toBe(5);
    expect(Object.values(m).every(Number.isFinite)).toBe(true);
  });
});

describe('isFiniteNumber', () => {
  it('accepts only finite numbers', () => {
    expect(isFiniteNumber(0)).toBe(true);
    expect(isFiniteNumber(-1.5)).toBe(true);
    for (const bad of [NaN, Infinity, -Infinity, '1', null, undefined, {}, []]) {
      expect(isFiniteNumber(bad)).toBe(false);
    }
  });
});

describe('legacy vita_* migration', () => {
  // The rename from Vita Mahjong to Skyjong changed every storage key's prefix.
  // Without this, an existing player reopens the app reset to level 1 with no
  // achievements, no records and no saved game.
  const seedLegacy = (entries: Record<string, string>) => {
    for (const [k, v] of Object.entries(entries)) lsSet(k, v);
  };

  it('copies every legacy key onto the new prefix', () => {
    seedLegacy({
      vita_current_level: '87',
      vita_max_unlocked_level: '120',
      vita_achievements: '["zen_beginner","speedy_thinker"]',
      vita_records: '{"87":{"iq":190,"time":95,"stars":3}}',
      vita_daily: '{"lastCompleted":"2026-07-29","streak":4}',
      vita_sfx_vol: '0.8'
    });
    migrateLegacyStorage();
    expect(lsGet('skyjong_current_level')).toBe('87');
    expect(lsGet('skyjong_max_unlocked_level')).toBe('120');
    expect(lsGet('skyjong_achievements')).toBe('["zen_beginner","speedy_thinker"]');
    expect(lsGet('skyjong_records')).toBe('{"87":{"iq":190,"time":95,"stars":3}}');
    expect(lsGet('skyjong_daily')).toBe('{"lastCompleted":"2026-07-29","streak":4}');
    expect(lsGet('skyjong_sfx_vol')).toBe('0.8');
  });

  it('migrates keys it was never told about', () => {
    // Enumerating the prefix, not a hardcoded list, is what makes a key added
    // later (or one only one edition has) safe.
    seedLegacy({ vita_some_future_key: 'kept' });
    migrateLegacyStorage();
    expect(lsGet('skyjong_some_future_key')).toBe('kept');
  });

  it('leaves the legacy copy in place so a rollback still finds its data', () => {
    seedLegacy({ vita_current_level: '42' });
    migrateLegacyStorage();
    expect(lsGet('vita_current_level')).toBe('42');
  });

  it('never overwrites data already under the new prefix', () => {
    seedLegacy({ vita_current_level: '5' });
    lsSet('skyjong_current_level', '99');
    migrateLegacyStorage();
    expect(lsGet('skyjong_current_level'), 'newer progress wins').toBe('99');
  });

  it('runs once — a later legacy write cannot resurrect stale progress', () => {
    seedLegacy({ vita_current_level: '10' });
    migrateLegacyStorage();
    expect(lsGet('skyjong_current_level')).toBe('10');
    // Player advances, then something writes the old key again.
    lsSet('skyjong_current_level', '55');
    lsSet('vita_current_level', '10');
    migrateLegacyStorage();
    expect(lsGet('skyjong_current_level'), 'must not roll back to 10').toBe('55');
  });

  it('is a no-op for a fresh install', () => {
    migrateLegacyStorage();
    expect(lsGet('skyjong_current_level')).toBeNull();
  });

  it('survives a throwing localStorage', () => {
    const boom = () => { throw new DOMException('denied', 'SecurityError'); };
    vi.stubGlobal('localStorage', { getItem: boom, setItem: boom, removeItem: boom, key: boom, length: 0, clear: boom });
    expect(() => migrateLegacyStorage()).not.toThrow();
  });
});
