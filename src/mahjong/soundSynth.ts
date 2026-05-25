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
  private enabled = true;
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
      this.masterGain.gain.setValueAtTime(this.enabled ? 1.0 : 0.0, this.ctx.currentTime);
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

  // Set general configuration
  public configure(enabled: boolean, sfxVol: number, ambVol: number) {
    this.enabled = enabled;
    this.sfxVolume = sfxVol;
    this.ambientVolume = ambVol;

    if (!this.ctx) return;

    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(enabled ? 1.0 : 0.0, this.ctx.currentTime, 0.1);
    }
    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(sfxVol, this.ctx.currentTime, 0.1);
    }
    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(ambVol, this.ctx.currentTime, 0.1);
    }
  }

  // Create an organic click sound (wood-block tick)
  public playClick() {
    this.init();
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
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

  // Create a selection pop sound
  public playSelect() {
    this.init();
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Play a gorgeous soft pentatonic match chime
  public playMatch() {
    this.init();
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    // Soothing major pentatonic notes (C5, E5, G5)
    const freqs = [523.25, 659.25, 783.99];

    freqs.forEach((freq, index) => {
      const delay = index * 0.04;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);

      // Organic decay
      gain.gain.setValueAtTime(0.0, t + delay);
      gain.gain.linearRampToValueAtTime(0.2, t + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + delay);
      osc.stop(t + delay + 1.3);
    });
  }

  // Play shuffle sliding wooden blocks sound effect
  public playShuffle() {
    this.init();
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
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
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
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
  }

  // Combo streak chime — escalates in excitement with multiplier
  public playComboChime(multiplier: number) {
    this.init();
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;

    if (multiplier <= 2) {
      // Higher-pitched match chime (+100Hz offset)
      const freqs = [623.25, 759.25, 883.99];
      freqs.forEach((freq, index) => {
        const delay = index * 0.04;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);

        gain.gain.setValueAtTime(0.0, t + delay);
        gain.gain.linearRampToValueAtTime(0.2, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 1.0);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(t + delay);
        osc.stop(t + delay + 1.1);
      });
    } else if (multiplier === 3) {
      // Rapid two-note ascending chime: C5 → E5
      const notes = [523.25, 659.25];
      notes.forEach((freq, index) => {
        const delay = index * 0.06;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);

        gain.gain.setValueAtTime(0.0, t + delay);
        gain.gain.linearRampToValueAtTime(0.25, t + delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.8);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(t + delay);
        osc.stop(t + delay + 0.9);
      });
    } else if (multiplier === 4) {
      // Rapid three-note ascending chime: C5 → E5 → G5
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, index) => {
        const delay = index * 0.05;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);

        gain.gain.setValueAtTime(0.0, t + delay);
        gain.gain.linearRampToValueAtTime(0.28, t + delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.9);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(t + delay);
        osc.stop(t + delay + 1.0);
      });
    } else {
      // multiplier 5+: Four-note fanfare C5 → E5 → G5 → C6 with shimmer/vibrato
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const delay = index * 0.07;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);

        gain.gain.setValueAtTime(0.0, t + delay);
        gain.gain.linearRampToValueAtTime(0.3, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 1.5);

        // Add shimmer vibrato for excitement
        const vibrato = this.ctx!.createOscillator();
        const vibratoGain = this.ctx!.createGain();
        vibrato.frequency.value = 8;
        vibratoGain.gain.value = 5;

        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        vibrato.start(t + delay);
        osc.start(t + delay);

        vibrato.stop(t + delay + 1.6);
        osc.stop(t + delay + 1.6);
      });
    }
  }

  // Sparkling celebratory arpeggio for achievement unlock
  public playAchievementUnlock() {
    this.init();
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
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

  // Quick tense ticking sound for timed mode
  public playCountdownTick() {
    this.init();
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // Urgent double-tick for when time is running low (< 30s)
  public playCountdownUrgent() {
    this.init();
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;

    // First tick at 1000Hz
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(1000, t);

    gain1.gain.setValueAtTime(0.35, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc1.connect(gain1);
    gain1.connect(this.sfxGain);

    osc1.start(t);
    osc1.stop(t + 0.04);

    // Second tick at 1200Hz, 50ms later
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1200, t + 0.05);

    gain2.gain.setValueAtTime(0.001, t);
    gain2.gain.setValueAtTime(0.35, t + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc2.connect(gain2);
    gain2.connect(this.sfxGain);

    osc2.start(t + 0.05);
    osc2.stop(t + 0.09);
  }

  // Game-over buzzer for timed mode expiry
  public playTimeUp() {
    this.init();
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;

    // Primary descending tone: 400Hz → 200Hz over 0.5s
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(400, t);
    osc1.frequency.exponentialRampToValueAtTime(200, t + 0.5);

    gain1.gain.setValueAtTime(0.4, t);
    gain1.gain.setValueAtTime(0.4, t + 0.4);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc1.connect(gain1);
    gain1.connect(this.sfxGain);

    osc1.start(t);
    osc1.stop(t + 0.65);

    // Second voice for thickness: 300Hz → 150Hz
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(300, t);
    osc2.frequency.exponentialRampToValueAtTime(150, t + 0.5);

    gain2.gain.setValueAtTime(0.4, t);
    gain2.gain.setValueAtTime(0.4, t + 0.4);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc2.connect(gain2);
    gain2.connect(this.sfxGain);

    osc2.start(t);
    osc2.stop(t + 0.65);
  }
}

export const soundSynth = new SoundSynthesizer();
export default soundSynth;
