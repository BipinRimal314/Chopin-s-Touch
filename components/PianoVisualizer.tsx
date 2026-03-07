import React, { useCallback, useMemo, useRef } from 'react';
import { NoteConfig } from '../types';
import { PIANO_KEYS_OCTAVE } from '../constants';
import { playNote, stopNote, ensureAudioReady } from '../utils/audio';
import { tapHaptic } from '../utils/haptics';

interface PianoVisualizerProps {
  highlightedNotes?: string[]; // General highlights (e.g. scale members)
  activeNote?: string | null; // The specific note user needs to play (Practice Mode)
  successNote?: string | null; // The note user successfully played
  fingerings?: { note: string; finger: number; hand: 'left' | 'right' }[];
  startOctave?: number;
  octaveCount?: number;
  interactive?: boolean;
}

const PianoVisualizer: React.FC<PianoVisualizerProps> = ({
  highlightedNotes = [],
  activeNote = null,
  successNote = null,
  fingerings = [],
  startOctave = 3,
  octaveCount = 2,
  interactive = true,
}) => {
  const activeTouchesRef = useRef<Map<number, string>>(new Map());

  // Generate the full range of keys based on octaves (memoized)
  const { allKeys, whiteKeys, blackKeys } = useMemo(() => {
    const keys: { noteName: string; octave: number; isBlack: boolean; id: string }[] = [];
    for (let o = 0; o < octaveCount; o++) {
      const currentOctave = startOctave + o;
      PIANO_KEYS_OCTAVE.forEach((k) => {
        keys.push({
          noteName: k.name,
          octave: currentOctave,
          isBlack: k.isBlack,
          id: `${k.name}${currentOctave}`,
        });
      });
    }
    // Add one extra C at the end to close the piano nicely
    keys.push({ noteName: 'C', octave: startOctave + octaveCount, isBlack: false, id: `C${startOctave + octaveCount}` });
    return {
      allKeys: keys,
      whiteKeys: keys.filter(k => !k.isBlack),
      blackKeys: keys.filter(k => k.isBlack),
    };
  }, [startOctave, octaveCount]);

  const getFingerForNote = (noteId: string) => {
    return fingerings.find((f) => f.note === noteId)?.finger;
  };

  const isHighlighted = (noteId: string) => {
    return highlightedNotes.includes(noteId);
  };

  const handleNotePlay = useCallback((noteId: string) => {
    if (interactive) {
      ensureAudioReady();
      playNote(noteId);
      tapHaptic();
    }
  }, [interactive]);

  // Multi-touch handler: plays notes for all changed touches
  const handleTouchStart = useCallback((e: React.TouchEvent, noteId: string) => {
    e.preventDefault(); // Prevent iOS delay and scroll
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (!activeTouchesRef.current.has(touch.identifier)) {
        activeTouchesRef.current.set(touch.identifier, noteId);
        handleNotePlay(noteId);
      }
    }
  }, [handleNotePlay]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const noteId = activeTouchesRef.current.get(touch.identifier);
      if (noteId && interactive) {
        stopNote(noteId);
      }
      activeTouchesRef.current.delete(touch.identifier);
    }
  }, [interactive]);

  // Helper to determine key color classes based on state
  const getWhiteKeyColor = (keyId: string) => {
    const isTarget = activeNote === keyId;
    const isSuccess = successNote === keyId;
    const isGeneralHighlight = isHighlighted(keyId);

    if (isSuccess) return 'bg-green-100 shadow-[inset_0_-10px_20px_rgba(34,197,94,0.4)] scale-[0.97]';
    if (isTarget) return 'bg-amber-100 shadow-[inset_0_-10px_20px_rgba(251,191,36,0.6)] animate-pulse';
    if (isGeneralHighlight) return 'bg-amber-50 shadow-[inset_0_-10px_20px_rgba(251,191,36,0.3)]';
    return 'bg-white';
  };

  const getBlackKeyColor = (keyId: string) => {
    const isTarget = activeNote === keyId;
    const isSuccess = successNote === keyId;
    const isGeneralHighlight = isHighlighted(keyId);

    if (isSuccess) return 'bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-[0.97]';
    if (isTarget) return 'bg-amber-600 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse';
    if (isGeneralHighlight) return 'bg-amber-900 border-amber-500';
    return 'bg-stone-900 border-stone-700';
  };

  // Compute black key position: for each black key, find which white key index it falls after
  const getBlackKeyPosition = (blackKey: typeof allKeys[0]) => {
    // Find the index of the white key just before this black key in the allKeys array
    const blackIdx = allKeys.indexOf(blackKey);
    // Count how many white keys come before this black key
    let whiteKeysBefore = 0;
    for (let i = 0; i < blackIdx; i++) {
      if (!allKeys[i].isBlack) whiteKeysBefore++;
    }
    // Position the black key between whiteKeysBefore-1 and whiteKeysBefore
    // Each white key is 1/totalWhiteKeys of the width
    // Black key center should be at (whiteKeysBefore / totalWhiteKeys * 100)%
    const totalWhiteKeys = whiteKeys.length;
    const leftPercent = (whiteKeysBefore / totalWhiteKeys) * 100;
    return leftPercent;
  };

  return (
    <div className="relative w-full select-none touch-none">
      {/* Piano container */}
      <div className="relative h-[200px] landscape:h-[40vh] w-full bg-stone-900 rounded-t-lg shadow-2xl border-t-4 border-amber-900/50 overflow-hidden">

        {/* White Keys */}
        <div className="flex h-full w-full">
          {whiteKeys.map((key) => {
            const finger = getFingerForNote(key.id);
            const isTargetOrHighlight = isHighlighted(key.id) || activeNote === key.id;

            return (
              <div
                key={key.id}
                role="button"
                aria-label={`Piano key ${key.id}`}
                onMouseDown={() => handleNotePlay(key.id)}
                onMouseUp={() => {}}
                onTouchStart={(e) => handleTouchStart(e, key.id)}
                onTouchEnd={handleTouchEnd}
                className={`
                  piano-key relative flex-1 h-full border-r border-stone-300 last:border-r-0 rounded-b-md
                  flex items-end justify-center pb-2 transition-all duration-75 cursor-pointer
                  active:scale-[0.97] active:bg-stone-200
                  ${getWhiteKeyColor(key.id)}
                `}
              >
                {isTargetOrHighlight && finger && (
                  <div className={`
                    absolute bottom-8 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-md z-10 pointer-events-none transition-colors
                    ${successNote === key.id ? 'bg-green-600 text-white' : 'bg-amber-600 text-white'}
                  `}>
                    {finger}
                  </div>
                )}
                {isTargetOrHighlight && (
                  <span className="text-[11px] text-stone-500 font-mono pointer-events-none select-none">{key.id}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Black Keys Layer - absolutely positioned */}
        {blackKeys.map((key) => {
          const finger = getFingerForNote(key.id);
          const isTargetOrHighlight = isHighlighted(key.id) || activeNote === key.id;
          const leftPercent = getBlackKeyPosition(key);
          // Black key width: roughly 60% of a white key width
          const blackKeyWidthPercent = (1 / whiteKeys.length) * 60;

          return (
            <div
              key={key.id}
              role="button"
              aria-label={`Piano key ${key.id}`}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleNotePlay(key.id);
              }}
              onMouseUp={() => {}}
              onTouchStart={(e) => {
                e.stopPropagation();
                handleTouchStart(e, key.id);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                handleTouchEnd(e);
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: `${leftPercent}%`,
                width: `${blackKeyWidthPercent}%`,
                height: '60%',
                transform: 'translateX(-50%)',
                zIndex: 20,
              }}
              className={`
                piano-key rounded-b-lg shadow-lg border border-stone-700
                flex items-end justify-center pb-2 transition-all duration-75 cursor-pointer
                active:scale-[0.97] active:brightness-125
                ${getBlackKeyColor(key.id)}
              `}
            >
              {isTargetOrHighlight && finger && (
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md pointer-events-none transition-colors
                  ${successNote === key.id ? 'bg-green-500 text-stone-900' : 'bg-amber-500 text-stone-900'}
                `}>
                  {finger}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PianoVisualizer;
