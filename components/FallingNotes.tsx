import React, { useMemo } from 'react';
import { PIANO_KEYS_OCTAVE } from '../constants';

// Flat-to-sharp map (mirrors pitchDetection.ts but kept local to avoid circular deps)
const FLAT_TO_SHARP: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#',
  'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
};

function normalizeToSharp(note: string): string {
  const match = note.match(/^([A-G][b#]?)(\d+)$/);
  if (!match) return note;
  const [, name, octave] = match;
  const normalized = FLAT_TO_SHARP[name] || name;
  return `${normalized}${octave}`;
}

interface FallingNotesProps {
  notes: string[];
  currentIndex: number;
  startOctave: number;
  octaveCount: number;
}

const VISIBLE_COUNT = 8; // Current target + 7 upcoming
const WATERFALL_HEIGHT = 150;

const FallingNotes: React.FC<FallingNotesProps> = ({
  notes,
  currentIndex,
  startOctave,
  octaveCount,
}) => {
  // Build the same key layout that PianoVisualizer uses so positions align exactly
  const { whiteKeys, allKeys } = useMemo(() => {
    const keys: { name: string; octave: number; isBlack: boolean; id: string }[] = [];
    for (let o = 0; o < octaveCount; o++) {
      const currentOctave = startOctave + o;
      PIANO_KEYS_OCTAVE.forEach((k) => {
        keys.push({
          name: k.name,
          octave: currentOctave,
          isBlack: k.isBlack,
          id: `${k.name}${currentOctave}`,
        });
      });
    }
    // Extra C at the end, same as PianoVisualizer
    keys.push({ name: 'C', octave: startOctave + octaveCount, isBlack: false, id: `C${startOctave + octaveCount}` });
    return {
      allKeys: keys,
      whiteKeys: keys.filter(k => !k.isBlack),
    };
  }, [startOctave, octaveCount]);

  const totalWhiteKeys = whiteKeys.length;

  // Map a note ID (normalized to sharps) to its horizontal position and whether it is black
  const getNotePosition = useMemo(() => {
    const cache = new Map<string, { leftPercent: number; isBlack: boolean } | null>();

    return (noteId: string): { leftPercent: number; isBlack: boolean } | null => {
      const normalized = normalizeToSharp(noteId);
      if (cache.has(normalized)) return cache.get(normalized)!;

      const keyIdx = allKeys.findIndex(k => k.id === normalized);
      if (keyIdx === -1) {
        cache.set(normalized, null);
        return null;
      }

      const key = allKeys[keyIdx];

      if (key.isBlack) {
        // Black key: count white keys before it, position at that boundary
        let whiteKeysBefore = 0;
        for (let i = 0; i < keyIdx; i++) {
          if (!allKeys[i].isBlack) whiteKeysBefore++;
        }
        const leftPercent = (whiteKeysBefore / totalWhiteKeys) * 100;
        const result = { leftPercent, isBlack: true };
        cache.set(normalized, result);
        return result;
      } else {
        // White key: find its index among white keys, center within that slot
        const whiteIdx = whiteKeys.findIndex(w => w.id === normalized);
        if (whiteIdx === -1) {
          cache.set(normalized, null);
          return null;
        }
        const leftPercent = ((whiteIdx + 0.5) / totalWhiteKeys) * 100;
        const result = { leftPercent, isBlack: false };
        cache.set(normalized, result);
        return result;
      }
    };
  }, [allKeys, whiteKeys, totalWhiteKeys]);

  // Slice the visible window: current note + next N-1
  const visibleNotes = useMemo(() => {
    const slice: { note: string; offset: number }[] = [];
    for (let i = 0; i < VISIBLE_COUNT; i++) {
      const idx = currentIndex + i;
      if (idx >= notes.length) break;
      slice.push({ note: notes[idx], offset: i });
    }
    return slice;
  }, [notes, currentIndex]);

  if (visibleNotes.length === 0) return null;

  const whiteKeyWidthPercent = 100 / totalWhiteKeys;
  const blackKeyWidthPercent = whiteKeyWidthPercent * 0.6;

  return (
    <div
      className="relative w-full pointer-events-none overflow-hidden"
      style={{ height: WATERFALL_HEIGHT }}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-950/40 to-transparent" />

      {/* Guideline at the bottom where notes "land" */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-amber-700/40" />

      {visibleNotes.map(({ note, offset }, i) => {
        const pos = getNotePosition(note);
        if (!pos) return null;

        const isCurrent = offset === 0;
        const isBlack = pos.isBlack;

        // Vertical position: current note at the very bottom, each subsequent note higher
        // Reserve ~20px per row, with the current note flush at the bottom
        const barHeight = isBlack ? 16 : 20;
        const rowSpacing = (WATERFALL_HEIGHT - barHeight) / (VISIBLE_COUNT - 1);
        const bottomPx = offset * rowSpacing;

        // Opacity fades as notes get further from current
        const opacity = isCurrent ? 1 : Math.max(0.15, 1 - offset * 0.12);

        const widthPercent = isBlack ? blackKeyWidthPercent : whiteKeyWidthPercent * 0.85;

        return (
          <div
            key={`${currentIndex}-${i}`}
            className={`
              absolute rounded-sm
              transition-all duration-300 ease-out
              ${isCurrent
                ? 'shadow-[0_0_12px_rgba(245,158,11,0.6),0_0_4px_rgba(245,158,11,0.8)]'
                : ''
              }
            `}
            style={{
              left: `${pos.leftPercent}%`,
              bottom: bottomPx,
              width: `${widthPercent}%`,
              height: barHeight,
              transform: 'translateX(-50%)',
              opacity,
              backgroundColor: isCurrent
                ? '#f59e0b' // amber-500
                : isBlack
                  ? '#78716c' // stone-500
                  : '#a8a29e', // stone-400
              zIndex: isCurrent ? 5 : isBlack ? 3 : 2,
            }}
          >
            {/* Note label on current target */}
            {isCurrent && (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-stone-900 select-none">
                {note}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FallingNotes;
