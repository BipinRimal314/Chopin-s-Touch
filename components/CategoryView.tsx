import React from 'react';
import { CHOPIN_EXERCISES } from '../constants';
import { Exercise, ExerciseCategory } from '../types';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

interface CategoryViewProps {
  onSelectExercise: (ex: Exercise) => void;
  completedIds: string[];
}

const CategoryView: React.FC<CategoryViewProps> = ({ onSelectExercise, completedIds }) => {
  // Group exercises by category
  const categories = Object.values(ExerciseCategory);

  const getExercisesByCategory = (cat: ExerciseCategory) => {
    return CHOPIN_EXERCISES.filter(ex => ex.category === cat);
  };

  return (
    <div className="space-y-10">
      {categories.map((category) => {
        const exercises = getExercisesByCategory(category);
        if (exercises.length === 0) return (
          <div key={category} className="text-center py-8 text-stone-500 text-sm">
            No exercises yet in {category}.
          </div>
        );

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-4 mb-3 sticky top-0 bg-stone-950 py-2 z-10">
               <h2 className="text-xl md:text-2xl font-serif text-amber-500 shrink-0">{category}</h2>
               <div className="h-px bg-stone-800 flex-grow"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exercises.map((exercise) => {
                const isCompleted = completedIds.includes(exercise.id);
                return (
                  <div
                    key={exercise.id}
                    onClick={() => onSelectExercise(exercise)}
                    className={`
                      relative overflow-hidden p-5 md:p-6 rounded-xl border cursor-pointer transition-all duration-150 min-h-[120px]
                      ${isCompleted
                        ? 'bg-stone-900/40 border-stone-800 opacity-60'
                        : 'bg-stone-900 border-stone-800 active:border-amber-700/50 active:bg-stone-800 active:scale-[0.98]'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${isCompleted ? 'border-stone-700 text-stone-600' : 'border-stone-700 text-stone-400'}`}>
                        {exercise.type}
                      </span>
                      {isCompleted
                        ? <CheckCircle2 size={22} className="text-amber-800" />
                        : <Circle size={22} className="text-stone-700" />
                      }
                    </div>

                    <h3 className={`font-semibold text-lg mb-1 ${isCompleted ? 'text-stone-500 line-through' : 'text-stone-200'}`}>
                      {exercise.title}
                    </h3>

                    <p className="text-sm text-stone-500 line-clamp-2 mb-4">
                      {exercise.description}
                    </p>

                    <div className="flex items-center text-amber-700 text-xs font-bold uppercase tracking-widest active:text-amber-500 transition-colors">
                      Start Practice <ChevronRight size={14} className="ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryView;
