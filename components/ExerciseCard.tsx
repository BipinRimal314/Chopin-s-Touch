import React, { useState, useEffect, useRef } from 'react';
import { Exercise } from '../types';
import PianoVisualizer from './PianoVisualizer';
import { Music, PlayCircle, Info, Volume2, Mic, MicOff, Check, RefreshCw } from 'lucide-react';
import { playSequence } from '../utils/audio';
import { startPitchDetection } from '../utils/pitchDetection';

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  
  const stopListeningRef = useRef<(() => void) | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stopListeningRef.current) stopListeningRef.current();
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const handlePlayDemo = async () => {
    if (isPlayingDemo) return;
    if (isPracticeMode) handleTogglePractice(); // Stop practice if demo starts
    setIsPlayingDemo(true);
    await playSequence(exercise.notes, 500);
    setIsPlayingDemo(false);
  };

  const handleTogglePractice = async () => {
    if (isPracticeMode) {
      // Stop logic
      setIsPracticeMode(false);
      setDetectedNote(null);
      setSuccessNote(null);
      setCurrentNoteIndex(0);
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
    } else {
      // Start logic
      setIsPracticeMode(true);
      setCurrentNoteIndex(0);
      setSuccessNote(null);
      
      try {
        const stopFn = await startPitchDetection((note) => {
           setDetectedNote(note);
        });
        stopListeningRef.current = stopFn;
      } catch (e) {
        console.error("Failed to start pitch detection", e);
        setIsPracticeMode(false);
      }
    }
  };

  const handleResetPractice = () => {
     setCurrentNoteIndex(0);
     setSuccessNote(null);
     setDetectedNote(null);
  };

  // Logic to check if played note matches target
  useEffect(() => {
    if (!isPracticeMode) return;
    
    const targetNote = exercise.notes[currentNoteIndex];
    if (!targetNote) return; // End of exercise

    // Simple check: does detected note equal target?
    // We can be lenient with octaves if needed, but for now exact match
    if (detectedNote === targetNote) {
       // Debounce to prevent rapid firing or noise errors
       if (debounceRef.current === null) {
          setSuccessNote(targetNote);
          // Advance to next note after short delay
          debounceRef.current = window.setTimeout(() => {
             setCurrentNoteIndex(prev => prev + 1);
             setSuccessNote(null);
             debounceRef.current = null;
          }, 400); // 400ms delay to show green success state
       }
    }
  }, [detectedNote, currentNoteIndex, exercise.notes, isPracticeMode]);

  const isComplete = isPracticeMode && currentNoteIndex >= exercise.notes.length;

  return (
    <div className="bg-stone-900 rounded-2xl p-6 shadow-xl border border-stone-800 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="px-3 py-1 bg-stone-800 text-stone-400 text-xs font-bold uppercase tracking-wider rounded-full border border-stone-700">
              {exercise.category}
            </span>
            <span className="px-3 py-1 bg-amber-900/30 text-amber-500 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-900/50">
              {exercise.type}
            </span>
          </div>
          <h2 className="text-3xl font-serif text-stone-100 mb-2">{exercise.title}</h2>
          <p className="text-stone-400 text-sm max-w-xl leading-relaxed">
            {exercise.description}
          </p>
        </div>
        <div className="mt-4 md:mt-0 p-4 bg-stone-950 rounded-lg border border-stone-800">
           <div className="text-center">
             <span className="block text-2xl font-bold text-amber-500">{exercise.key}</span>
             <span className="text-xs text-stone-500 uppercase tracking-widest">Key Signature</span>
           </div>
        </div>
      </div>

      {/* Visualizer Section */}
      <div className="mb-8 bg-stone-950/50 p-4 rounded-xl border border-stone-800/50 overflow-hidden relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-stone-500 text-sm">
             <Music size={16} />
             <span>{isPracticeMode ? 'Listening to your piano...' : 'Interactive Visualizer'}</span>
          </div>
          <button 
            onClick={handlePlayDemo}
            disabled={isPlayingDemo || isPracticeMode}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all
              ${isPlayingDemo 
                ? 'bg-amber-900/50 text-amber-500 cursor-wait' 
                : 'bg-stone-800 hover:bg-amber-900 text-stone-300 hover:text-white disabled:opacity-30'}`}
          >
            <Volume2 size={14} />
            {isPlayingDemo ? 'Playing...' : 'Hear Demo'}
          </button>
        </div>
        
        {/* Progress Bar for Practice Mode */}
        {isPracticeMode && (
          <div className="absolute top-0 left-0 w-full h-1 bg-stone-800 z-20">
            <div 
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${(currentNoteIndex / exercise.notes.length) * 100}%` }}
            />
          </div>
        )}

        {isComplete ? (
          <div className="h-48 flex flex-col items-center justify-center bg-stone-900/80 rounded-lg animate-in fade-in">
             <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
               <Check size={32} className="text-green-500" />
             </div>
             <h3 className="text-xl font-serif text-stone-100">Exercise Complete!</h3>
             <button onClick={handleResetPractice} className="mt-4 flex items-center gap-2 text-stone-400 hover:text-amber-500">
               <RefreshCw size={14} /> Practice Again
             </button>
          </div>
        ) : (
          <PianoVisualizer 
            highlightedNotes={isPracticeMode ? [] : exercise.notes} // Clear general highlights in practice mode to focus on active note
            activeNote={isPracticeMode ? exercise.notes[currentNoteIndex] : null}
            successNote={successNote}
            fingerings={exercise.fingerings}
            startOctave={3}
            octaveCount={2}
            interactive={!isPracticeMode}
          />
        )}
        
        <div className="mt-4 flex justify-between items-center text-sm text-stone-400">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isPracticeMode ? 'bg-amber-600 animate-pulse' : 'bg-amber-600'}`}></span>
              <span>{isPracticeMode ? 'Target Note' : 'Active Key'}</span>
            </div>
            {isPracticeMode && (
               <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-green-500"></span>
                 <span>Success</span>
               </div>
            )}
          </div>
          {isPracticeMode && (
             <div className="font-mono text-xs text-stone-600">
                Detected: {detectedNote || '...'}
             </div>
          )}
        </div>
      </div>

      {/* Control Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-stone-800/30 p-5 rounded-xl border border-stone-800">
          <h3 className="text-lg font-semibold text-stone-200 mb-3 flex items-center gap-2">
            <Info size={18} className="text-amber-500" />
            Chopin's Touch Points
          </h3>
          <ul className="space-y-3">
            {exercise.tips.map((tip, idx) => (
              <li key={idx} className="flex gap-3 text-stone-300 text-sm leading-relaxed">
                <span className="text-amber-500 font-serif font-bold italic">{idx + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div 
          onClick={handleTogglePractice}
          className={`
            flex flex-col justify-center items-center p-6 rounded-xl border text-center cursor-pointer transition-all
            ${isPracticeMode 
              ? 'bg-amber-900/20 border-amber-700/50 shadow-[0_0_30px_rgba(245,158,11,0.1)]' 
              : 'bg-gradient-to-br from-stone-800 to-stone-900 border-stone-700 hover:border-amber-700/50'}
          `}
        >
          <div className={`
             mb-3 p-4 rounded-full transition-all
             ${isPracticeMode ? 'bg-amber-600 text-white shadow-lg scale-110' : 'text-amber-500 opacity-80 hover:opacity-100 hover:bg-stone-800'}
          `}>
             {isPracticeMode ? <MicOff size={32} /> : <Mic size={32} />}
          </div>
          <h4 className={`font-medium ${isPracticeMode ? 'text-amber-500' : 'text-stone-200'}`}>
            {isPracticeMode ? 'Stop Practice Mode' : 'Start Practice Mode'}
          </h4>
          <p className="text-xs text-stone-500 mt-1">
            {isPracticeMode ? 'Listening for notes...' : 'Uses your microphone to track progress.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
