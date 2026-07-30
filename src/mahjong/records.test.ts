import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { loadRecords, recordFor, mergeRecord } from './records';

const installStorage = () => {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => store.clear(),
    key: () => null,
    length: 0
  });
  return store;
};

let store: Map<string, string>;
beforeEach(() => { store = installStorage(); });
afterEach(() => { vi.unstubAllGlobals(); });

describe('loadRecords', () => {
  it('drops partial or corrupt entries instead of repairing them', () => {
    store.set('vita_records', JSON.stringify({
      '1': { iq: 150, time: 90, stars: 3 },
      '2': { iq: 120, time: 200 },              // missing stars
      '3': { iq: 'x', time: 10, stars: 1 },     // non-numeric iq
      '4': null,
      '5': { iq: 130, time: 50, stars: 2 }
    }));
    expect(loadRecords()).toEqual({
      '1': { iq: 150, time: 90, stars: 3 },
      '5': { iq: 130, time: 50, stars: 2 }
    });
  });

  it('returns {} for absent and malformed storage', () => {
    expect(loadRecords()).toEqual({});
    store.set('vita_records', '{{{');
    expect(loadRecords()).toEqual({});
    store.set('vita_records', '[]');
    expect(loadRecords()).toEqual({});
  });
});

describe('mergeRecord', () => {
  it('treats a first clear as a new best', () => {
    const { merged, isNewBest } = mergeRecord(7, { iq: 140, time: 100, stars: 2 });
    expect(isNewBest).toBe(true);
    expect(merged).toEqual({ iq: 140, time: 100, stars: 2 });
    expect(recordFor(7)).toEqual({ iq: 140, time: 100, stars: 2 });
  });

  it('tracks each axis independently — a faster sloppy run keeps the better IQ', () => {
    mergeRecord(7, { iq: 190, time: 300, stars: 3 });
    const { merged } = mergeRecord(7, { iq: 110, time: 80, stars: 1 });
    expect(merged).toEqual({ iq: 190, stars: 3, time: 80 });
  });

  it('does not flag a strictly worse run as a new best', () => {
    mergeRecord(7, { iq: 190, time: 100, stars: 3 });
    expect(mergeRecord(7, { iq: 120, time: 400, stars: 1 }).isNewBest).toBe(false);
  });

  it('flags a tie on IQ broken by a faster time', () => {
    mergeRecord(7, { iq: 150, time: 200, stars: 2 });
    expect(mergeRecord(7, { iq: 150, time: 199, stars: 2 }).isNewBest).toBe(true);
    // ...but not a tie on IQ with a slower time
    expect(mergeRecord(7, { iq: 150, time: 500, stars: 2 }).isNewBest).toBe(false);
  });

  it('flags more stars as a new best even at lower IQ', () => {
    mergeRecord(7, { iq: 180, time: 100, stars: 1 });
    expect(mergeRecord(7, { iq: 130, time: 100, stars: 3 }).isNewBest).toBe(true);
  });

  it('keeps records for other levels intact', () => {
    mergeRecord(1, { iq: 100, time: 10, stars: 1 });
    mergeRecord(2, { iq: 200, time: 20, stars: 3 });
    expect(recordFor(1)).toEqual({ iq: 100, time: 10, stars: 1 });
    expect(recordFor(2)).toEqual({ iq: 200, time: 20, stars: 3 });
  });

  it('recordFor returns null for a level never cleared', () => {
    expect(recordFor(99)).toBeNull();
  });

  it('a corrupt existing record does not block a new best being recorded', () => {
    store.set('vita_records', JSON.stringify({ '5': { iq: 'bad' } }));
    const { isNewBest, merged } = mergeRecord(5, { iq: 140, time: 60, stars: 2 });
    expect(isNewBest).toBe(true);
    expect(merged).toEqual({ iq: 140, time: 60, stars: 2 });
  });
});
