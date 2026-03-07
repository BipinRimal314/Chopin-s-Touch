import React, { useState } from 'react';
import { Mic2, Library, ListTodo } from 'lucide-react';
import CategoryView from './components/CategoryView';
import DailyDozenList from './components/DailyDozenList';
import ExerciseCard from './components/ExerciseCard';
import CoachChat from './components/CoachChat';
import { Exercise } from './types';

type View = 'curriculum' | 'daily-dozen' | 'exercise' | 'coach';

function App() {
  const [currentView, setCurrentView] = useState<View>('daily-dozen'); // Default to daily dozen for impact
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const handleSelectExercise = (ex: Exercise) => {
    setSelectedExercise(ex);
    setCurrentView('exercise');
  };

  const handleCompleteExercise = (id: string) => {
    if (!completedExercises.includes(id)) {
      setCompletedExercises([...completedExercises, id]);
    }
    // Return to the previous list view context
    // If selectedExercise was part of daily dozen, go back to daily dozen?
    // For simplicity, we can default back to what makes sense or last view.
    // Let's check where we came from roughly or just default to Daily Dozen if likely.
    setCurrentView('daily-dozen'); 
  };

  const NavButton = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
     <button 
      onClick={() => setCurrentView(view)}
      className={`p-2 rounded-full transition-all group relative ${currentView === view ? 'bg-stone-800 text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}
      title={label}
    >
      <Icon size={20} />
      {currentView === view && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full"></span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-950/80 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('daily-dozen')}>
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center transform rotate-3 shadow-lg shadow-amber-900/20">
              <span className="font-serif font-bold text-lg text-white italic">C</span>
            </div>
            <h1 className="font-serif text-xl font-medium tracking-tight">Chopin's Touch</h1>
          </div>
          <nav className="flex gap-2 bg-stone-900 p-1.5 rounded-full border border-stone-800 shadow-xl">
             <NavButton view="daily-dozen" icon={ListTodo} label="Daily Dozen" />
             <NavButton view="curriculum" icon={Library} label="Full Curriculum" />
             <NavButton view="coach" icon={Mic2} label="AI Coach" />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        
        {currentView === 'daily-dozen' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-8">
               <h1 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 mb-2">
                 Daily Dozen
               </h1>
               <p className="text-stone-400">
                 A sequential routine to build your foundation every single day.
               </p>
             </div>
             <DailyDozenList 
                onSelectExercise={handleSelectExercise} 
                completedIds={completedExercises}
             />
          </div>
        )}

        {currentView === 'curriculum' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10 text-center">
               <h1 className="text-3xl font-serif text-stone-100 mb-3">
                 The Full Curriculum
               </h1>
               <p className="text-stone-500">
                 Explore exercises by category to target specific needs.
               </p>
            </div>
            <CategoryView 
              onSelectExercise={handleSelectExercise} 
              completedIds={completedExercises}
            />
          </div>
        )}

        {currentView === 'exercise' && selectedExercise && (
          <div className="animate-in zoom-in-95 duration-300">
            <div className="mb-4">
              <button 
                onClick={() => setCurrentView('daily-dozen')}
                className="text-stone-500 hover:text-amber-500 text-sm flex items-center gap-1 mb-4 transition-colors group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Routine
              </button>
            </div>
            <ExerciseCard exercise={selectedExercise} />
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => handleCompleteExercise(selectedExercise.id)}
                className="px-8 py-3 bg-amber-700 hover:bg-amber-600 text-white font-medium rounded-full shadow-lg shadow-amber-900/20 transition-all hover:scale-105 active:scale-95"
              >
                Mark Complete
              </button>
            </div>
          </div>
        )}

        {currentView === 'coach' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
             <div className="mb-6 text-center">
               <h2 className="text-2xl font-serif text-stone-200">The Master Class</h2>
               <p className="text-stone-500 text-sm">Ask about technique, repertoire, or physiology.</p>
             </div>
             <CoachChat />
           </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-stone-600 text-xs border-t border-stone-900 mt-auto">
        <p>Inspired by the teaching methods of Frédéric Chopin.</p>
      </footer>
    </div>
  );
}

export default App;
