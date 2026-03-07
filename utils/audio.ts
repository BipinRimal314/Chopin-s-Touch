const NOTE_FREQUENCIES: Record<string, number> = {
  'C3': 130.81, 'C#3': 138.59, 'Db3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'Gb3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'Ab3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'Bb4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'Gb5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'Ab5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'Bb5': 932.33, 'B5': 987.77,
};

let audioContext: AudioContext | null = null;

export const playNote = (noteName: string, duration = 2.0) => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  // Resume context if suspended (browser policy requires user interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const freq = NOTE_FREQUENCIES[noteName];
  if (!freq) return;

  const t = audioContext.currentTime;

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
  gainMain.connect(audioContext.destination);

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
  gainHarm.connect(audioContext.destination);

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
  gainAttack.connect(audioContext.destination);

  // Start all oscillators
  [oscMain, oscHarm, oscAttack].forEach(osc => {
    osc.start(t);
    osc.stop(t + duration);
  });
};

export const playSequence = async (notes: string[], intervalMs: number = 500) => {
  for (const note of notes) {
    // Play slightly shorter notes for sequences to avoid muddiness
    playNote(note, 1.5);
    await new Promise(r => setTimeout(r, intervalMs));
  }
};