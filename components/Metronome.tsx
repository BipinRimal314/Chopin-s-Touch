import React, { useState, useCallback, useEffect } from 'react';
import { startMetronome, stopMetronome, setMetronomeBPM } from '../utils/metronome';

const TEMPO_MARKINGS = [
  { label: 'Largo', bpm: 50 },
  { label: 'Adagio', bpm: 70 },
  { label: 'Andante', bpm: 90 },
  { label: 'Moderato', bpm: 110 },
  { label: 'Allegro', bpm: 140 },
  { label: 'Presto', bpm: 180 },
];

const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stopMetronome();
      setIsPlaying(false);
      setCurrentBeat(-1);
    } else {
      startMetronome(bpm, (beat) => setCurrentBeat(beat));
      setIsPlaying(true);
    }
  }, [isPlaying, bpm]);

  useEffect(() => {
    if (isPlaying) setMetronomeBPM(bpm);
  }, [bpm, isPlaying]);

  useEffect(() => {
    return () => { stopMetronome(); };
  }, []);

  // Get current tempo marking
  const getTempoMarking = () => {
    for (let i = TEMPO_MARKINGS.length - 1; i >= 0; i--) {
      if (bpm >= TEMPO_MARKINGS[i].bpm) return TEMPO_MARKINGS[i].label;
    }
    return 'Grave';
  };

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="font-serif text-xl text-stone-100 mb-1">Metronome</h3>
        <p className="text-stone-500 text-sm">{getTempoMarking()}</p>
      </div>

      {/* Visual beat indicator - 4 dots */}
      <div className="flex justify-center gap-4 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full transition-all duration-75 ${
              currentBeat === i
                ? i === 0
                  ? 'bg-amber-500 scale-125 shadow-lg shadow-amber-500/50'
                  : 'bg-stone-300 scale-110'
                : 'bg-stone-700'
            }`}
          />
        ))}
      </div>

      {/* BPM display */}
      <div className="text-center mb-4">
        <span className="text-5xl font-bold text-stone-100 font-mono">{bpm}</span>
        <span className="text-stone-500 text-sm ml-2">BPM</span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={30}
        max={220}
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))}
        className="w-full accent-amber-500 h-2 mb-6"
      />

      {/* Quick tempo buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {TEMPO_MARKINGS.map(t => (
          <button
            key={t.label}
            onClick={() => setBpm(t.bpm)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px]
              ${bpm === t.bpm
                ? 'bg-amber-700 text-white'
                : 'bg-stone-800 text-stone-400 active:bg-stone-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Start/Stop */}
      <button
        onClick={toggle}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all active:scale-95 min-h-[56px] ${
          isPlaying
            ? 'bg-stone-800 text-stone-200 border border-stone-700'
            : 'bg-amber-700 text-white shadow-lg shadow-amber-900/30'
        }`}
      >
        {isPlaying ? 'Stop' : 'Start'}
      </button>
    </div>
  );
};

export default Metronome;
