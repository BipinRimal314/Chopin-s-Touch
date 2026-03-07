/**
 * Drift-free metronome using Web Audio API scheduling.
 *
 * Instead of relying on setTimeout/setInterval for timing (which drifts
 * due to JS event loop delays), this uses a look-ahead scheduler:
 * a setInterval checks every 25ms and schedules audio events 100ms ahead
 * using the Web Audio clock, which is hardware-accurate.
 */

let audioContext: AudioContext | null = null;
let nextNoteTime = 0;
let timerID: ReturnType<typeof setInterval> | null = null;
let isPlaying = false;
let currentBPM = 100;
let beatCallback: ((beat: number) => void) | null = null;
let currentBeat = 0;

const SCHEDULE_AHEAD = 0.1; // seconds — how far ahead to schedule audio
const LOOKAHEAD = 25; // ms — how often the scheduler checks

function getOrCreateContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function scheduleClick(time: number, beat: number) {
  const ctx = getOrCreateContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Higher pitch on beat 1 for downbeat emphasis
  osc.frequency.value = beat === 0 ? 1000 : 800;
  osc.type = 'sine';

  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.05);
}

function scheduler() {
  const ctx = getOrCreateContext();
  while (nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD) {
    scheduleClick(nextNoteTime, currentBeat);
    if (beatCallback) beatCallback(currentBeat);
    const secondsPerBeat = 60.0 / currentBPM;
    nextNoteTime += secondsPerBeat;
    currentBeat = (currentBeat + 1) % 4; // 4/4 time
  }
}

/**
 * Start the metronome at the given BPM.
 * If already playing, stops and restarts.
 *
 * @param bpm - Beats per minute
 * @param onBeat - Optional callback fired on each beat for visual sync
 */
export const startMetronome = (bpm: number, onBeat?: (beat: number) => void): void => {
  if (isPlaying) stopMetronome();

  const ctx = getOrCreateContext();
  if (ctx.state === 'suspended') ctx.resume();

  currentBPM = bpm;
  currentBeat = 0;
  beatCallback = onBeat || null;
  isPlaying = true;
  nextNoteTime = ctx.currentTime + 0.05;
  timerID = setInterval(scheduler, LOOKAHEAD);
};

/**
 * Stop the metronome and reset the beat counter.
 */
export const stopMetronome = (): void => {
  isPlaying = false;
  if (timerID !== null) {
    clearInterval(timerID);
    timerID = null;
  }
  currentBeat = 0;
};

/**
 * Update the metronome tempo without stopping it.
 * Clamped to 30-240 BPM.
 *
 * @param bpm - New tempo in beats per minute
 */
export const setMetronomeBPM = (bpm: number): void => {
  currentBPM = Math.max(30, Math.min(240, bpm));
};

/**
 * Check whether the metronome is currently running.
 */
export const isMetronomePlaying = (): boolean => isPlaying;
