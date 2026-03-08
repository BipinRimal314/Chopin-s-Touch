import { stopMetronome } from './metronome';

const NOTE_FREQUENCIES: Record<string, number> = {
  'C3': 130.81, 'C#3': 138.59, 'Db3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'Gb3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'Ab3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'Bb4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'Gb5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'Ab5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'Bb5': 932.33, 'B5': 987.77,
};

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isUnlocked = false;
let pipelineActivated = false;

// Map of currently active notes: noteName -> { oscillators, gains } for proper release
const activeNotes = new Map<string, {
  oscillators: OscillatorNode[];
  gains: GainNode[];
}>();

/**
 * Get (or create) the shared AudioContext. Used by metronome to avoid
 * creating a separate context (iOS allows max ~4).
 */
export const getAudioContext = (): AudioContext => {
  createContext();
  return audioContext!;
};

/**
 * Create the AudioContext and master gain node if they don't exist.
 */
const createContext = (): void => {
  if (audioContext) return;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioContext.createGain();
  masterGain.connect(audioContext.destination);
  masterGain.gain.value = 0.7;

  // Reset flags if iOS suspends the context (e.g., app backgrounded)
  audioContext.onstatechange = () => {
    if (audioContext?.state === 'suspended') {
      isUnlocked = false;
      pipelineActivated = false;
    }
  };
};

/**
 * Activate the iOS WKWebView audio rendering pipeline.
 *
 * On real iOS hardware in Capacitor's WKWebView, the AudioContext's output
 * rendering pipeline does not fully activate until a MediaStream input source
 * (from getUserMedia) is connected to the audio graph. Without this,
 * AudioContext reports state 'running' but silently drops all output.
 *
 * This function requests mic access, briefly connects the stream to the
 * AudioContext to kick the pipeline into gear, then cleans up. The pipeline
 * stays active after disconnection.
 */
const activateIOSAudioPipeline = async (): Promise<void> => {
  if (pipelineActivated || !audioContext) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    // Route through a zero-gain node so no mic audio leaks to speakers
    const muteGain = audioContext.createGain();
    muteGain.gain.value = 0;
    source.connect(muteGain);
    muteGain.connect(audioContext.destination);
    pipelineActivated = true;
    // Pipeline is activated. Clean up after a brief moment.
    setTimeout(() => {
      source.disconnect();
      muteGain.disconnect();
      stream.getTracks().forEach(t => t.stop());
    }, 250);
  } catch {
    // Mic permission denied or unavailable. Audio output will activate
    // when Practice mode requests mic access later.
  }
};

/**
 * Initialize the AudioContext. Must be called from a user gesture handler.
 */
export const initAudio = (): void => {
  createContext();
  ensureAudioReady();
  // Fire-and-forget: activate iOS audio pipeline via brief mic access.
  // By the time the user navigates to an exercise, the pipeline will be ready.
  activateIOSAudioPipeline();
};

/**
 * Unlock audio for iOS WKWebView (Capacitor).
 *
 * MUST be called synchronously at the very top of any click/tap handler
 * that will produce sound — before any await or setState.
 *
 * Resumes the AudioContext and plays a silent buffer within the gesture
 * stack. Also re-triggers pipeline activation if it hasn't happened yet
 * (e.g., if initAudio's attempt failed due to timing).
 *
 * Called on every gesture because iOS can silently re-suspend the audio
 * session (app backgrounded, screen lock) without updating state.
 */
export const ensureAudioReady = (): void => {
  createContext();
  if (!audioContext) return;

  // Resume AudioContext if suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  // Silent buffer through AudioContext (gesture-stack unlock)
  const buffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);

  // If the pipeline wasn't activated yet (initAudio didn't run or mic was
  // denied initially), try again on this gesture
  if (!pipelineActivated) {
    activateIOSAudioPipeline();
  }

  isUnlocked = true;
};

/**
 * Await the AudioContext reaching 'running' state.
 * Call ensureAudioReady() synchronously FIRST (for the gesture registration),
 * then await this before scheduling any audio.
 */
export const waitForAudioReady = (): Promise<void> => {
  if (!audioContext) return Promise.resolve();
  if (audioContext.state === 'running') return Promise.resolve();
  return audioContext.resume();
};

/**
 * Set the master volume level.
 * @param level - 0.0 (silent) to 1.0 (full volume)
 */
export const setVolume = (level: number): void => {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, level));
  }
};

