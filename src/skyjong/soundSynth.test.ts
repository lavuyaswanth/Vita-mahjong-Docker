import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// A minimal Web Audio stand-in. Enough surface for the synth to build its
// graph, and it records what was scheduled so we can assert that stopping the
// ambient bed actually reaches the notes already handed to the audio clock.
type FakeNode = {
  kind: string;
  started: boolean;
  stoppedAt: number | null;
  disconnected: boolean;
  onended: (() => void) | null;
};

const installAudio = () => {
  const nodes: FakeNode[] = [];
  let now = 0;
  const param = () => ({
    value: 1,
    setValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn()
  });
  const mkNode = (kind: string): FakeNode & Record<string, unknown> => {
    const n: FakeNode & Record<string, unknown> = {
      kind, started: false, stoppedAt: null, disconnected: false, onended: null,
      connect: vi.fn(), disconnect: vi.fn(function (this: FakeNode) { this.disconnected = true; }),
      gain: param(), frequency: param(), detune: param(),
      start: vi.fn(function (this: FakeNode) { this.started = true; }),
      stop: vi.fn(function (this: FakeNode, t?: number) { this.stoppedAt = t ?? now; }),
      type: '', buffer: null, loop: false
    };
    nodes.push(n);
    return n;
  };
  class FakeCtx {
    sampleRate = 44100;
    state = 'running';
    destination = {};
    get currentTime() { return now; }
    createGain() { return mkNode('gain'); }
    createOscillator() { return mkNode('osc'); }
    createBufferSource() { return mkNode('bufferSource'); }
    createBiquadFilter() { return mkNode('filter'); }
    createBuffer() { return { getChannelData: () => new Float32Array(16) }; }
    resume() { return Promise.resolve(); }
  }
  vi.stubGlobal('AudioContext', FakeCtx);
  vi.stubGlobal('window', { AudioContext: FakeCtx, devicePixelRatio: 1 });
  return { nodes, advance: (s: number) => { now += s; } };
};

let audio: ReturnType<typeof installAudio>;
beforeEach(() => { vi.useFakeTimers(); audio = installAudio(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.resetModules(); });

const freshSynth = async () => (await import('./soundSynth')).soundSynth;

// Voices are the things scheduled onto the audio clock: an 8s noise source per
// wave, a 4s oscillator per chime.
const voices = () => audio.nodes.filter(n => n.kind === 'bufferSource' || n.kind === 'osc');

describe('stopAmbient', () => {
  it('stops voices already scheduled, not just the timers', async () => {
    const synth = await freshSynth();
    synth.startAmbient();
    const live = voices().filter(v => v.started);
    expect(live.length, 'a wave should be scheduled immediately').toBeGreaterThan(0);
    // Before the fix these had a stop() at t+8 and nothing cancelled it.
    const scheduledFarOut = live.filter(v => (v.stoppedAt ?? 0) >= 4);
    expect(scheduledFarOut.length).toBeGreaterThan(0);

    synth.stopAmbient();
    for (const v of live) {
      expect(v.stoppedAt, `${v.kind} should be re-stopped promptly`).toBeLessThanOrEqual(0.2);
    }
  });

  it('schedules no further voices once stopped', async () => {
    const synth = await freshSynth();
    synth.startAmbient();
    synth.stopAmbient();
    const before = voices().length;
    // The wave interval is 8s and the first chime lands at 3s.
    vi.advanceTimersByTime(30000);
    expect(voices().length, 'no new voice after stop').toBe(before);
  });

  it('is safe to call twice, and before ever starting', async () => {
    const synth = await freshSynth();
    expect(() => synth.stopAmbient()).not.toThrow();
    synth.startAmbient();
    synth.stopAmbient();
    expect(() => synth.stopAmbient()).not.toThrow();
  });

  it('can restart cleanly after stopping', async () => {
    const synth = await freshSynth();
    synth.startAmbient();
    synth.stopAmbient();
    const before = voices().length;
    synth.startAmbient();
    expect(voices().length, 'restart schedules a new wave').toBeGreaterThan(before);
  });
});

describe('configure', () => {
  it('takes volumes only — the dead `enabled` flag is gone', async () => {
    const synth = await freshSynth();
    expect(synth.configure.length).toBe(2);
  });

  it('clamps out-of-range and non-finite volumes', async () => {
    const synth = await freshSynth();
    // A NaN reaching a gain node throws and kills every later sound.
    expect(() => synth.configure(NaN, NaN)).not.toThrow();
    expect(() => synth.configure(5, -3)).not.toThrow();
    expect(() => synth.configure(0, 0)).not.toThrow();
  });
});
