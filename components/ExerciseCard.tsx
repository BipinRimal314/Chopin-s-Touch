import React, { useState, useEffect, useRef } from 'react';
import { Exercise, ExerciseType } from '../types';
import PianoVisualizer from './PianoVisualizer';
import FallingNotes from './FallingNotes';
import DynamicsMeter from './DynamicsMeter';
import { Music, Volume2, Mic, MicOff, Check, RefreshCw, Info, Brain, BookOpen, Timer, Loader2, Piano } from 'lucide-react';
import { playSequence, stopSequence, ensureAudioReady } from '../utils/audio';
import { startPitchDetection, normalizeNoteName } from '../utils/pitchDetection';
import { startDynamicsDetection } from '../utils/dynamics';
import type { DynamicLevel } from '../utils/dynamics';
import { startMetronome, stopMetronome, setMetronomeBPM } from '../utils/metronome';
import { markExercisePracticed, saveBestAccuracy, unlockAchievement } from '../utils/storage';
import { successHaptic } from '../utils/haptics';
import { isMIDIAvailable, startMIDIInput, velocityToDynamic } from '../utils/midi';

interface ExerciseCardProps {
  exercise: Exercise;
  onComplete?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onComplete }) => {
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [tempo, setTempo] = useState(100);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [isMicLoading, setIsMicLoading] = useState(false);
  const [missCount, setMissCount] = useState(0);
  const [inputMode, setInputMode] = useState<'mic' | 'midi'>('mic');
  const [midiAvailable, setMidiAvailable] = useState(false);

  // Dynamics detection state
  const [currentDynamic, setCurrentDynamic] = useState<DynamicLevel>('pp');
  const [currentRms, setCurrentRms] = useState(0);

  const stopListeningRef = useRef<(() => void) | null>(null);
  const stopDynamicsRef = useRef<(() => void) | null>(null);
  const debounceRef = useRef<number | null>(null);
  const missDebounceRef = useRef<number | null>(null);

  const hasNotes = exercise.notes.length > 0;
  const hasDynamics = !!(exercise.targetDynamic && exercise.targetDynamic.length > 0);

  // Current target dynamic for the active note (supports per-note or single-value arrays)
  const currentTargetDynamic: DynamicLevel | null = hasDynamics
    ? (exercise.targetDynamic!.length === 1
        ? exercise.targetDynamic![0]
        : exercise.targetDynamic![currentNoteIndex] ?? null)
    : null;

  // Dynamic octave range based on exercise notes
  const noteOctaves = exercise.notes.map(n => parseInt(n.replace(/[^0-9]/g, ''))).filter(n => !isNaN(n));
  const minOctave = noteOctaves.length > 0 ? Math.min(...noteOctaves) : 3;
  const maxOctave = noteOctaves.length > 0 ? Math.max(...noteOctaves) : 4;
  const baseStartOctave = Math.max(2, minOctave);
  const baseOctaveCount = Math.max(2, maxOctave - baseStartOctave + 1);
  const [pianoStart, setPianoStart] = useState(baseStartOctave);
  const [pianoOctaves, setPianoOctaves] = useState(baseOctaveCount);
  const handleOctaveChange = (newStart: number, newCount: number) => {
    if (newCount >= baseOctaveCount) {
      setPianoStart(Math.min(newStart, baseStartOctave));
      setPianoOctaves(newCount);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stopListeningRef.current) stopListeningRef.current();
      if (stopDynamicsRef.current) stopDynamicsRef.current();
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      if (missDebounceRef.current) window.clearTimeout(missDebounceRef.current);
      stopMetronome();
    };
  }, []);

  // Check if MIDI is available on mount
  useEffect(() => {
    isMIDIAvailable().then(setMidiAvailable);
  }, []);

  // Update metronome BPM when tempo changes
  useEffect(() => {
    if (metronomeOn) setMetronomeBPM(tempo);
  }, [tempo, metronomeOn]);

  const handlePlayDemo = async () => {
    ensureAudioReady();
    if (isPlayingDemo) {
      stopSequence();
      setIsPlayingDemo(false);
      return;
    }
    if (isPracticeMode) handleTogglePractice();
    setIsPlayingDemo(true);
    await playSequence(exercise.notes, tempo, exercise.durations);
    setIsPlayingDemo(false);
  };

  const handleTogglePractice = async () => {
    if (isPracticeMode) {
      setIsPracticeMode(false);
      setDetectedNote(null);
      setSuccessNote(null);
      setCurrentNoteIndex(0);
      setMissCount(0);
      setCurrentDynamic('pp');
      setCurrentRms(0);
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
      if (stopDynamicsRef.current) {
        stopDynamicsRef.current();
        stopDynamicsRef.current = null;
      }
    } else {
      setIsPracticeMode(true);
      setCurrentNoteIndex(0);
      setSuccessNote(null);
      setMissCount(0);
      setCurrentDynamic('pp');
      setCurrentRms(0);
      setIsMicLoading(true);

      try {
        setMicError(null);

        if (inputMode === 'midi') {
          // MIDI input: note events come with velocity (no mic needed)
          const stopFn = await startMIDIInput((event) => {
            if (event.type === 'on') {
              setDetectedNote(event.note);
              if (hasDynamics) {
                setCurrentDynamic(velocityToDynamic(event.velocity));
                setCurrentRms(event.velocity / 127);
              }
            }
          });
          stopListeningRef.current = stopFn;
        } else {
          // Mic input: pitch detection + optional dynamics detection
          const stopFn = await startPitchDetection((note) => {
            setDetectedNote(note);
          });
          stopListeningRef.current = stopFn;

          if (hasDynamics) {
            const stopDyn = await startDynamicsDetection((level, rms) => {
              setCurrentDynamic(level);
              setCurrentRms(rms);
            });
            stopDynamicsRef.current = stopDyn;
          }
        }
      } catch (e: any) {
        const msg = e?.message || (inputMode === 'midi' ? 'MIDI connection failed' : 'Microphone access failed');
        console.error("Failed to start input:", msg);
        setMicError(msg);
        setIsPracticeMode(false);
      } finally {
        setIsMicLoading(false);
      }
    }
  };

  const handleResetPractice = () => {
     setCurrentNoteIndex(0);
     setSuccessNote(null);
     setDetectedNote(null);
     setMissCount(0);
  };

  const toggleMetronome = () => {
    if (metronomeOn) {
      stopMetronome();
      setMetronomeOn(false);
    } else {
      startMetronome(tempo);
      setMetronomeOn(true);
    }
  };

  // Pitch matching with accuracy tracking
  useEffect(() => {
    if (!isPracticeMode) return;

    const targetNote = exercise.notes[currentNoteIndex];
    if (!targetNote || !detectedNote) return;

    const normalizedTarget = normalizeNoteName(targetNote);
    const normalizedDetected = normalizeNoteName(detectedNote);

    if (normalizedDetected === normalizedTarget) {
       if (debounceRef.current === null) {
          setSuccessNote(targetNote);
          successHaptic();
          debounceRef.current = window.setTimeout(() => {
             setCurrentNoteIndex(prev => prev + 1);
             setSuccessNote(null);
             debounceRef.current = null;
          }, 400);
       }
    } else {
      // Count miss (debounced — max 1 per second to avoid noise)
      if (missDebounceRef.current === null) {
        setMissCount(prev => prev + 1);
        missDebounceRef.current = window.setTimeout(() => {
          missDebounceRef.current = null;
        }, 1000);
      }
    }
  }, [detectedNote, currentNoteIndex, exercise.notes, isPracticeMode]);

  const isComplete = isPracticeMode && currentNoteIndex >= exercise.notes.length;
  const accuracy = isComplete ? Math.round((exercise.notes.length / (exercise.notes.length + missCount)) * 100) : 0;

  // Save accuracy when practice completes
  useEffect(() => {
    if (isComplete) {
      saveBestAccuracy(exercise.id, accuracy);
      markExercisePracticed(exercise.id);
      if (accuracy === 100) unlockAchievement('perfect-score');
    }
  }, [isComplete]);

  // Hand indicator label
  const handLabel = exercise.hand === 'left' ? 'LH' : exercise.hand === 'both' ? 'Both' : 'RH';

  // Icon for no-note exercises
  const NoNoteIcon = exercise.type === ExerciseType.Mental ? Brain : BookOpen;

  return (
    <div className="bg-stone-900 rounded-2xl shadow-xl border border-stone-800 max-w-5xl mx-auto overflow-hidden">

      {/* Landscape split: info left, piano right */}
      <div className="flex flex-col md:flex-row">

        {/* Left Column - Exercise Info (40%, or full width for no-note exercises) */}
        <div className={`${hasNotes ? 'md:w-[40%]' : 'w-full'} p-5 md:p-6 ${hasNotes ? 'md:border-r border-stone-800' : ''} flex flex-col`}>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-3 py-1 bg-stone-800 text-stone-400 text-xs font-bold uppercase tracking-wider rounded-full border border-stone-700">
              {exercise.category}
            </span>
            <span className="px-3 py-1 bg-amber-900/30 text-amber-500 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-900/50">
              {exercise.type}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif text-stone-100 mb-2">{exercise.title}</h2>

          <p className="text-stone-400 text-sm leading-relaxed mb-4">
            {exercise.description}
          </p>

          {/* Key Signature + Hand Badge */}
          <div className="flex items-center gap-3 mb-5">
            <div className="inline-flex items-center gap-2 p-3 bg-stone-950 rounded-lg border border-stone-800">
              <span className="text-xl font-bold text-amber-500">{exercise.key}</span>
              <span className="text-xs text-stone-500 uppercase tracking-widest">Key</span>
            </div>
            {exercise.hand && (
              <div className="inline-flex items-center px-3 py-1.5 bg-stone-950 rounded-lg border border-stone-800">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{handLabel}</span>
              </div>
            )}
          </div>

          {/* No-note exercises: large icon + tips as main content */}
          {!hasNotes && (
            <div className="flex flex-col items-center text-center py-8 mb-6">
              <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mb-6 border border-stone-700">
                <NoNoteIcon size={40} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-serif text-stone-200 mb-4">Focus Exercise</h3>
              <div className="max-w-md space-y-3">
                {exercise.tips.map((tip, idx) => (
                  <p key={idx} className="text-stone-300 text-base leading-relaxed">
                    <span className="text-amber-500 font-serif font-bold italic mr-2">{idx + 1}.</span>
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Tips (only shown in sidebar when has notes) */}
          {hasNotes && (
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-stone-300 mb-2 flex items-center gap-2">
                <Info size={16} className="text-amber-500" />
                Chopin's Touch Points
              </h3>
              <ul className="space-y-2">
                {exercise.tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-2 text-stone-400 text-sm leading-relaxed">
                    <span className="text-amber-500 font-serif font-bold italic shrink-0">{idx + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mark Complete for no-note exercises */}
          {!hasNotes && onComplete && (
            <button
              onClick={onComplete}
              className="w-full py-3.5 bg-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-900/20 transition-transform active:scale-95 min-h-[48px] text-base mt-4"
            >
              Mark Complete
            </button>
          )}
        </div>

        {/* Right Column - Piano & Controls (60%) — only for exercises with notes */}
        {hasNotes && (
          <div className="md:w-[60%] flex flex-col">

            {/* Piano Visualizer Section */}
            <div className="flex-1 bg-stone-950/50 p-4 relative">
              {/* Visualizer header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-stone-500 text-sm">
                  <Music size={16} />
                  <span>{isMicLoading ? `Initializing ${inputMode}...` : isPracticeMode ? `Listening (${inputMode === 'midi' ? 'MIDI' : 'Mic'})...` : 'Interactive Visualizer'}</span>
                </div>
                {isPracticeMode && (
                  <div className="font-mono text-xs text-stone-600">
                    Detected: {detectedNote || '...'}
                  </div>
                )}
              </div>

              {/* Progress Bar for Practice Mode */}
              {isPracticeMode && (
                <div className="absolute top-0 left-0 w-full h-2 bg-stone-800 z-20">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
                    style={{ width: `${(currentNoteIndex / exercise.notes.length) * 100}%` }}
                  />
                </div>
              )}

              {/* Dynamics Meter — shown above the piano when exercise has target dynamics */}
              {isPracticeMode && hasDynamics && !isComplete && (
                <div className="mb-3 p-3 bg-stone-900/60 rounded-lg border border-stone-800/50 h-[100px]">
                  <DynamicsMeter
                    currentLevel={currentDynamic}
                    targetLevel={currentTargetDynamic}
                    rms={currentRms}
                  />
                </div>
              )}

              {isComplete ? (
                <div className="h-[200px] flex flex-col items-center justify-center bg-stone-900/80 rounded-lg">
                  <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-3 border border-green-500/30">
                    <Check size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-serif text-stone-100">Exercise Complete!</h3>
                  <div className={`text-lg font-bold mt-1 ${accuracy === 100 ? 'text-green-400' : accuracy >= 80 ? 'text-amber-400' : 'text-stone-400'}`}>
                    {accuracy}% accuracy
                  </div>
                  <button
                    onClick={handleResetPractice}
                    className="mt-3 flex items-center gap-2 text-stone-400 active:text-amber-500 min-h-[44px] min-w-[44px] justify-center"
                  >
                    <RefreshCw size={14} /> Practice Again
                  </button>
                </div>
              ) : (
                <>
                  {isPracticeMode && (
                    <FallingNotes
                      notes={exercise.notes}
                      currentIndex={currentNoteIndex}
                      startOctave={pianoStart}
                      octaveCount={pianoOctaves}
                    />
                  )}
                  <PianoVisualizer
                    highlightedNotes={isPracticeMode ? [] : exercise.notes}
                    activeNote={isPracticeMode ? exercise.notes[currentNoteIndex] : null}
                    successNote={successNote}
                    fingerings={exercise.fingerings}
                    startOctave={pianoStart}
                    octaveCount={pianoOctaves}
                    interactive={!isPracticeMode}
                    minOctaves={baseOctaveCount}
                    onOctaveChange={handleOctaveChange}
                  />
                </>
              )}

              {/* Mic Error */}
              {micError && (
                <div className="mt-3 p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-400 text-sm">
                  {micError}
                </div>
              )}

              {/* Legend */}
              <div className="mt-3 flex gap-4 text-sm text-stone-500">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isPracticeMode ? 'bg-amber-600 animate-pulse' : 'bg-amber-600'}`}></span>
                  <span>{isPracticeMode ? 'Target' : 'Active'}</span>
                </div>
                {isPracticeMode && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span>Success</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tempo Slider + Metronome */}
            <div className="px-4 py-2 border-t border-stone-800/50 flex items-center gap-3">
              <button
                onClick={toggleMetronome}
                className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center
                  ${metronomeOn ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400 active:bg-stone-700'}`}
                title="Metronome"
              >
                <Timer size={16} />
              </button>
              <span className="text-xs text-stone-500 w-8 text-right">{tempo}</span>
              <input
                type="range"
                min={40}
                max={180}
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="flex-1 accent-amber-500 h-2"
              />
              <span className="text-xs text-stone-500">BPM</span>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-stone-800 space-y-3">
              {/* Input mode toggle (only shown when MIDI is available and not in practice mode) */}
              {midiAvailable && !isPracticeMode && (
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-xs text-stone-500">Input:</span>
                  <div className="flex bg-stone-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setInputMode('mic')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[32px]
                        ${inputMode === 'mic' ? 'bg-amber-700 text-white' : 'text-stone-400'}`}
                    >
                      <Mic size={12} /> Mic
                    </button>
                    <button
                      onClick={() => setInputMode('midi')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[32px]
                        ${inputMode === 'midi' ? 'bg-amber-700 text-white' : 'text-stone-400'}`}
                    >
                      <Piano size={12} /> MIDI
                    </button>
                  </div>
                </div>
              )}

              {/* Demo + Practice buttons row */}
              <div className="flex gap-3">
                <button
                  onClick={handlePlayDemo}
                  disabled={isPracticeMode}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-colors min-h-[48px]
                    ${isPlayingDemo
                      ? 'bg-amber-700 text-white active:bg-amber-800'
                      : 'bg-stone-800 text-stone-200 active:bg-stone-700 disabled:opacity-30'}
                  `}
                >
                  <Volume2 size={18} />
                  {isPlayingDemo ? 'Stop' : 'Hear Demo'}
                </button>

                <button
                  onClick={handleTogglePractice}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-colors min-h-[48px]
                    ${isPracticeMode
                      ? 'bg-amber-700 text-white active:bg-amber-800 shadow-lg shadow-amber-900/30'
                      : 'bg-amber-900/40 text-amber-400 border border-amber-800/50 active:bg-amber-900/60'}
                  `}
                >
                  {isMicLoading
                    ? <Loader2 size={18} className="animate-spin" />
                    : isPracticeMode
                      ? <MicOff size={18} />
                      : inputMode === 'midi' ? <Piano size={18} /> : <Mic size={18} />}
                  {isMicLoading ? 'Starting...' : isPracticeMode ? 'Stop Practice' : `Practice (${inputMode === 'midi' ? 'MIDI' : 'Mic'})`}
                </button>
              </div>

              {/* Mark Complete button */}
              {onComplete && (
                <button
                  onClick={onComplete}
                  className="w-full py-3.5 bg-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-900/20 transition-transform active:scale-95 min-h-[48px] text-base"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseCard;
