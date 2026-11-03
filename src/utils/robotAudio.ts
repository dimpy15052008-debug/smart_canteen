// Pure Web Audio API Sound Effects Synthesizer for 3D Robot Companion
// No external MP3 files needed; uses native audio oscillators, noise buffers, and envelope filters.

class RobotSoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;

  private getAudioContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // Initialize master dynamics compressor to maximize loudness & punch without distortion
      if (this.ctx && !this.masterCompressor) {
        this.masterCompressor = this.ctx.createDynamicsCompressor();
        this.masterCompressor.threshold.setValueAtTime(-16, this.ctx.currentTime);
        this.masterCompressor.knee.setValueAtTime(8, this.ctx.currentTime);
        this.masterCompressor.ratio.setValueAtTime(6, this.ctx.currentTime);
        this.masterCompressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
        this.masterCompressor.release.setValueAtTime(0.2, this.ctx.currentTime);

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.3, this.ctx.currentTime); // High-gain punchy audible mix

        this.masterCompressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }

      return this.ctx;
    } catch {
      return null;
    }
  }

  private getDestination(): AudioNode | null {
    const ctx = this.getAudioContext();
    if (!ctx) return null;
    return this.masterCompressor || ctx.destination;
  }

  private createNoiseBuffer(duration: number = 1.0): AudioBuffer | null {
    const ctx = this.getAudioContext();
    if (!ctx) return null;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // =========================================================================
  // 1. STANDUP COMEDY PUNCHLINE: "Ba-dum-tss! 🥁"
  // Snare rim hit 1 ("Ba") -> Snare rim hit 2 ("dum") -> Crash Cymbal ("tsss!")
  // =========================================================================
  public badumTss() {
    const ctx = this.getAudioContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const noiseBuffer = this.createNoiseBuffer(1.0);

    // --- Hit 1: "Ba" (time = now) ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(180, now);
    osc1.frequency.exponentialRampToValueAtTime(70, now + 0.08);
    gain1.gain.setValueAtTime(0.45, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc1.connect(gain1);
    gain1.connect(dest);
    osc1.start(now);
    osc1.stop(now + 0.1);

    if (noiseBuffer) {
      const snare1 = ctx.createBufferSource();
      snare1.buffer = noiseBuffer;
      const sFilter1 = ctx.createBiquadFilter();
      sFilter1.type = 'bandpass';
      sFilter1.frequency.setValueAtTime(1400, now);
      sFilter1.Q.setValueAtTime(1.5, now);
      const sGain1 = ctx.createGain();
      sGain1.gain.setValueAtTime(0.35, now);
      sGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      snare1.connect(sFilter1);
      sFilter1.connect(sGain1);
      sGain1.connect(dest);
      snare1.start(now);
      snare1.stop(now + 0.09);
    }

    // --- Hit 2: "dum" (time = now + 0.13s) ---
    const t2 = now + 0.13;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(220, t2);
    osc2.frequency.exponentialRampToValueAtTime(80, t2 + 0.09);
    gain2.gain.setValueAtTime(0.5, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.1);
    osc2.connect(gain2);
    gain2.connect(dest);
    osc2.start(t2);
    osc2.stop(t2 + 0.11);

    if (noiseBuffer) {
      const snare2 = ctx.createBufferSource();
      snare2.buffer = noiseBuffer;
      const sFilter2 = ctx.createBiquadFilter();
      sFilter2.type = 'bandpass';
      sFilter2.frequency.setValueAtTime(1800, t2);
      sFilter2.Q.setValueAtTime(1.8, t2);
      const sGain2 = ctx.createGain();
      sGain2.gain.setValueAtTime(0.4, t2);
      sGain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.09);
      snare2.connect(sFilter2);
      sFilter2.connect(sGain2);
      sGain2.connect(dest);
      snare2.start(t2);
      snare2.stop(t2 + 0.1);
    }

    // --- Hit 3: "tss!" Crash Cymbal & Sizzle (time = now + 0.26s) ---
    const t3 = now + 0.26;
    if (noiseBuffer) {
      const cymbal = ctx.createBufferSource();
      cymbal.buffer = noiseBuffer;
      const cFilter = ctx.createBiquadFilter();
      cFilter.type = 'highpass';
      cFilter.frequency.setValueAtTime(5200, t3);
      cFilter.Q.setValueAtTime(1.2, t3);
      const cGain = ctx.createGain();
      cGain.gain.setValueAtTime(0.55, t3);
      cGain.gain.exponentialRampToValueAtTime(0.001, t3 + 0.85);
      cymbal.connect(cFilter);
      cFilter.connect(cGain);
      cGain.connect(dest);
      cymbal.start(t3);
      cymbal.stop(t3 + 0.9);
    }

    // Metallic ring for cymbal
    [840, 1320].forEach((freq) => {
      const mOsc = ctx.createOscillator();
      const mGain = ctx.createGain();
      mOsc.type = 'square';
      mOsc.frequency.setValueAtTime(freq, t3);
      mGain.gain.setValueAtTime(0.08, t3);
      mGain.gain.exponentialRampToValueAtTime(0.001, t3 + 0.5);
      mOsc.connect(mGain);
      mGain.connect(dest);
      mOsc.start(t3);
      mOsc.stop(t3 + 0.51);
    });
  }

  // =========================================================================
  // 2. CHEERFUL ROBOT LAUGH: "Ha-ha-ha-ha-ha! 😂"
  // =========================================================================
  public laugh() {
    const ctx = this.getAudioContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const laughterTones = [520, 720, 580, 780, 640, 840];

    laughterTones.forEach((freq, idx) => {
      const t = now + idx * 0.085;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq - 140, t + 0.07);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.078);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + 0.082);
    });
  }

  // Alias for backward compatibility
  public tickleGiggle() {
    this.laugh();
  }

  // =========================================================================
  // 3. SAD CRYING & WEEPING: "Wahhh... sniff 😭"
  // =========================================================================
  public cryingSad() {
    const ctx = this.getAudioContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;

    const sobs = [
      { start: now, f1: 650, f2: 380, d: 0.35, vol: 0.38 },
      { start: now + 0.38, f1: 560, f2: 320, d: 0.42, vol: 0.35 },
      { start: now + 0.82, f1: 440, f2: 240, d: 0.48, vol: 0.28 },
    ];

    sobs.forEach((s) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Trembling sob vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.5, s.start);
      lfoGain.gain.setValueAtTime(16, s.start);
      lfo.connect(osc.frequency);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(s.f1, s.start);
      osc.frequency.exponentialRampToValueAtTime(s.f2, s.start + s.d);

      gain.gain.setValueAtTime(s.vol, s.start);
      gain.gain.exponentialRampToValueAtTime(0.001, s.start + s.d);

      osc.connect(gain);
      gain.connect(dest);

      lfo.start(s.start);
      osc.start(s.start);
      lfo.stop(s.start + s.d);
      osc.stop(s.start + s.d);
    });

    // Sniffle breath at end
    const noiseBuffer = this.createNoiseBuffer(0.3);
    if (noiseBuffer) {
      const sniff = ctx.createBufferSource();
      sniff.buffer = noiseBuffer;
      const sFilter = ctx.createBiquadFilter();
      sFilter.type = 'bandpass';
      sFilter.frequency.setValueAtTime(2200, now + 1.2);
      const sGain = ctx.createGain();
      sGain.gain.setValueAtTime(0.25, now + 1.2);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      sniff.connect(sFilter);
      sFilter.connect(sGain);
      sGain.connect(dest);
      sniff.start(now + 1.2);
      sniff.stop(now + 1.42);
    }
  }

  // Alias
  public cry() {
    this.cryingSad();
  }

  // =========================================================================
  // 4. ANGRY FUMES & STEAM HISS: "Grrr... PSHHHH! 😤"
  // =========================================================================
  public angryFumes() {
    const ctx = this.getAudioContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const noiseBuffer = this.createNoiseBuffer(0.8);

    // Low buzzing angry sawtooth growl
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(105, now);
    osc.frequency.linearRampToValueAtTime(75, now + 0.45);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.52);

    // High pressure steam release hiss
    if (noiseBuffer) {
      const steam = ctx.createBufferSource();
      steam.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(4500, now + 0.35);
      filter.Q.setValueAtTime(2.0, now);

      const sGain = ctx.createGain();
      sGain.gain.setValueAtTime(0.45, now);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      steam.connect(filter);
      filter.connect(sGain);
      sGain.connect(dest);
      steam.start(now);
      steam.stop(now + 0.68);
    }
  }

  // Alias
  public angry() {
    this.angryFumes();
  }

  // =========================================================================
  // 5. SAD SIGH / WEARY BREATH: "Haaah... 😔"
  // =========================================================================
  public sadSigh() {
    const ctx = this.getAudioContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(460, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.45);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.52);

    const noiseBuffer = this.createNoiseBuffer(0.6);
    if (noiseBuffer) {
      const breath = ctx.createBufferSource();
      breath.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      const bGain = ctx.createGain();
      bGain.gain.setValueAtTime(0.24, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      breath.connect(filter);
      filter.connect(bGain);
      bGain.connect(dest);
      breath.start(now);
      breath.stop(now + 0.48);
    }
  }

  // =========================================================================
  // 6. SHOCKED GASP: "Gasp! 😲"
  // =========================================================================
  public gaspShock() {
    const ctx = this.getAudioContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.12);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  // =========================================================================
  // 7. BOOSTED AUDIBLE CHIRP, BELL, SUNGLASSES LICK & FANFARE
  // =========================================================================
  public chirp() {
    const ctx = this.getAudioContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08); // D6
    osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.16); // A5

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public ideaChime() {
    const ctx = this.getAudioContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.28, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.38);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  public dealWithIt() {
    const ctx = this.getAudioContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const notes = [
      { f: 440.0, d: 0.1 },  // A4
      { f: 554.37, d: 0.1 }, // C#5
      { f: 659.25, d: 0.1 }, // E5
      { f: 880.0, d: 0.28 }, // A5
    ];

    let t = now;
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + n.d + 0.01);
      t += n.d * 0.9;
    });
  }

  public boop() {
    const ctx = this.getAudioContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public energySurge() {
    const ctx = this.getAudioContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  public laserPew() {
    const ctx = this.getAudioContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.14);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public celebrationFanfare() {
    const ctx = this.getAudioContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const triad = [523.25, 659.25, 783.99, 1046.5]; // C major
    triad.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, st);

      gain.gain.setValueAtTime(0.3, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.45);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(st);
      osc.stop(st + 0.46);
    });
  }
}

export const robotAudio = new RobotSoundSynthesizer();
