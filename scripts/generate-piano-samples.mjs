/**
 * Generate piano note WAV files for NativeAudio playback on iOS.
 *
 * Synthesizes notes from C3 to C6 using the same 3-layer approach
 * as the Web Audio engine (sine + detuned triangle + sawtooth attack).
 *
 * Usage: node scripts/generate-piano-samples.mjs
 * Output: public/audio/notes/{NoteName}.wav
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(PROJECT_ROOT, 'public', 'audio', 'notes');

const SAMPLE_RATE = 44100;
const DURATION = 2.5; // seconds
const NUM_SAMPLES = Math.floor(SAMPLE_RATE * DURATION);
const BIT_DEPTH = 16;

// All notes to generate (file-safe names: # → s)
const NOTES = {
  'C3': 130.81, 'Cs3': 138.59, 'D3': 146.83, 'Ds3': 155.56,
  'E3': 164.81, 'F3': 174.61, 'Fs3': 185.00, 'G3': 196.00,
  'Gs3': 207.65, 'A3': 220.00, 'As3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'Cs4': 277.18, 'D4': 293.66, 'Ds4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'Fs4': 369.99, 'G4': 392.00,
  'Gs4': 415.30, 'A4': 440.00, 'As4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'Cs5': 554.37, 'D5': 587.33, 'Ds5': 622.25,
  'E5': 659.25, 'F5': 698.46, 'Fs5': 739.99, 'G5': 783.99,
  'Gs5': 830.61, 'A5': 880.00, 'As5': 932.33, 'B5': 987.77,
  'C6': 1046.50,
};

/**
 * Generate PCM samples for a single piano note.
 * Uses a 3-layer synthesis identical to the Web Audio engine:
 *   1. Sine wave at fundamental (body)
 *   2. Triangle wave detuned +2 cents (warmth)
 *   3. Sawtooth with fast decay (hammer attack)
 */
function generateNote(freq) {
  const samples = new Float64Array(NUM_SAMPLES);
  // Higher notes decay faster, mimicking real piano string behavior
  const decayRate = 2.0 + (freq / 880) * 2;

  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;

    // --- Main envelope ---
    let envelope;
    if (t < 0.015) {
      envelope = t / 0.015; // 15ms linear attack
    } else {
      envelope = Math.exp(-(t - 0.015) * decayRate);
    }

    // --- Layer 1: Sine (fundamental body) ---
    const sine = Math.sin(2 * Math.PI * freq * t) * 0.5;

    // --- Layer 2: Triangle (detuned +2 cents for warmth) ---
    const triFreq = freq * 1.002;
    const triPhase = (t * triFreq) % 1;
    const triangle = (4 * Math.abs(triPhase - 0.5) - 1) * 0.2;
    // Triangle decays slightly faster
    const triEnvelope = t < 0.015 ? (t / 0.015) : Math.exp(-(t - 0.015) * decayRate * 1.25);

    // --- Layer 3: Sawtooth attack transient ---
    let attack = 0;
    if (t < 0.2) {
      const sawPhase = (t * freq) % 1;
      const sawtooth = 2 * sawPhase - 1;
      let attackEnv;
      if (t < 0.005) {
        attackEnv = (t / 0.005) * 0.15;
      } else {
        attackEnv = 0.15 * Math.exp(-(t - 0.005) * 20);
      }
      // Simple one-pole lowpass filter simulation for the attack
      // Cutoff starts at freq*4 and drops to freq over 0.1s
      const cutoffProgress = Math.min(t / 0.1, 1);
      const cutoff = freq * 4 * Math.pow(freq / (freq * 4), cutoffProgress);
      const alpha = Math.min(1, (2 * Math.PI * cutoff) / SAMPLE_RATE);
      attack = sawtooth * attackEnv * alpha;
    }

    // Mix all layers
    samples[i] = (sine * envelope) + (triangle * triEnvelope) + attack;
  }

  // Convert to 16-bit PCM
  const pcm = new Int16Array(NUM_SAMPLES);
  // Find peak for normalization (prevent clipping)
  let peak = 0;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    peak = Math.max(peak, Math.abs(samples[i]));
  }
  const normalizeScale = peak > 0 ? 0.9 / peak : 1; // Leave 10% headroom

  for (let i = 0; i < NUM_SAMPLES; i++) {
    pcm[i] = Math.max(-32768, Math.min(32767, Math.round(samples[i] * normalizeScale * 32767)));
  }

  return pcm;
}

/**
 * Create a WAV file buffer from 16-bit PCM samples.
 */
function createWav(samples) {
  const numChannels = 1;
  const byteRate = SAMPLE_RATE * numChannels * (BIT_DEPTH / 8);
  const blockAlign = numChannels * (BIT_DEPTH / 8);
  const dataSize = samples.length * (BIT_DEPTH / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);  // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(BIT_DEPTH, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }

  return buffer;
}

// --- Main ---
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log(`Generating ${Object.keys(NOTES).length} piano samples into ${OUTPUT_DIR}/`);

for (const [name, freq] of Object.entries(NOTES)) {
  const samples = generateNote(freq);
  const wav = createWav(samples);
  writeFileSync(join(OUTPUT_DIR, `${name}.wav`), wav);
  const sizeKB = Math.round(wav.length / 1024);
  console.log(`  ${name}.wav  (${freq} Hz, ${sizeKB} KB)`);
}

console.log('Done.');
