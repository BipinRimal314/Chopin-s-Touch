// Utilities for detecting pitch from audio stream

const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Flat → Sharp equivalence map for note matching
const FLAT_TO_SHARP: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#',
  'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
};

/**
 * Normalize a note name to always use sharps.
 * The pitch detector returns sharps (C#, D#, etc.) but some pieces
 * use flat names (Db, Eb, etc.). This ensures they match.
 * e.g., "Bb4" → "A#4", "Ab3" → "G#3", "C4" → "C4"
 */
export function normalizeNoteName(note: string): string {
  const match = note.match(/^([A-G][b#]?)(\d+)$/);
  if (!match) return note;
  const [, name, octave] = match;
  const normalized = FLAT_TO_SHARP[name] || name;
  return `${normalized}${octave}`;
}

// Auto-correlation algorithm to determine pitch
function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    const val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // Noise gate — lowered from 0.01 to 0.005 for quieter mics/instruments
  if (rms < 0.005) return -1;

  let r1 = 0, r2 = SIZE - 1, thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
  }

  const buf2 = buf.slice(r1, r2);
  if (buf2.length < 2) return -1;

  const c = new Array(buf2.length).fill(0);
  for (let i = 0; i < buf2.length; i++) {
    for (let j = 0; j < buf2.length - i; j++) {
      c[i] = c[i] + buf2[j] * buf2[j + i];
    }
  }

  let d = 0;
  while (d < buf2.length - 1 && c[d] > c[d + 1]) d++;
  if (d >= buf2.length - 1) return -1;

  let maxval = -1, maxpos = -1;
  for (let i = d; i < buf2.length; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  if (maxpos <= 0 || maxpos >= buf2.length - 1) return -1;
  let T0 = maxpos;

  // Parabolic interpolation
  const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

function noteFromPitch(frequency: number): string {
  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  const midiNum = Math.round(noteNum) + 69;

  const noteName = NOTE_STRINGS[midiNum % 12];
  const octave = Math.floor(midiNum / 12) - 1;

  return `${noteName}${octave}`;
}

/**
 * Start listening to the microphone and detecting pitched notes.
 *
 * THROWS if microphone access is unavailable or denied.
 * The caller MUST catch errors and show feedback to the user.
 */
export const startPitchDetection = async (
  onNoteDetected: (note: string) => void
): Promise<() => void> => {
  // Pre-check: mediaDevices is undefined on insecure (HTTP) origins in most browsers
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      'Microphone requires a secure connection (HTTPS). On iPad, access via HTTPS or use localhost on desktop.'
    );
  }

  // This will trigger the browser permission prompt.
  // Throws NotAllowedError if denied, NotFoundError if no mic.
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // iOS Safari requires resume within user gesture context
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  const mediaStreamSource = audioContext.createMediaStreamSource(stream);
  mediaStreamSource.connect(analyser);

  const bufferLength = analyser.fftSize;
  const buffer = new Float32Array(bufferLength);
  let isRunning = true;

  // Use setInterval at ~60ms (~16 readings/sec) instead of requestAnimationFrame.
  // Piano notes sustain for hundreds of milliseconds; 16 Hz sampling is sufficient
  // and dramatically reduces CPU/battery drain on iPad compared to 60fps rAF.
  const intervalId = setInterval(() => {
    if (!isRunning) return;

    analyser.getFloatTimeDomainData(buffer);
    const frequency = autoCorrelate(buffer, audioContext.sampleRate);

    if (frequency !== -1) {
      const note = noteFromPitch(frequency);
      onNoteDetected(note);
    }
  }, 60);

  // Return cleanup function
  return () => {
    isRunning = false;

    clearInterval(intervalId);

    // Release the media stream tracks (turns off the mic indicator on iOS)
    stream.getTracks().forEach(track => track.stop());

    // Close the AudioContext
    if (audioContext.state !== 'closed') {
      audioContext.close();
    }
  };
};
