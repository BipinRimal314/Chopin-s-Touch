import React from 'react';
import { CHOPIN_EXERCISES, DAILY_DOZEN_IDS } from '../constants';
import { Exercise } from '../types';
import { CheckCircle2, Circle, Lock, Play } from 'lucide-react';

interface DailyDozenListProps {
  onSelectExercise: (ex: Exercise) => void;
  completedIds: string[];
}

const DailyDozenList: React.FC<DailyDozenListProps> = ({ onSelectExercise, completedIds }) => {
  // Filter and sort exercises based on the defined daily dozen order
  const dailyDozenExercises = DAILY_DOZEN_IDS.map(id =>
    CHOPIN_EXERCISES.find(ex => ex.id === id)
  ).filter((ex): ex is Exercise => !!ex);

  const completedCount = dailyDozenExercises.filter(ex => completedIds.includes(ex.id)).length;
  const progressPercentage = Math.round((completedCount / 12) * 100);

  return (
    <div className="space-y-5">
      {/* Header & Progress */}
      <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800">
        <div className="flex justify-between items-end mb-3">
          <div>
             <h2 className="text-xl md:text-2xl font-serif text-amber-500 mb-1">Your Daily Dozen</h2>
             <p className="text-stone-400 text-sm">Consistency is the key to virtuosity.</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-stone-200">{completedCount}</span>
            <span className="text-stone-500 text-lg">/12</span>
          </div>
        </div>

        <div className="h-2.5 bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-700 to-amber-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {dailyDozenExercises.map((exercise, index) => {
          const isCompleted = completedIds.includes(exercise.id);

          return (
            <div
              key={exercise.id}
              onClick={() => onSelectExercise(exercise)}
              className={`
                relative flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-150
                min-h-[64px]
                ${isCompleted
                  ? 'bg-stone-900/40 border-stone-800 opacity-60'
                  : 'bg-stone-900 border-stone-800 active:border-amber-700/50 active:bg-stone-800 active:scale-[0.98]'}
              `}
            >
              <div className={`
                shrink-0 flex items-center justify-center w-9 h-9 rounded-full border
                ${isCompleted
                  ? 'border-amber-700 bg-amber-900/30'
                  : 'border-stone-700 bg-stone-800'}
                text-sm font-mono
              `}>
                {isCompleted
                  ? <CheckCircle2 size={18} className="text-amber-600" />
                  : <span className="text-stone-400 font-bold">{index + 1}</span>
                }
              </div>

              <div className="grow min-w-0">
                <h3 className={`font-semibold text-sm truncate ${isCompleted ? 'text-stone-500 line-through' : 'text-stone-200'}`}>
                  {exercise.title}
                </h3>
                <p className="text-xs text-stone-500 truncate">{exercise.type} &middot; {exercise.difficulty}</p>
              </div>

              {!isCompleted && (
                <div className="shrink-0 text-amber-500/50 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <Play size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center py-6 border-t border-stone-800 mt-4">
        <p className="text-stone-500 italic text-sm max-w-lg mx-auto">
          "Put all your soul into it, play the way you feel!" <br/> — Frederic Chopin
        </p>
      </div>
    </div>
  );
};

export default DailyDozenList;
