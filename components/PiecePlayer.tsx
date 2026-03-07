import React, { useState, useEffect, useRef } from 'react';
import { Piece } from '../types';
import PianoVisualizer from './PianoVisualizer';
import FallingNotes from './FallingNotes';
import { Music, Volume2, Mic, MicOff, Check, RefreshCw, ChevronDown, Timer, Loader2, Piano } from 'lucide-react';
import { playSequence, stopSequence, ensureAudioReady } from '../utils/audio';
import { startPitchDetection, normalizeNoteName } from '../utils/pitchDetection';
import { startMetronome, stopMetronome, setMetronomeBPM } from '../utils/metronome';
import { saveBestAccuracy } from '../utils/storage';
import { successHaptic } from '../utils/haptics';
import { isMIDIAvailable, startMIDIInput } from '../utils/midi';

interface PiecePlayerProps {
  piece: Piece;
  onComplete?: () => void;
}

const PiecePlayer: React.FC<PiecePlayerProps> = ({ piece, onComplete }) => {
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [tempo, setTempo] = useState(piece.tempo);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [micError, setMicError] = useState<string | null>(null);
  const [isMicLoading, setIsMicLoading] = useState(false);
  const [missCount, setMissCount] = useState(0);
  const [inputMode, setInputMode] = useState<'mic' | 'midi'>('mic');
  const [midiAvailable, setMidiAvailable] = useState(false);

  const stopListeningRef = useRef<(() => void) | null>(null);
  const debounceRef = useRef<number | null>(null);
  const missDebounceRef = useRef<number | null>(null);

  const activeSection = piece.sections[activeSectionIdx];

  // Determine which octaves the piano needs to show
  const allNotes = activeSection.notes;
  const noteOctaves = allNotes.map(n => parseInt(n.replace(/[^0-9]/g, ''))).filter(n => !isNaN(n));
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (stopListeningRef.current) stopListeningRef.current();
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      if (missDebounceRef.current) window.clearTimeout(missDebounceRef.current);
      stopMetronome();
    };
  }, []);

  // Check MIDI availability
  useEffect(() => {
    isMIDIAvailable().then(setMidiAvailable);
  }, []);

  // Update metronome when tempo changes
  useEffect(() => {
    if (metronomeOn) setMetronomeBPM(tempo);
  }, [tempo, metronomeOn]);

  const handlePlayDemo = async () => {
    // MUST be first — iOS WKWebView requires resume() in the synchronous tap stack
    ensureAudioReady();
    if (isPlayingDemo) {
      stopSequence();
      setIsPlayingDemo(false);
      return;
    }
    if (isPracticeMode) handleTogglePractice();
    setIsPlayingDemo(true);
    await playSequence(activeSection.notes, tempo);
    setIsPlayingDemo(false);
  };

  const handleTogglePractice = async () => {
    if (isPracticeMode) {
      setIsPracticeMode(false);
      setDetectedNote(null);
      setSuccessNote(null);
      setCurrentNoteIndex(0);
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
    } else {
      setIsPracticeMode(true);
      setCurrentNoteIndex(0);
      setSuccessNote(null);
      setIsMicLoading(true);
      try {
        setMicError(null);
        if (inputMode === 'midi') {
          const stopFn = await startMIDIInput((event) => {
            if (event.type === 'on') setDetectedNote(event.note);
          });
          stopListeningRef.current = stopFn;
        } else {
          const stopFn = await startPitchDetection((note) => setDetectedNote(note));
          stopListeningRef.current = stopFn;
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

  const handleResetSection = () => {
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

  // Pitch matching logic
  useEffect(() => {
    if (!isPracticeMode) return;
    const targetNote = activeSection.notes[currentNoteIndex];
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
    } else if (missDebounceRef.current === null) {
      setMissCount(prev => prev + 1);
      missDebounceRef.current = window.setTimeout(() => {
        missDebounceRef.current = null;
      }, 1000);
    }
  }, [detectedNote, currentNoteIndex, activeSection.notes, isPracticeMode]);

  const isSectionComplete = isPracticeMode && currentNoteIndex >= activeSection.notes.length;

  const sectionAccuracy = activeSection.notes.length > 0
    ? Math.round((activeSection.notes.length / (activeSection.notes.length + missCount)) * 100)
    : 100;

  // When section is completed via practice mode
  useEffect(() => {
    if (isSectionComplete) {
      setCompletedSections(prev => new Set(prev).add(activeSectionIdx));
      saveBestAccuracy(`piece-${piece.id}-s${activeSectionIdx}`, sectionAccuracy);
    }
  }, [isSectionComplete, activeSectionIdx, sectionAccuracy, piece.id]);

  const allSectionsCompleted = completedSections.size === piece.sections.length;

  return (
    <div className="bg-stone-900 rounded-2xl shadow-xl border border-stone-800 max-w-5xl mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left: Piece info */}
        <div className="md:w-[40%] p-5 md:p-6 md:border-r border-stone-800 flex flex-col">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-3 py-1 bg-amber-900/30 text-amber-500 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-900/50">
              Level {piece.level}
            </span>
            <span className="px-3 py-1 bg-stone-800 text-stone-400 text-xs font-bold uppercase tracking-wider rounded-full border border-stone-700">
              {piece.difficulty}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif text-stone-100 mb-1">{piece.title}</h2>
          <p className="text-stone-500 text-sm mb-3">{piece.composer}</p>
          <p className="text-stone-400 text-sm leading-relaxed mb-4">{piece.description}</p>

          {/* Key + Tempo */}
          <div className="flex gap-3 mb-5">
            <div className="inline-flex items-center gap-2 p-3 bg-stone-950 rounded-lg border border-stone-800">
              <span className="text-lg font-bold text-amber-500">{piece.key}</span>
              <span className="text-xs text-stone-500 uppercase tracking-widest">Key</span>
            </div>
            <div className="inline-flex items-center gap-2 p-3 bg-stone-950 rounded-lg border border-stone-800">
              <span className="text-lg font-bold text-amber-500">{piece.tempo}</span>
              <span className="text-xs text-stone-500 uppercase tracking-widest">BPM</span>
            </div>
          </div>

          {/* Section selector */}
          {piece.sections.length > 1 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Sections</h4>
              <div className="flex flex-wrap gap-2">
                {piece.sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (isPracticeMode) handleTogglePractice();
                      setActiveSectionIdx(idx);
                      setCurrentNoteIndex(0);
                      setSuccessNote(null);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[36px] flex items-center gap-1
                      ${activeSectionIdx === idx
                        ? 'bg-amber-700 text-white'
                        : completedSections.has(idx)
                          ? 'bg-stone-800 text-amber-600 border border-amber-800/30'
                          : 'bg-stone-800 text-stone-400 active:bg-stone-700'}`}
                  >
                    {completedSections.has(idx) && <Check size={10} />}
                    {section.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-stone-300 mb-2">Performance Notes</h3>
            <ul className="space-y-2">
              {piece.tips.map((tip, idx) => (
                <li key={idx} className="flex gap-2 text-stone-400 text-sm leading-relaxed">
                  <span className="text-amber-500 font-serif font-bold italic shrink-0">{idx + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Piano + Controls */}
        <div className="md:w-[60%] flex flex-col">
          {/* Piano */}
          <div className="flex-1 bg-stone-950/50 p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-stone-500 text-sm">
                <Music size={16} />
                <span>{activeSection.name}</span>
              </div>
              {(isPracticeMode || isMicLoading) && (
                <div className="font-mono text-xs text-stone-600">
                  {isMicLoading ? 'Initializing mic...' : `Detected: ${detectedNote || '...'}`}
                </div>
              )}
            </div>

            {isPracticeMode && (
              <div className="absolute top-0 left-0 w-full h-2 bg-stone-800 z-20">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
                  style={{ width: `${(currentNoteIndex / activeSection.notes.length) * 100}%` }}
                />
              </div>
            )}

            {isSectionComplete ? (
              <div className="h-[200px] flex flex-col items-center justify-center bg-stone-900/80 rounded-lg">
                <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                  <Check size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-serif text-stone-100">Section Complete!</h3>
                <p className={`text-sm mt-1 ${sectionAccuracy === 100 ? 'text-green-400' : sectionAccuracy >= 80 ? 'text-amber-400' : 'text-stone-400'}`}>
                  Accuracy: {sectionAccuracy}%
                </p>
                <div className="flex gap-3 mt-4">
                  <button onClick={handleResetSection} className="flex items-center gap-2 text-stone-400 active:text-amber-500 min-h-[44px] px-3">
                    <RefreshCw size={14} /> Again
                  </button>
                  {activeSectionIdx < piece.sections.length - 1 && (
                    <button
                      onClick={() => {
                        setActiveSectionIdx(prev => prev + 1);
                        setCurrentNoteIndex(0);
                        setSuccessNote(null);
                        setIsPracticeMode(false);
                        if (stopListeningRef.current) {
                          stopListeningRef.current();
                          stopListeningRef.current = null;
                        }
                      }}
                      className="flex items-center gap-2 text-amber-500 active:text-amber-400 min-h-[44px] px-3 font-medium"
                    >
                      Next Section <ChevronDown size={14} className="rotate-[-90deg]" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {isPracticeMode && (
                  <FallingNotes
                    notes={activeSection.notes}
                    currentIndex={currentNoteIndex}
                    startOctave={pianoStart}
                    octaveCount={pianoOctaves}
                  />
                )}
                <PianoVisualizer
                  highlightedNotes={isPracticeMode ? [] : activeSection.notes}
                  activeNote={isPracticeMode ? activeSection.notes[currentNoteIndex] : null}
                  successNote={successNote}
                  fingerings={activeSection.fingerings}
                  startOctave={pianoStart}
                  octaveCount={pianoOctaves}
                  interactive={!isPracticeMode}
                  minOctaves={baseOctaveCount}
                  onOctaveChange={handleOctaveChange}
                />
              </>
            )}

            {micError && (
              <div className="mt-3 p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-400 text-sm">
                {micError}
              </div>
            )}

            <div className="mt-3 flex gap-4 text-sm text-stone-500">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isPracticeMode ? 'bg-amber-600 animate-pulse' : 'bg-amber-600'}`} />
                <span>{isPracticeMode ? 'Target' : 'Active'}</span>
              </div>
              {isPracticeMode && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Success</span>
                </div>
              )}
            </div>
          </div>

          {/* Tempo + Metronome */}
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
              min={30}
              max={200}
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="flex-1 accent-amber-500 h-2"
            />
            <span className="text-xs text-stone-500">BPM</span>
          </div>

          {/* Action buttons */}
          <div className="p-4 border-t border-stone-800 space-y-3">
            {/* Input mode toggle */}
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

            <div className="flex gap-3">
              <button
                onClick={handlePlayDemo}
                disabled={isPracticeMode}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[48px]
                  ${isPlayingDemo ? 'bg-amber-700 text-white active:bg-amber-800' : 'bg-stone-800 text-stone-200 active:bg-stone-700 disabled:opacity-30'}`}
              >
                <Volume2 size={18} />
                {isPlayingDemo ? 'Stop' : 'Hear Demo'}
              </button>
              <button
                onClick={handleTogglePractice}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[48px]
                  ${isPracticeMode
                    ? 'bg-amber-700 text-white active:bg-amber-800'
                    : 'bg-amber-900/40 text-amber-400 border border-amber-800/50 active:bg-amber-900/60'}`}
              >
                {isMicLoading
                  ? <Loader2 size={18} className="animate-spin" />
                  : isPracticeMode
                    ? <MicOff size={18} />
                    : inputMode === 'midi' ? <Piano size={18} /> : <Mic size={18} />}
                {isMicLoading ? 'Starting...' : isPracticeMode ? 'Stop' : `Practice (${inputMode === 'midi' ? 'MIDI' : 'Mic'})`}
              </button>
            </div>

            {onComplete && allSectionsCompleted && (
              <button
                onClick={onComplete}
                className="w-full py-3.5 bg-green-700 text-white font-semibold rounded-xl shadow-lg transition-transform active:scale-95 min-h-[48px]"
              >
                Mark Piece Complete
              </button>
            )}
            {onComplete && !allSectionsCompleted && (
              <button
                onClick={onComplete}
                className="w-full py-3.5 bg-stone-800 text-stone-400 font-semibold rounded-xl min-h-[48px] active:bg-stone-700"
              >
                Skip / Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PiecePlayer;
