/**
 * MIDI input abstraction layer.
 *
 * Tries two backends in order:
 * 1. Capacitor plugin (@midiative/capacitor-midi-device) — works on iPad via CoreMIDI
 * 2. Web MIDI API — works on desktop Chrome/Edge for development
 *
 * Both backends emit the same events: note name (e.g. "C4") + velocity (0-127).
 */

import type { DynamicLevel } from './dynamics';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface MIDINoteEvent {
  note: string;     // e.g. "C4", "F#5"
  velocity: number; // 0-127
  type: 'on' | 'off';
}

export type MIDIBackend = 'capacitor' | 'webmidi' | 'none';

/**
 * Convert MIDI note number to note name. MIDI 60 = C4, MIDI 69 = A4.
 */
export function midiNoteToName(noteNumber: number): string {
  const name = NOTE_NAMES[noteNumber % 12];
  const octave = Math.floor(noteNumber / 12) - 1;
  return `${name}${octave}`;
}

/**
 * Map MIDI velocity (0-127) to a dynamic level.
 */
export function velocityToDynamic(velocity: number): DynamicLevel {
  if (velocity < 20) return 'pp';
  if (velocity < 40) return 'p';
  if (velocity < 60) return 'mp';
  if (velocity < 85) return 'mf';
  if (velocity < 110) return 'f';
  return 'ff';
}

/**
 * Detect which MIDI backend is available.
 */
export async function detectMIDIBackend(): Promise<MIDIBackend> {
  // Try Capacitor plugin first (iPad)
  try {
    const mod = await import('@midiative/capacitor-midi-device');
    if (mod.CapacitorMIDIDevice) {
      const result = await mod.CapacitorMIDIDevice.listMIDIDevices();
      if (result.value && result.value.length > 0) return 'capacitor';
    }
  } catch {}

  // Try Web MIDI API (desktop Chrome/Edge)
  if (navigator.requestMIDIAccess) {
    try {
      const access = await navigator.requestMIDIAccess();
      if (access.inputs.size > 0) return 'webmidi';
    } catch {}
  }

  return 'none';
}

/**
 * Check if any MIDI input device is connected and accessible.
 */
export async function isMIDIAvailable(): Promise<boolean> {
  return (await detectMIDIBackend()) !== 'none';
}

/**
 * Get names of connected MIDI devices.
 */
export async function getMIDIDeviceNames(): Promise<string[]> {
  // Try Capacitor
  try {
    const mod = await import('@midiative/capacitor-midi-device');
    const result = await mod.CapacitorMIDIDevice.listMIDIDevices();
    if (result.value && result.value.length > 0) return result.value;
  } catch {}

  // Try Web MIDI
  if (navigator.requestMIDIAccess) {
    try {
      const access = await navigator.requestMIDIAccess();
      const names: string[] = [];
      access.inputs.forEach(input => {
        names.push(input.name || `MIDI Device ${input.id}`);
      });
      if (names.length > 0) return names;
    } catch {}
  }

  return [];
}

/**
 * Start listening for MIDI note events.
 * Returns a cleanup function.
 * Throws if no MIDI devices are available.
 */
export async function startMIDIInput(
  onNote: (event: MIDINoteEvent) => void,
): Promise<() => void> {
  // Try Capacitor plugin first
  try {
    const mod = await import('@midiative/capacitor-midi-device');
    const devices = await mod.CapacitorMIDIDevice.listMIDIDevices();
    if (devices.value && devices.value.length > 0) {
      return await startCapacitorMIDI(mod.CapacitorMIDIDevice, onNote);
    }
  } catch {}

  // Try Web MIDI API
  if (navigator.requestMIDIAccess) {
    try {
      return await startWebMIDI(onNote);
    } catch {}
  }

  throw new Error('No MIDI input available. Connect a MIDI keyboard via USB or Bluetooth.');
}

// --- Capacitor Plugin Backend ---

async function startCapacitorMIDI(
  plugin: any,
  onNote: (event: MIDINoteEvent) => void,
): Promise<() => void> {
  // Open the first device
  await plugin.openDevice({ deviceNumber: 0 });

  // Listen for MIDI messages
  const listener = await plugin.addListener(
    'MIDI_MSG_EVENT',
    (msg: { type: string; note: number; velocity: number }) => {
      if (msg.type === 'noteOn' && msg.velocity > 0) {
        onNote({
          note: midiNoteToName(msg.note),
          velocity: msg.velocity,
          type: 'on',
        });
      } else if (msg.type === 'noteOff' || (msg.type === 'noteOn' && msg.velocity === 0)) {
        onNote({
          note: midiNoteToName(msg.note),
          velocity: 0,
          type: 'off',
        });
      }
    },
  );

  return () => {
    listener.remove();
  };
}

// --- Web MIDI API Backend (Desktop) ---

async function startWebMIDI(
  onNote: (event: MIDINoteEvent) => void,
): Promise<() => void> {
  const access = await navigator.requestMIDIAccess!();
  const cleanups: (() => void)[] = [];

  const handleMessage = (e: MIDIMessageEvent) => {
    const data = e.data;
    if (!data || data.length < 3) return;
    const command = data[0] & 0xf0;
    const noteNum = data[1];
    const velocity = data[2];

    if (command === 0x90 && velocity > 0) {
      onNote({ note: midiNoteToName(noteNum), velocity, type: 'on' });
    } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
      onNote({ note: midiNoteToName(noteNum), velocity: 0, type: 'off' });
    }
  };

  access.inputs.forEach(input => {
    input.addEventListener('midimessage', handleMessage as EventListener);
    cleanups.push(() => input.removeEventListener('midimessage', handleMessage as EventListener));
  });

  if (access.inputs.size === 0) {
    throw new Error('No MIDI devices found. Connect a keyboard via USB, then try again.');
  }

  return () => cleanups.forEach(fn => fn());
}
