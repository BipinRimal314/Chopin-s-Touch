import React from 'react';
import { CHOPIN_EXERCISES } from '../constants';
import { Exercise } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface DailyRoutineProps {
  onSelectExercise: (ex: Exercise) => void;
  completedIds: string[];
}

const DailyRoutine: React.FC<DailyRoutineProps> = ({ onSelectExercise, completedIds }) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif text-stone-100">Today's Etude</h2>
        <p className="text-stone-400">"Simplicity is the final achievement." — Frédéric Chopin</p>
      </div>

      <div className="grid gap-4">
        {CHOPIN_EXERCISES.map((exercise) => {
          const isCompleted = completedIds.includes(exercise.id);
          return (
            <div 
              key={exercise.id}
              onClick={() => onSelectExercise(exercise)}
              className={`
                group flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200
                ${isCompleted 
                  ? 'bg-stone-900/40 border-stone-800 opacity-60' 
                  : 'bg-stone-900 border-stone-800 hover:border-amber-700/50 hover:bg-stone-800'}
              `}
            >
              <div className="shrink-0 text-amber-600">
                {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </div>
              <div className="grow">
                <h3 className={`font-semibold text-lg ${isCompleted ? 'text-stone-500 line-through' : 'text-stone-200 group-hover:text-amber-100'}`}>
                  {exercise.title}
                </h3>
                <p className="text-sm text-stone-500">{exercise.type} • {exercise.difficulty}</p>
              </div>
              <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider border border-amber-500/30 px-2 py-1 rounded">
                  Start
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 p-6 bg-amber-950/20 border border-amber-900/30 rounded-xl text-center">
         <p className="text-amber-200/80 italic text-sm">
           Tip: Start with B Major to position your hand naturally. The thumb finds its place on B and E, while the longer fingers rest on the black keys.
         </p>
      </div>
    </div>
  );
};

export default DailyRoutine;
