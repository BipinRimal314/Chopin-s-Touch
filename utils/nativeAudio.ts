/**
 * NativeAudio wrapper for iOS playback via @capacitor-community/native-audio.
 *
 * On native platforms (iOS), audio is played through AVAudioPlayer which
 * bypasses WKWebView's AudioContext restrictions. On web, this module is
 * a no-op and the existing Web Audio synthesis is used instead.
 */

import { Capacitor } from '@capacitor/core';
import { NativeAudio } from '@capacitor-community/native-audio';

export const isNativePlatform = Capacitor.isNativePlatform();

let loaded = false;
let loading = false;
let masterVolume = 0.7;

// Track which notes are currently playing (for stopAll)
const playingNotes = new Set<string>();

// All notes we preload, using sharp names as canonical IDs
const ALL_NOTE_IDS = [
  'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
  'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
  'C6',
];

// Flat → sharp normalization
const FLAT_TO_SHARP: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
};

/** Normalize flat note names to their sharp equivalents. */
function normalizeToSharp(noteName: string): string {
  for (const [flat, sharp] of Object.entries(FLAT_TO_SHARP)) {
    if (noteName.startsWith(flat)) {
      return noteName.replace(flat, sharp);
    }
  }
  return noteName;
}

/** Convert note name to file-safe name (C#3 → Cs3). */
function toFileName(noteId: string): string {
  return noteId.replace('#', 's');
}

/**
 * Preload all piano note samples into native audio buffers.
 * Call once on app startup. No-op on web.
 */
export async function preloadNativeAudio(): Promise<void> {
  if (!isNativePlatform || loaded || loading) return;
  loading = true;

  try {
    await Promise.all(
      ALL_NOTE_IDS.map((noteId) =>
        NativeAudio.preload({
          assetId: noteId,
          assetPath: `public/audio/notes/${toFileName(noteId)}.wav`,
          audioChannelNum: 1,
          isUrl: false,
        }).catch((err) => {
          console.warn(`NativeAudio: failed to preload ${noteId}:`, err);
        })
      )
    );
    loaded = true;
    console.log('NativeAudio: all notes preloaded');
  } catch (err) {
    console.error('NativeAudio: preload failed:', err);
  } finally {
    loading = false;
  }
}

/**
 * Play a note using native audio. Handles flat/sharp normalization.
 * No-op if not on native platform or notes haven't been preloaded.
 */
export function playNativeNote(noteName: string): void {
  if (!loaded) return;
  const id = normalizeToSharp(noteName);
  playingNotes.add(id);
  NativeAudio.setVolume({ assetId: id, volume: masterVolume }).catch(() => {});
  NativeAudio.play({ assetId: id }).catch(() => {});
}

/**
 * Stop a currently playing note.
 */
export function stopNativeNote(noteName: string): void {
  if (!loaded) return;
  const id = normalizeToSharp(noteName);
  playingNotes.delete(id);
  NativeAudio.stop({ assetId: id }).catch(() => {});
}

/**
 * Stop all currently playing notes.
 */
export function stopAllNativeNotes(): void {
  if (!loaded) return;
  for (const id of playingNotes) {
    NativeAudio.stop({ assetId: id }).catch(() => {});
  }
  playingNotes.clear();
}

/**
 * Set the master volume level (applied per-note before each play).
 */
export function setNativeVolume(level: number): void {
  masterVolume = Math.max(0, Math.min(1, level));
}

/**
 * Get the current master volume level.
 */
export function getNativeVolume(): number {
  return masterVolume;
}

/**
 * Check if NativeAudio is ready (native platform + preloaded).
 */
export function isNativeAudioReady(): boolean {
  return isNativePlatform && loaded;
}
