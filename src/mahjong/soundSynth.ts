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
}

export const soundSynth = new SoundSynthesizer();
export default soundSynth;
