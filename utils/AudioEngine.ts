import { isNativeAudioReady, playNativeNote, stopNativeNote, stopAllNativeNotes, setNativeVolume, getNativeVolume } from './nativeAudio';

const NOTE_FREQUENCIES: Record<string, number> = {
  'C3': 130.81, 'C#3': 138.59, 'Db3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'Gb3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'Ab3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'Bb4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'Gb5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'Ab5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'Bb5': 932.33, 'B5': 987.77,
};

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isUnlocked = false;
  private sequenceCancelled = false;
  private activeNotes = new Map<string, { oscillators: OscillatorNode[], gains: GainNode[] }>();

  private static instance: AudioEngine;

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  private createContext(): void {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext!.createGain();
    this.masterGain.connect(this.audioContext!.destination);
    this.masterGain.gain.value = 0.7;

    this.audioContext!.onstatechange = () => {
      if (this.audioContext?.state === 'suspended') {
        this.isUnlocked = false;
      }
    };
  }

  public get context(): AudioContext | null {
    this.createContext();
    return this.audioContext;
  }

  public get contextState(): AudioContextState {
    return this.audioContext?.state || 'suspended';
  }

  public ensureReady(): void {
    // NativeAudio handles iOS audio session natively — no unlock needed
    if (isNativeAudioReady()) return;

    this.createContext();
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    if (!this.isUnlocked) {
      const buffer = this.audioContext.createBuffer(1, 1, this.audioContext.sampleRate);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);
      source.onended = () => {
        this.isUnlocked = true;
      };
    }
  }

  public playNote(noteName: string, duration = 1.5): void {
    // Use NativeAudio on iOS for reliable playback.
    // NativeAudio with audioChannelNum:1 auto-restarts on play(), no stop needed.
    if (isNativeAudioReady()) {
      playNativeNote(noteName);
      return;
    }

    if (!this.audioContext) {
      this.ensureReady();
    }
    if (!this.audioContext) return;

    const freq = NOTE_FREQUENCIES[noteName];
    if (!freq) return;

    if (this.activeNotes.has(noteName)) return;

    const output = this.masterGain || this.audioContext.destination;
    const t = this.audioContext.currentTime + 0.005;

    const oscMain = this.audioContext.createOscillator();
    const gainMain = this.audioContext.createGain();
    oscMain.type = 'sine';
    oscMain.frequency.value = freq;
    gainMain.gain.setValueAtTime(0, t);
    gainMain.gain.linearRampToValueAtTime(0.5, t + 0.015);
    gainMain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    oscMain.connect(gainMain);
    gainMain.connect(output);

    const oscHarm = this.audioContext.createOscillator();
    const gainHarm = this.audioContext.createGain();
    oscHarm.type = 'triangle';
    oscHarm.frequency.value = freq * 1.002;
    gainHarm.gain.setValueAtTime(0, t);
    gainHarm.gain.linearRampToValueAtTime(0.2, t + 0.015);
    gainHarm.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.8);
    oscHarm.connect(gainHarm);
    gainHarm.connect(output);

    const oscAttack = this.audioContext.createOscillator();
    const gainAttack = this.audioContext.createGain();
    const filterAttack = this.audioContext.createBiquadFilter();
    oscAttack.type = 'sawtooth';
    oscAttack.frequency.value = freq;
    filterAttack.type = 'lowpass';
    filterAttack.frequency.setValueAtTime(freq * 4, t);
    filterAttack.frequency.exponentialRampToValueAtTime(freq, t + 0.1);
    filterAttack.Q.value = 0;
    gainAttack.gain.setValueAtTime(0, t);
    gainAttack.gain.linearRampToValueAtTime(0.15, t + 0.005);
    gainAttack.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    oscAttack.connect(filterAttack);
    filterAttack.connect(gainAttack);
    gainAttack.connect(output);

    const oscillators = [oscMain, oscHarm, oscAttack];
    const gains = [gainMain, gainHarm, gainAttack];
    this.activeNotes.set(noteName, { oscillators, gains });

    oscillators.forEach(osc => {
      osc.start(t);
      osc.stop(t + duration);
    });

    oscMain.onended = () => {
      this.activeNotes.delete(noteName);
    };
  }

  public stopNote(noteName: string): void {
    if (isNativeAudioReady()) {
      stopNativeNote(noteName);
      return;
    }

    const active = this.activeNotes.get(noteName);
    if (!active || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    active.gains.forEach(gain => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    });

    active.oscillators.forEach(osc => {
      try {
        osc.stop(now + 0.1);
      } catch { }
    });

    this.activeNotes.delete(noteName);
  }

  public stopSequence(): void {
    this.sequenceCancelled = true;
    if (isNativeAudioReady()) {
      stopAllNativeNotes();
      return;
    }
    for (const noteName of this.activeNotes.keys()) {
      this.stopNote(noteName);
    }
  }

  public async playSequence(notes: string[], bpm = 100, durations?: number[]): Promise<void> {
    this.sequenceCancelled = false;
    const quarterMs = 60000 / bpm;

    // NativeAudio doesn't need AudioContext — skip all Web Audio setup
    if (!isNativeAudioReady()) {
      if (!this.audioContext) this.createContext();
      if (!this.audioContext) return;

      if (this.audioContext.state !== 'running') {
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (!this.audioContext || this.audioContext.state === 'running') {
              clearInterval(interval);
              resolve();
            }
          }, 10);
          setTimeout(() => { clearInterval(interval); resolve(); }, 1000);
        });
      }

      if (!this.audioContext || this.audioContext.state !== 'running') return;
    }

    for (let i = 0; i < notes.length; i++) {
      if (this.sequenceCancelled) return;
      const note = notes[i];
      const durationMultiplier = durations?.[i] ?? 1;
      const intervalMs = quarterMs * durationMultiplier;
      this.stopNote(note);
      this.playNote(note, Math.min((intervalMs / 1000) * 1.5, 4.0));
      await new Promise(r => setTimeout(r, intervalMs));
    }
  }

  public setVolume(level: number): void {
    const clamped = Math.max(0, Math.min(1, level));
    setNativeVolume(clamped);
    if (this.masterGain) {
      this.masterGain.gain.value = clamped;
    }
  }

  public getVolume(): number {
    if (isNativeAudioReady()) return getNativeVolume();
    return this.masterGain ? this.masterGain.gain.value : 0.7;
  }
}

export const audioEngine = AudioEngine.getInstance();