/**
 * Get the current master volume level.
 * @returns Current volume between 0.0 and 1.0
 */
export const getVolume = (): number => {
  return masterGain ? masterGain.gain.value : 0.7;
};

export const playNote = (noteName: string, duration = 1.5) => {
  // Callers must call ensureAudioReady() synchronously in their tap handler
  // before calling playNote. That's the only way iOS WKWebView unlocks audio.
  if (!audioContext) {
    ensureAudioReady();
  }
  if (!audioContext) return;

  const freq = NOTE_FREQUENCIES[noteName];
  if (!freq) return;

  // Throttle: if this note is already playing, don't stack another instance.
  // Prevents glitches from rapid repeated triggers (e.g., finger sliding on iPad).
  if (activeNotes.has(noteName)) return;

  // Route all output through masterGain if available, otherwise direct to destination
  const output = masterGain || audioContext.destination;

  // Schedule slightly in the future to avoid "in the past" errors on slower devices
  const t = audioContext.currentTime + 0.005;

  // --- Synthesis Layer 1: The Body (Sine Wave) ---
  // Provides the fundamental low-end weight of the piano sound.
  const oscMain = audioContext.createOscillator();
  const gainMain = audioContext.createGain();

  oscMain.type = 'sine';
  oscMain.frequency.value = freq;

  // Envelope: Fast attack, long smooth sustain
  gainMain.gain.setValueAtTime(0, t);
  gainMain.gain.linearRampToValueAtTime(0.5, t + 0.015);
  gainMain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  oscMain.connect(gainMain);
  gainMain.connect(output);

  // --- Synthesis Layer 2: The Warmth (Triangle Wave) ---
  // Adds harmonic content. We slightly detune it to create a "chorus" effect
  // characteristic of electric/digital pianos.
  const oscHarm = audioContext.createOscillator();
  const gainHarm = audioContext.createGain();

  oscHarm.type = 'triangle';
  oscHarm.frequency.value = freq * 1.002; // +2 cents detune for warmth

  // Envelope: Slightly softer, decays a bit faster than the sine wave
  gainHarm.gain.setValueAtTime(0, t);
  gainHarm.gain.linearRampToValueAtTime(0.2, t + 0.015);
  gainHarm.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.8);

  oscHarm.connect(gainHarm);
  gainHarm.connect(output);

  // --- Synthesis Layer 3: The Attack (Filtered Sawtooth) ---
  // Simulates the initial "thud" or "click" of the hammer striking the string.
  // It starts bright and immediately becomes dull.
  const oscAttack = audioContext.createOscillator();
  const gainAttack = audioContext.createGain();
  const filterAttack = audioContext.createBiquadFilter();

  oscAttack.type = 'sawtooth';
  oscAttack.frequency.value = freq;

  filterAttack.type = 'lowpass';
  filterAttack.frequency.setValueAtTime(freq * 4, t); // Start very bright
  filterAttack.frequency.exponentialRampToValueAtTime(freq, t + 0.1); // Quickly dampen
  filterAttack.Q.value = 0; // No resonance

  // Envelope: Very short "blip"
  gainAttack.gain.setValueAtTime(0, t);
  gainAttack.gain.linearRampToValueAtTime(0.15, t + 0.005);
  gainAttack.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

  oscAttack.connect(filterAttack);
  filterAttack.connect(gainAttack);
  gainAttack.connect(output);

  const oscillators = [oscMain, oscHarm, oscAttack];
  const gains = [gainMain, gainHarm, gainAttack];

  // Store active note for stopNote() and duplicate prevention
  activeNotes.set(noteName, { oscillators, gains });

  // Start all oscillators
  oscillators.forEach(osc => {
    osc.start(t);
    osc.stop(t + duration);
  });

  // Clean up from the activeNotes map when the note finishes naturally
  oscMain.onended = () => {
    activeNotes.delete(noteName);
  };
};

/**
 * Stop a currently playing note with a quick fade-out (0.1s).
 * Called on key release for realistic piano behavior.
 */
export const stopNote = (noteName: string): void => {
  const active = activeNotes.get(noteName);
  if (!active || !audioContext) return;

  const now = audioContext.currentTime;

  active.gains.forEach(gain => {
    // Cancel any scheduled envelope ramps
    gain.gain.cancelScheduledValues(now);
    // Set current value, then fade out over 0.1 seconds
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  });

  // Stop oscillators after the fade-out completes
  active.oscillators.forEach(osc => {
    try {
      osc.stop(now + 0.1);
    } catch {
      // Already stopped — ignore
    }
  });

  activeNotes.delete(noteName);
};

