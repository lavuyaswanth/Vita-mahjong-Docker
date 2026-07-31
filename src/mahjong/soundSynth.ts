// Web Audio API Soothing Sound Synthesizer
// Asset-free, offline-ready organic sounds tailored for a senior-friendly relaxing experience.

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  // Ambient sound state
  private waveInterval: number | null = null;
  private chimeInterval: number | null = null;
  private isAmbientPlaying = false;
  // Every ambient voice currently scheduled. stopAmbient has to reach these:
  // playWave schedules an 8-second noise source and playChime a 4-second
  // oscillator, and clearing the timers does nothing to a note already handed
  // to the audio clock — unchecking the setting used to leave the ocean rolling
  // for up to 8 more seconds, including over the main menu after Back.
  private ambientVoices: { src: AudioScheduledSourceNode; gain: GainNode }[] = [];
  private sfxVolume = 0.5;
  private ambientVolume = 0.3;

  constructor() {
    // AudioContext will be initialized on demand to satisfy browser interaction security policies.
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Setup gain node routing
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser:", e);
    }
  }

  // Set general configuration.
  // Gains are clamped here as well as at the call site: a NaN reaching a
  // WebAudio gain node throws and takes down every later sound with it.
  //
  // There used to be an `enabled` flag here, but all three call sites passed
  // `true` and nothing exposed a mute — so masterGain never left 1.0 and the
  // `if (!this.enabled) return` guards never fired. Volume 0 is the mute.
  public configure(sfxVol: number, ambVol: number) {
    const clamp = (v: number, fallback: number) =>
      Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback;
    sfxVol = clamp(sfxVol, 0.5);
    ambVol = clamp(ambVol, 0.3);

    this.sfxVolume = sfxVol;
    this.ambientVolume = ambVol;

    if (!this.ctx) return;

    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(sfxVol, this.ctx.currentTime, 0.1);
    }
    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(ambVol, this.ctx.currentTime, 0.1);
    }
  }

  /** Remember a scheduled ambient voice, and forget it once it ends on its own. */
  private trackAmbientVoice(src: AudioScheduledSourceNode, gain: GainNode) {
    const voice = { src, gain };
    this.ambientVoices.push(voice);
    src.onended = () => {
      const i = this.ambientVoices.indexOf(voice);
      if (i !== -1) this.ambientVoices.splice(i, 1);
      try { gain.disconnect(); } catch { /* already torn down */ }
    };
  }

  // Create an organic click sound (wood-block tick)
  public playClick() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.05);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Woodblock selection click (spec Part VII): 880 Hz sine, decaying over 0.05s.
  public playSelect() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Match chime "Chime Knock" (spec Part VII): A-major third — 440 Hz + 554.37 Hz,
  // decaying over 0.15s.
  public playMatch() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const freqs = [440, 554.37]; // A4 + C#5 (major third)

    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.17);
    });
  }

  // Play shuffle sliding wooden blocks sound effect
  public playShuffle() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const duration = 0.8;
    const steps = 14;

    for (let i = 0; i < steps; i++) {
      const stepTime = t + (i * (duration / steps));
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      // Vary pitch slightly to simulate different size tiles sliding
      const pitch = 120 + Math.random() * 90;
      osc.frequency.setValueAtTime(pitch, stepTime);
      osc.frequency.linearRampToValueAtTime(pitch - 40, stepTime + 0.05);

      gain.gain.setValueAtTime(0.15, stepTime);
      gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(stepTime);
      osc.stop(stepTime + 0.06);
    }
  }

  // Soothing pentatonic win fanfare
  public playVictory() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    // Soothing melody cascade: C4 -> E4 -> G4 -> C5 -> E5 -> G5 -> C6
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const noteDelay = idx * 0.15;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + noteDelay);

      gain.gain.setValueAtTime(0, t + noteDelay);
      gain.gain.linearRampToValueAtTime(0.25, t + noteDelay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDelay + 1.8);

      // Connect subtle vibrato
      const vibrato = this.ctx!.createOscillator();
      const vibratoGain = this.ctx!.createGain();
      vibrato.frequency.value = 6; // 6 Hz vibrato
      vibratoGain.gain.value = 3; // Shift frequency by 3 Hz
      
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      
      osc.connect(gain);
      gain.connect(this.sfxGain!);

      vibrato.start(t + noteDelay);
      osc.start(t + noteDelay);

      vibrato.stop(t + noteDelay + 2.0);
      osc.stop(t + noteDelay + 2.0);
    });
  }

  // Synthesize relaxing ocean waves rolling in/out
  public startAmbient() {
    this.init();
    if (!this.ctx || !this.ambientGain || this.isAmbientPlaying) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.isAmbientPlaying = true;

    // Generate low-frequency modulated white noise for ocean waves
    const bufferSize = 2 * this.ctx.sampleRate; // 2 seconds buffer
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const playWave = () => {
      if (!this.isAmbientPlaying || !this.ctx || !this.ambientGain) return;

      const t = this.ctx.currentTime;
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Filter to shape noise (lowpass filtering removes high harsh frequencies)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, t);
      // Modulate lowpass frequency between 150Hz and 450Hz for wave depth
      filter.frequency.exponentialRampToValueAtTime(450, t + 4.0);
      filter.frequency.exponentialRampToValueAtTime(150, t + 8.0);

      // Volume envelope to mimic wave swelling
      const waveGain = this.ctx.createGain();
      waveGain.gain.setValueAtTime(0.001, t);
      waveGain.gain.linearRampToValueAtTime(0.12, t + 4.0); // Swell up in 4s
      waveGain.gain.exponentialRampToValueAtTime(0.001, t + 8.0); // Fade down in 4s

      noiseSource.connect(filter);
      filter.connect(waveGain);
      waveGain.connect(this.ambientGain);

      noiseSource.start(t);
      noiseSource.stop(t + 8.0);
      this.trackAmbientVoice(noiseSource, waveGain);
    };

    // Trigger ocean waves every 8 seconds
    playWave();
    this.waveInterval = setInterval(playWave, 8000);

    // Trigger relaxing high pentatonic glass wind chimes randomly
    const playChime = () => {
      if (!this.isAmbientPlaying || !this.ctx || !this.ambientGain) return;

      const t = this.ctx.currentTime;
      // High relaxing chimes: E6, G6, A6, C7, E7
      const chimeNotes = [1318.51, 1567.98, 1760.00, 2093.00, 2637.02];
      const randomNote = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(randomNote, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.05, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.5); // Rich decay

      osc.connect(gain);
      gain.connect(this.ambientGain);

      osc.start(t);
      osc.stop(t + 4.0);
      this.trackAmbientVoice(osc, gain);

      // Reschedule next chime in 6-18 seconds
      const nextDelay = 6000 + Math.random() * 12000;
      this.chimeInterval = setTimeout(playChime, nextDelay);
    };

    this.chimeInterval = setTimeout(playChime, 3000);
  }

  public stopAmbient() {
    this.isAmbientPlaying = false;
    if (this.waveInterval) {
      clearInterval(this.waveInterval);
      this.waveInterval = null;
    }
    if (this.chimeInterval) {
      clearTimeout(this.chimeInterval);
      this.chimeInterval = null;
    }

    // Silence what is already scheduled. Clearing the timers only prevents the
    // NEXT voice; a wave handed to the audio clock runs its full 8 seconds
    // regardless, which is why turning the setting off (or returning to the
    // menu, which stops ambient via an effect cleanup) used to leave the ocean
    // playing. Fade over 120ms rather than cutting, or stopping mid-swell
    // clicks.
    if (!this.ctx) { this.ambientVoices = []; return; }
    const now = this.ctx.currentTime;
    for (const { src, gain } of this.ambientVoices) {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.12);
        src.stop(now + 0.15);
      } catch { /* already stopped or ended */ }
    }
    // onended still fires for each, which is what disconnects them.
    this.ambientVoices = [];
  }

  // Combo streak chime (spec Part VII): scales pitch up the C-Major scale from
  // C4 to C5 as the combo multiplier climbs (capped at 10x). A short sparkle is
  // layered on for high streaks.
  public playComboChime(multiplier: number) {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;

    // C-Major scale, C4 -> C5 (8 steps). Multiplier 1..10 maps onto these notes,
    // the top notes repeating for the highest streaks.
    const cMajor = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
    const step = Math.min(Math.max(multiplier - 1, 0), cMajor.length - 1);
    const root = cMajor[step];

    // Lead note rising up the scale.
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(root, t);
    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 1.0);

    // Add an octave-up sparkle once the streak gets exciting (>= 5x).
    if (multiplier >= 5) {
      const spark = this.ctx.createOscillator();
      const sparkGain = this.ctx.createGain();
      spark.type = 'sine';
      spark.frequency.setValueAtTime(root * 2, t + 0.05);
      sparkGain.gain.setValueAtTime(0.0, t + 0.05);
      sparkGain.gain.linearRampToValueAtTime(0.18, t + 0.07);
      sparkGain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
      spark.connect(sparkGain);
      sparkGain.connect(this.sfxGain);
      spark.start(t + 0.05);
      spark.stop(t + 1.2);
    }
  }

  // Sparkling celebratory arpeggio for achievement unlock
  public playAchievementUnlock() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    // Ascending arpeggio: E5 → G#5 → B5 → E6
    const notes = [659.25, 830.61, 987.77, 1318.51];

    notes.forEach((freq, index) => {
      const delay = index * 0.06;
      const osc = this.ctx!.createOscillator();
      const shimmerOsc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const shimmerGain = this.ctx!.createGain();

      // Primary tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);

      // Shimmer: secondary oscillator at +2Hz for beating effect
      shimmerOsc.type = 'sine';
      shimmerOsc.frequency.setValueAtTime(freq + 2, t + delay);

      // Primary envelope — longer sustain (~2s total)
      gain.gain.setValueAtTime(0.0, t + delay);
      gain.gain.linearRampToValueAtTime(0.3, t + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 2.0);

      // Shimmer envelope — softer
      shimmerGain.gain.setValueAtTime(0.0, t + delay);
      shimmerGain.gain.linearRampToValueAtTime(0.12, t + delay + 0.02);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + delay + 2.0);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(this.sfxGain!);

      osc.start(t + delay);
      shimmerOsc.start(t + delay);

      osc.stop(t + delay + 2.1);
      shimmerOsc.stop(t + delay + 2.1);
    });
  }

}

export const soundSynth = new SoundSynthesizer();
export default soundSynth;
