// Dynamics detection via microphone RMS amplitude analysis
//
// Designed to run independently from pitch detection. Both can share the same
// physical microphone, but each creates its own AudioContext + AnalyserNode so
// they don't interfere with each other's buffer reads.

export type DynamicLevel = 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff';

/** Ordered softest-to-loudest for iteration and comparison. */
export const DYNAMIC_LEVELS: DynamicLevel[] = ['pp', 'p', 'mp', 'mf', 'f', 'ff'];

/** RMS thresholds for each dynamic level (upper bound exclusive). */
const THRESHOLDS: { level: DynamicLevel; min: number }[] = [
  { level: 'pp', min: 0 },
  { level: 'p',  min: 0.02 },
  { level: 'mp', min: 0.05 },
  { level: 'mf', min: 0.1 },
  { level: 'f',  min: 0.2 },
  { level: 'ff', min: 0.4 },
];

/**
 * Map an RMS amplitude value (0..1) to a dynamic marking.
 *
 *   pp  : < 0.02
 *   p   : 0.02 - 0.05
 *   mp  : 0.05 - 0.1
 *   mf  : 0.1  - 0.2
 *   f   : 0.2  - 0.4
 *   ff  : > 0.4
 */
export function rmsToDynamic(rms: number): DynamicLevel {
  // Walk backwards through the thresholds — first one whose min <= rms wins.
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (rms >= THRESHOLDS[i].min) return THRESHOLDS[i].level;
  }
  return 'pp';
}

/**
 * Return the numeric index (0-5) of a dynamic level.
 * Useful for comparing whether the user is above/below target.
 */
export function dynamicIndex(level: DynamicLevel): number {
  return DYNAMIC_LEVELS.indexOf(level);
}

/**
 * Start listening to the microphone and reporting dynamic levels.
 *
 * Returns a cleanup function (same pattern as startPitchDetection).
 * The callback fires at ~16 Hz with the current DynamicLevel and raw RMS.
 *
 * THROWS if microphone access is unavailable or denied.
 */
export async function startDynamicsDetection(
  onLevel: (level: DynamicLevel, rms: number) => void,
): Promise<() => void> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      'Microphone requires a secure connection (HTTPS). On iPad, access via HTTPS or use localhost on desktop.',
    );
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  const buffer = new Float32Array(analyser.fftSize);
  let isRunning = true;

  // Sample at ~16 Hz (60 ms interval) — same cadence as pitch detection.
  // Piano dynamics change over hundreds of milliseconds; this is plenty.
  const intervalId = setInterval(() => {
    if (!isRunning) return;

    analyser.getFloatTimeDomainData(buffer);

    // Compute RMS (root mean square) amplitude
    let sumSq = 0;
    for (let i = 0; i < buffer.length; i++) {
      sumSq += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumSq / buffer.length);

    onLevel(rmsToDynamic(rms), rms);
  }, 60);

  return () => {
    isRunning = false;
    clearInterval(intervalId);
    stream.getTracks().forEach((track) => track.stop());
    if (audioContext.state !== 'closed') {
      audioContext.close();
    }
  };
}
