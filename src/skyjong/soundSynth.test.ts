import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// A minimal Web Audio stand-in. Enough surface for the synth to build its
// graph, and it records what was scheduled so we can assert that stopping the
// ambient bed actually reaches the notes already handed to the audio clock.
type FakeParam = {
  value: number;
  setValueAtTime: ReturnType<typeof vi.fn>;
  setTargetAtTime: ReturnType<typeof vi.fn>;
  linearRampToValueAtTime: ReturnType<typeof vi.fn>;
  exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
  cancelScheduledValues: ReturnType<typeof vi.fn>;
};

type FakeNode = {
  kind: string;
  started: boolean;
  stoppedAt: number | null;
  disconnected: boolean;
  onended: (() => void) | null;
  gain: FakeParam;
};

const installAudio = () => {
  const nodes: FakeNode[] = [];
  let now = 0;
  // Real AudioParam methods throw on a non-finite value, and that throw is what
  // kills every later sound in the app. A fake that quietly accepts NaN makes
  // "does it clamp?" untestable: the assertion passes whether or not the clamp
  // exists. So model the throw.
  const assertFinite = (v: number) => {
    if (!Number.isFinite(v)) {
      throw new TypeError(`non-finite AudioParam value: ${v}`);
    }
    return v;
  };
  const param = (): FakeParam => ({
    value: 1,
    setValueAtTime: vi.fn(assertFinite),
    setTargetAtTime: vi.fn(assertFinite),
    linearRampToValueAtTime: vi.fn(assertFinite),
    exponentialRampToValueAtTime: vi.fn(assertFinite),
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
  return {
    nodes,
    advance: (s: number) => { now += s; },
    /**
     * The synth's routing gain PARAMS, by the order init() builds them:
     * master -> sfx -> ambient. They are the first three gain nodes to exist,
     * created before any sound node, so creation order identifies them without
     * the fake having to reconstruct the graph.
     */
    routing: () => {
      const [master, sfx, ambient] = nodes.filter(n => n.kind === 'gain');
      return { master: master!.gain, sfx: sfx!.gain, ambient: ambient!.gain };
    }
  };
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
  // configure() is a no-op until the context exists, so every case here opens
  // with a sound to force init() and build the routing gains.
  const started = async () => {
    const synth = await freshSynth();
    synth.playClick();
    return synth;
  };

  // Pins the signature by BEHAVIOUR rather than by `configure.length`. An arity
  // assertion fails open — re-adding a leading `enabled` flag with a default
  // keeps .length at 2 — whereas distinct volumes landing on their own gains
  // can only pass if the two parameters still mean what they say.
  it('routes the first argument to sfx and the second to ambient', async () => {
    const synth = await started();
    const { sfx, ambient } = audio.routing();

    synth.configure(0.25, 0.75);

    expect(sfx.setTargetAtTime).toHaveBeenCalledWith(0.25, expect.any(Number), expect.any(Number));
    expect(ambient.setTargetAtTime).toHaveBeenCalledWith(0.75, expect.any(Number), expect.any(Number));
  });

  it('clamps a non-finite volume instead of passing it to the gain node', async () => {
    const synth = await started();
    const { sfx, ambient } = audio.routing();

    // The fake throws on a non-finite value, exactly as a real AudioParam does.
    // Without the clamp in configure() this call propagates that throw — which
    // is the bug the clamp exists to prevent, since it kills every later sound.
    expect(() => synth.configure(NaN, Infinity)).not.toThrow();

    // ...and the value that DID reach the node is the documented fallback,
    // not some other number that merely happens to be finite.
    expect(sfx.setTargetAtTime).toHaveBeenLastCalledWith(0.5, expect.any(Number), expect.any(Number));
    expect(ambient.setTargetAtTime).toHaveBeenLastCalledWith(0.3, expect.any(Number), expect.any(Number));
  });

  it('clamps out-of-range volumes into 0..1', async () => {
    const synth = await started();
    const { sfx, ambient } = audio.routing();

    synth.configure(5, -3);

    expect(sfx.setTargetAtTime).toHaveBeenLastCalledWith(1, expect.any(Number), expect.any(Number));
    expect(ambient.setTargetAtTime).toHaveBeenLastCalledWith(0, expect.any(Number), expect.any(Number));
  });

  it('treats volume 0 as the mute — there is no separate enabled flag', async () => {
    const synth = await started();
    const { sfx, ambient } = audio.routing();

    synth.configure(0, 0);

    expect(sfx.setTargetAtTime).toHaveBeenLastCalledWith(0, expect.any(Number), expect.any(Number));
    expect(ambient.setTargetAtTime).toHaveBeenLastCalledWith(0, expect.any(Number), expect.any(Number));
  });
});
