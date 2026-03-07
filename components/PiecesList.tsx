import React from 'react';
import { PIECES } from '../data/pieces';
import { Piece } from '../types';
import { Music, ChevronRight, Star } from 'lucide-react';

interface PiecesListProps {
  onSelectPiece: (piece: Piece) => void;
  completedPieceIds: string[];
}

const LEVEL_LABELS: Record<number, { label: string; description: string }> = {
  1: { label: 'Level 1 — First Melodies', description: 'Simple tunes with 5 notes. Perfect starting point.' },
  2: { label: 'Level 2 — Building Range', description: 'Wider patterns and classical themes.' },
  3: { label: 'Level 3 — Expression', description: 'Phrasing, rubato, and emotional depth.' },
  4: { label: 'Level 4 — Chopin\'s Music', description: 'The master\'s own compositions.' },
};

const PiecesList: React.FC<PiecesListProps> = ({ onSelectPiece, completedPieceIds }) => {
  const levels = [1, 2, 3, 4] as const;

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 mb-1">
          Learn to Play
        </h1>
        <p className="text-stone-400 text-sm">
          12 pieces from beginner to Chopin. Master each level before moving on.
        </p>
      </div>

      {levels.map(level => {
        const levelPieces = PIECES.filter(p => p.level === level);
        const info = LEVEL_LABELS[level];
        const completedInLevel = levelPieces.filter(p => completedPieceIds.includes(p.id)).length;

        return (
          <div key={level} className="space-y-3">
            <div className="flex items-center gap-3 sticky top-0 bg-stone-950 py-2 z-10">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: level }).map((_, i) => (
                    <Star key={i} size={12} className="text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <h2 className="text-lg font-serif text-amber-500">{info.label}</h2>
              </div>
              <div className="h-px bg-stone-800 flex-grow" />
              <span className="text-xs text-stone-600">{completedInLevel}/{levelPieces.length}</span>
            </div>
            <p className="text-stone-500 text-xs mb-2">{info.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {levelPieces.map(piece => {
                const isCompleted = completedPieceIds.includes(piece.id);
                return (
                  <div
                    key={piece.id}
                    onClick={() => onSelectPiece(piece)}
                    className={`
                      p-5 rounded-xl border cursor-pointer transition-all duration-150
                      ${isCompleted
                        ? 'bg-stone-900/40 border-stone-800 opacity-60'
                        : 'bg-stone-900 border-stone-800 active:border-amber-700/50 active:bg-stone-800 active:scale-[0.98]'}
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Music size={18} className={isCompleted ? 'text-amber-800' : 'text-amber-500'} />
                      <span className="text-xs text-stone-600">{piece.tempo} BPM</span>
                    </div>
                    <h3 className={`font-semibold mb-0.5 ${isCompleted ? 'text-stone-500 line-through' : 'text-stone-200'}`}>
                      {piece.title}
                    </h3>
                    <p className="text-xs text-stone-500 mb-3">{piece.composer}</p>
                    <p className="text-xs text-stone-500 line-clamp-2 mb-3">{piece.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-600">{piece.key} &middot; {piece.sections.length} section{piece.sections.length > 1 ? 's' : ''}</span>
                      <ChevronRight size={14} className="text-amber-700" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="text-center py-6 border-t border-stone-800 mt-4">
        <p className="text-stone-500 italic text-sm max-w-lg mx-auto">
          "After one has played a vast quantity of notes, it is simplicity that emerges as the crowning reward of art." — Frederic Chopin
        </p>
      </div>
    </div>
  );
};

export default PiecesList;
