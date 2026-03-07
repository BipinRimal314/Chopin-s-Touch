// Utilities for detecting pitch from audio stream

const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Auto-correlation algorithm to determine pitch
function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    const val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // Noise gate
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1, thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
  }

  const buf2 = buf.slice(r1, r2);
  const c = new Array(buf2.length).fill(0);
  for (let i = 0; i < buf2.length; i++) {
    for (let j = 0; j < buf2.length - i; j++) {
      c[i] = c[i] + buf2[j] * buf2[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < buf2.length; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
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

export const startPitchDetection = async (
  onNoteDetected: (note: string) => void
): Promise<() => void> => {
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  let isRunning = true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    
    mediaStreamSource = audioContext.createMediaStreamSource(stream);
    mediaStreamSource.connect(analyser);

    const bufferLength = analyser.fftSize;
    const buffer = new Float32Array(bufferLength);

    const updatePitch = () => {
      if (!isRunning || !analyser || !audioContext) return;

      analyser.getFloatTimeDomainData(buffer);
      const frequency = autoCorrelate(buffer, audioContext.sampleRate);

      if (frequency !== -1) {
        const note = noteFromPitch(frequency);
        onNoteDetected(note);
      }

      requestAnimationFrame(updatePitch);
    };

    updatePitch();

  } catch (err) {
    console.error("Error accessing microphone", err);
  }

  // Return cleanup function
  return () => {
    isRunning = false;
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
    }
  };
};
