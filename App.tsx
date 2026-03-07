import React, { useState, useEffect, useRef } from 'react';
import { ListTodo, Library, BookOpen, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import CategoryView from './components/CategoryView';
import DailyDozenList from './components/DailyDozenList';
import ExerciseCard from './components/ExerciseCard';
import PiecesList from './components/PiecesList';
import PiecePlayer from './components/PiecePlayer';
import Settings from './components/Settings';
import StatsView from './components/StatsView';
import PracticeTimer from './components/PracticeTimer';
import { Exercise, Piece } from './types';
import { initAudio } from './utils/audio';
import { DAILY_DOZEN_IDS } from './constants';
import { saveSession, markExercisePracticed, markPracticeDay, checkAndUnlockAchievements, resetAllPracticeData } from './utils/storage';

type View = 'daily-dozen' | 'curriculum' | 'pieces' | 'stats' | 'exercise' | 'piece-player' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>(() => {
    return (localStorage.getItem('chopins-touch-view') as View) || 'daily-dozen';
  });
  const [previousView, setPreviousView] = useState<View>('daily-dozen');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('chopins-touch-completed') || '[]');
    } catch { return []; }
  });
  const [completedPieces, setCompletedPieces] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('chopins-touch-pieces') || '[]');
    } catch { return []; }
  });
  const audioInitRef = useRef(false);
  const sessionStartRef = useRef<number | null>(null);
  const prevViewRef = useRef(currentView);

  // Unlock iOS AudioContext on first user interaction
  useEffect(() => {
    const unlock = () => {
      if (!audioInitRef.current) {
        initAudio();
        audioInitRef.current = true;
        document.removeEventListener('touchstart', unlock);
        document.removeEventListener('click', unlock);
      }
    };
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('click', unlock, { once: true });
    return () => {
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
    };
  }, []);

  // Track session timing when entering/leaving exercise or piece views
  useEffect(() => {
    const wasActive = ['exercise', 'piece-player'].includes(prevViewRef.current);
    const isActive = ['exercise', 'piece-player'].includes(currentView);

    if (!wasActive && isActive) {
      sessionStartRef.current = Date.now();
    }

    if (wasActive && !isActive && sessionStartRef.current) {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      saveSession(elapsed);
      sessionStartRef.current = null;
    }

    prevViewRef.current = currentView;
  }, [currentView]);

  // Save completed exercises to localStorage
  useEffect(() => {
    try { localStorage.setItem('chopins-touch-completed', JSON.stringify(completedExercises)); } catch { /* QuotaExceededError */ }
  }, [completedExercises]);

  // Save completed pieces to localStorage
  useEffect(() => {
    try { localStorage.setItem('chopins-touch-pieces', JSON.stringify(completedPieces)); } catch { /* QuotaExceededError */ }
  }, [completedPieces]);

  // Save current view (but not exercise/piece-player — those need context)
  useEffect(() => {
    if (!['exercise', 'piece-player'].includes(currentView)) {
      try { localStorage.setItem('chopins-touch-view', currentView); } catch { /* QuotaExceededError */ }
    }
  }, [currentView]);

  const handleSelectExercise = (ex: Exercise) => {
    setPreviousView(currentView);
    setSelectedExercise(ex);
    setCurrentView('exercise');
  };

  const handleSelectPiece = (piece: Piece) => {
    setPreviousView(currentView);
    setSelectedPiece(piece);
    setCurrentView('piece-player');
  };

  const handleBack = () => {
    setCurrentView(previousView);
  };

  const handleCompleteExercise = (id: string) => {
    const updated = completedExercises.includes(id) ? completedExercises : [...completedExercises, id];
    setCompletedExercises(updated);
    markExercisePracticed(id);
    markPracticeDay();
    checkAndUnlockAchievements(updated, completedPieces, DAILY_DOZEN_IDS);
    setCurrentView(previousView);
  };

  const handleCompletePiece = (id: string) => {
    const updated = completedPieces.includes(id) ? completedPieces : [...completedPieces, id];
    setCompletedPieces(updated);
    markPracticeDay();
    checkAndUnlockAchievements(completedExercises, updated, DAILY_DOZEN_IDS);
    setCurrentView('pieces');
  };

  const handleResetProgress = () => {
    setCompletedExercises([]);
    setCompletedPieces([]);
    localStorage.removeItem('chopins-touch-completed');
    localStorage.removeItem('chopins-touch-pieces');
    resetAllPracticeData();
  };

  const viewTitle = () => {
    switch (currentView) {
      case 'daily-dozen': return 'Daily Dozen';
      case 'curriculum': return 'Curriculum';
      case 'pieces': return 'Learn';
      case 'stats': return 'Progress';
      case 'exercise': return selectedExercise?.title || 'Exercise';
      case 'piece-player': return selectedPiece?.title || 'Piece';
      case 'settings': return 'Settings';
    }
  };

  const TabButton = ({ view, icon: Icon, label }: { view: View; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      aria-label={label}
      aria-current={currentView === view ? 'page' : undefined}
      className={`
        flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[70px] min-h-[48px] rounded-xl transition-colors
        ${currentView === view
          ? 'text-amber-500'
          : 'text-stone-500 active:text-stone-300'}
      `}
    >
      <Icon size={22} strokeWidth={currentView === view ? 2.5 : 1.5} />
      <span className={`text-[10px] tracking-wide ${currentView === view ? 'font-semibold' : 'font-normal'}`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="h-dvh flex flex-col bg-stone-950 text-stone-100 font-sans">
      {/* Top Bar */}
      <header className="shrink-0 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/50 z-50">
        <div className="px-4 h-11 flex items-center gap-3">
          {/* Logo */}
          <div
            className="w-7 h-7 bg-amber-600 rounded-lg flex items-center justify-center transform rotate-3 shadow-lg shadow-amber-900/20 cursor-pointer active:scale-95"
            onClick={() => setCurrentView('daily-dozen')}
          >
            <span className="font-serif font-bold text-sm text-white italic">C</span>
          </div>
          <span className="text-sm text-stone-400 font-medium tracking-tight">{viewTitle()}</span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Practice Timer */}
          <PracticeTimer isActive={currentView === 'exercise' || currentView === 'piece-player'} />

          {/* Back button (when in exercise or piece-player) */}
          {(currentView === 'exercise' || currentView === 'piece-player') && (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="text-stone-500 active:text-amber-500 text-sm flex items-center gap-1 transition-colors min-h-[44px] min-w-[44px] justify-center"
            >
              <span className="text-lg">&#8592;</span> Back
            </button>
          )}

          {/* Settings gear (when NOT in exercise/piece/settings) */}
          {!['exercise', 'piece-player', 'settings'].includes(currentView) && (
            <button
              onClick={() => setCurrentView('settings')}
              aria-label="Settings"
              className="text-stone-500 active:text-amber-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <SettingsIcon size={18} />
            </button>
          )}

          {/* Back from settings */}
          {currentView === 'settings' && (
            <button
              onClick={() => setCurrentView(previousView)}
              aria-label="Go back"
              className="text-stone-500 active:text-amber-500 text-sm flex items-center gap-1 min-h-[44px] min-w-[44px] justify-center"
            >
              <span className="text-lg">&#8592;</span> Back
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-5xl mx-auto w-full px-4 py-4">

          {currentView === 'daily-dozen' && (
            <div className="animate-fade-in">
              <div className="mb-5">
                <h1 className="text-2xl md:text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 mb-1">
                  Daily Dozen
                </h1>
                <p className="text-stone-400 text-sm">
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
            <div className="animate-fade-in">
              <div className="mb-6 text-center">
                <h1 className="text-2xl md:text-3xl font-serif text-stone-100 mb-2">
                  The Full Curriculum
                </h1>
                <p className="text-stone-500 text-sm">
                  Explore exercises by category to target specific needs.
                </p>
              </div>
              <CategoryView
                onSelectExercise={handleSelectExercise}
                completedIds={completedExercises}
              />
            </div>
          )}

          {currentView === 'pieces' && (
            <div className="animate-fade-in">
              <PiecesList
                onSelectPiece={handleSelectPiece}
                completedPieceIds={completedPieces}
              />
            </div>
          )}

          {currentView === 'stats' && (
            <div className="animate-fade-in">
              <StatsView onSelectExercise={handleSelectExercise} />
            </div>
          )}

          {currentView === 'exercise' && selectedExercise && (
            <div className="animate-fade-in">
              <ExerciseCard
                exercise={selectedExercise}
                onComplete={() => handleCompleteExercise(selectedExercise.id)}
              />
            </div>
          )}

          {currentView === 'piece-player' && selectedPiece && (
            <div className="animate-fade-in">
              <PiecePlayer
                piece={selectedPiece}
                onComplete={() => handleCompletePiece(selectedPiece.id)}
              />
            </div>
          )}

          {currentView === 'settings' && (
            <div className="animate-fade-in">
              <Settings onResetProgress={handleResetProgress} />
            </div>
          )}

        </div>
      </main>

      {/* Bottom Tab Bar */}
      <nav aria-label="Main navigation" className="shrink-0 bg-stone-950/90 backdrop-blur-xl border-t border-stone-800/50 z-50">
        <div className="flex items-center justify-around max-w-lg mx-auto px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          <TabButton view="daily-dozen" icon={ListTodo} label="Daily Dozen" />
          <TabButton view="curriculum" icon={Library} label="Curriculum" />
          <TabButton view="pieces" icon={BookOpen} label="Learn" />
          <TabButton view="stats" icon={BarChart3} label="Progress" />
        </div>
      </nav>
    </div>
  );
}

export default App;