// Flag to cancel an in-progress accompaniment
let accompanimentCancelled = false;

/**
 * Play an accompaniment line (left-hand bass notes) independently of the main sequence.
 * Uses its own cancel flag so both melody and accompaniment can run simultaneously.
 *
 * @param notes - Array of note names to play in order
 * @param bpm - Tempo in beats per minute
 * @param durations - Optional array of duration multipliers relative to a quarter note.
 *   1 = quarter, 2 = half, 4 = whole. Defaults to whole notes (4) when undefined.
 */
export const playAccompaniment = async (notes: string[], bpm: number, durations?: number[]) => {
  accompanimentCancelled = false;
  const quarterMs = 60000 / bpm;

  if (!audioContext) createContext();
  if (!audioContext || audioContext.state !== 'running') return;

  for (let i = 0; i < notes.length; i++) {
    if (accompanimentCancelled) return;
    const note = notes[i];
    const durationMultiplier = durations?.[i] ?? 4; // default to whole notes
    const intervalMs = quarterMs * durationMultiplier;
    stopNote(note);
    playNote(note, Math.min((intervalMs / 1000) * 1.5, 6.0));
    await new Promise(r => setTimeout(r, intervalMs));
  }
};

/**
 * Stop any currently playing accompaniment immediately.
 */
export const stopAccompaniment = (): void => {
  accompanimentCancelled = true;
};

// Flag to cancel an in-progress sequence
let sequenceCancelled = false;

/**
 * Stop any currently playing sequence immediately.
 */
export const stopSequence = (): void => {
  sequenceCancelled = true;
  // Stop all currently sounding notes
  for (const noteName of activeNotes.keys()) {
    stopNote(noteName);
  }
};

/**
 * Stop ALL audio: cancel any in-progress sequence, stop all active notes,
 * and stop the metronome. Used for navigation cleanup when leaving
 * exercise or piece-player views.
 */
export const stopAll = (): void => {
  stopSequence();
  stopAccompaniment();
  stopMetronome();
};

/**
 * Play a sequence of notes at a given tempo.
 * Before each note, any lingering instance of that note is stopped first,
 * so repeated notes (e.g., ['C4', 'C4', 'C4']) always sound.
 * Can be cancelled mid-sequence by calling stopSequence().
 *
 * @param notes - Array of note names to play in order
 * @param bpm - Tempo in beats per minute (default 100)
 * @param durations - Optional array of duration multipliers relative to a quarter note.
 *   1 = quarter note, 0.5 = eighth, 2 = half, 4 = whole, 0.333 = triplet eighth, 1.5 = dotted quarter.
 *   When undefined, all notes are treated as quarter notes (backward compatible).
 */
export const playSequence = async (notes: string[], bpm: number = 100, durations?: number[]) => {
  sequenceCancelled = false;
  const quarterMs = 60000 / bpm;

  // Ensure AudioContext exists (caller should have called ensureAudioReady()
  // synchronously in their tap handler, but guard against missing context)
  if (!audioContext) createContext();
  if (!audioContext) return;

  // On iOS WKWebView, resume() + silent buffer unlock initiated by
  // ensureAudioReady() is async. The context transitions to 'running'
  // some time after the synchronous gesture handler completes.
  // We must NOT call resume() again here (outside the gesture stack,
  // iOS ignores it). Instead, poll until the gesture handler's resume()
  // takes effect.
  if (audioContext.state !== 'running') {
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (!audioContext || audioContext.state === 'running') {
          clearInterval(interval);
          resolve();
        }
      }, 10);
      // Don't hang forever if the context never unlocks
      setTimeout(() => { clearInterval(interval); resolve(); }, 1000);
    });
  }

  // Context never reached 'running' — no sound possible
  if (!audioContext || audioContext.state !== 'running') return;

  for (let i = 0; i < notes.length; i++) {
    if (sequenceCancelled) return;
    const note = notes[i];
    const durationMultiplier = durations?.[i] ?? 1;
    const intervalMs = quarterMs * durationMultiplier;
    stopNote(note); // Clear any lingering instance of this note
    // Sustain length scales with the note's duration, capped at a reasonable max
    playNote(note, Math.min((intervalMs / 1000) * 1.5, 4.0));
    await new Promise(r => setTimeout(r, intervalMs));
  }
};
