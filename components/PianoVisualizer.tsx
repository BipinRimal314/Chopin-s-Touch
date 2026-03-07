import React from 'react';
import { NoteConfig } from '../types';
import { PIANO_KEYS_OCTAVE } from '../constants';
import { playNote } from '../utils/audio';

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
  // Generate the full range of keys based on octaves
  const allKeys: { noteName: string; octave: number; isBlack: boolean; id: string }[] = [];
  
  for (let o = 0; o < octaveCount; o++) {
    const currentOctave = startOctave + o;
    PIANO_KEYS_OCTAVE.forEach((k) => {
      allKeys.push({
        noteName: k.name,
        octave: currentOctave,
        isBlack: k.isBlack,
        id: `${k.name}${currentOctave}`, // Matches "B3", "C#4" format
      });
    });
  }
  // Add one extra C at the end to close the piano nicely
  allKeys.push({ noteName: 'C', octave: startOctave + octaveCount, isBlack: false, id: `C${startOctave + octaveCount}` });

  const getFingerForNote = (noteId: string) => {
    return fingerings.find((f) => f.note === noteId)?.finger;
  };

  const isHighlighted = (noteId: string) => {
    return highlightedNotes.includes(noteId);
  };

  const handleNoteClick = (noteId: string) => {
    if (interactive) {
      playNote(noteId);
    }
  };

  // Helper to determine key color classes based on state
  const getKeyColor = (key: { id: string; isBlack: boolean }) => {
    const isTarget = activeNote === key.id;
    const isSuccess = successNote === key.id;
    const isGeneralHighlight = isHighlighted(key.id);

    if (key.isBlack) {
      if (isSuccess) return 'bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-[0.98]';
      if (isTarget) return 'bg-amber-600 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse';
      if (isGeneralHighlight) return 'bg-amber-900 border-amber-500';
      return 'bg-stone-900 border-stone-800';
    } else {
      // White keys
      if (isSuccess) return 'bg-green-100 shadow-[inset_0_-10px_20px_rgba(34,197,94,0.4)] scale-[0.98]';
      if (isTarget) return 'bg-amber-100 shadow-[inset_0_-10px_20px_rgba(251,191,36,0.6)] animate-pulse';
      if (isGeneralHighlight) return 'bg-amber-50 shadow-[inset_0_-10px_20px_rgba(251,191,36,0.3)]';
      return 'bg-white hover:bg-stone-50';
    }
  };

  return (
    <div className="relative w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex relative h-48 select-none mx-auto w-fit bg-stone-900 p-1 rounded-t-lg shadow-2xl border-t-4 border-amber-900/50">
        {allKeys.map((key) => {
          const finger = getFingerForNote(key.id);
          const isTargetOrHighlight = isHighlighted(key.id) || activeNote === key.id;
          
          if (key.isBlack) return null; // We render black keys absolutely positioned later
          
          // White Keys
          return (
            <div
              key={key.id}
              onMouseDown={() => handleNoteClick(key.id)}
              className={`
                relative w-12 h-full border-r border-stone-300 last:border-r-0 rounded-b-md
                flex items-end justify-center pb-2 transition-all duration-150 cursor-pointer
                active:bg-stone-300 active:scale-[0.98]
                ${getKeyColor(key)}
              `}
            >
              {isTargetOrHighlight && finger && (
                <div className={`
                  absolute bottom-4 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shadow-sm z-10 pointer-events-none transition-colors
                  ${successNote === key.id ? 'bg-green-600 text-white' : 'bg-amber-600 text-white'}
                `}>
                  {finger}
                </div>
              )}
               <span className="text-[10px] text-stone-400 font-mono mb-[-4px] pointer-events-none">{key.id}</span>
            </div>
          );
        })}

        {/* Black Keys Layer */}
        <div className="absolute top-0 left-0 flex h-32 w-full pointer-events-none">
           {allKeys.map((key, idx) => {
             if (!key.isBlack) return <div key={`spacer-${idx}`} className="w-12 shrink-0 opacity-0"></div>; // Spacer matching white key width
             
             const finger = getFingerForNote(key.id);
             const isTargetOrHighlight = isHighlighted(key.id) || activeNote === key.id;

             return (
               <div
                 key={key.id}
                 className="w-0 shrink-0 flex justify-center z-20"
               >
                 <div 
                    onMouseDown={(e) => {
                      e.stopPropagation(); // Prevent clicking white key underneath
                      handleNoteClick(key.id);
                    }}
                    className={`
                    w-8 h-32 ml-[-2rem] rounded-b-lg shadow-lg border border-stone-800
                    flex items-end justify-center pb-2 transition-all duration-150 cursor-pointer pointer-events-auto
                    active:scale-[0.98] active:bg-stone-800
                    ${getKeyColor(key)}
                 `}>
                    {isTargetOrHighlight && finger && (
                      <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm pointer-events-none transition-colors
                        ${successNote === key.id ? 'bg-green-500 text-stone-900' : 'bg-amber-500 text-stone-900'}
                      `}>
                        {finger}
                      </div>
                    )}
                 </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};

export default PianoVisualizer;
