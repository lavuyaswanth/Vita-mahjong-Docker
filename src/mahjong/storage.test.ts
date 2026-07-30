import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  lsGet, lsSet, lsRemove, lsNumber, lsInt, lsParse, lsSetJson,
  lsStringArray, lsNumberMap, isFiniteNumber
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
  vi.stubGlobal('localStorage', { ...base, ...impl });
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
