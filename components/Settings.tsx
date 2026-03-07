import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw, Info } from 'lucide-react';
import { setVolume, getVolume } from '../utils/audio';

interface SettingsProps {
  onResetProgress: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onResetProgress }) => {
  const [volume, setVolumeState] = useState(getVolume() * 100);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleVolumeChange = (val: number) => {
    setVolumeState(val);
    setVolume(val / 100);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif text-stone-100 mb-1">Settings</h2>
        <p className="text-stone-500 text-sm">Configure your practice environment.</p>
      </div>

      {/* Volume */}
      <div className="bg-stone-900 rounded-xl border border-stone-800 p-5">
        <h3 className="text-sm font-semibold text-stone-300 mb-4 flex items-center gap-2">
          {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          Volume
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500 w-8">{Math.round(volume)}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="flex-1 accent-amber-500 h-2"
          />
        </div>
      </div>

      {/* Reset Progress */}
      <div className="bg-stone-900 rounded-xl border border-stone-800 p-5">
        <h3 className="text-sm font-semibold text-stone-300 mb-2 flex items-center gap-2">
          <RotateCcw size={16} />
          Progress
        </h3>
        <p className="text-stone-500 text-xs mb-4">Reset all completed exercises and practice history.</p>
        {showResetConfirm ? (
          <div className="flex gap-3">
            <button
              onClick={() => {
                onResetProgress();
                setShowResetConfirm(false);
              }}
              className="flex-1 py-2.5 bg-red-900/50 text-red-400 rounded-lg text-sm font-medium active:bg-red-900 min-h-[44px]"
            >
              Confirm Reset
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-2.5 bg-stone-800 text-stone-300 rounded-lg text-sm font-medium active:bg-stone-700 min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 bg-stone-800 text-stone-400 rounded-lg text-sm font-medium active:bg-stone-700 min-h-[44px]"
          >
            Reset All Progress
          </button>
        )}
      </div>

      {/* About */}
      <div className="bg-stone-900 rounded-xl border border-stone-800 p-5">
        <h3 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-2">
          <Info size={16} />
          The Chopin Method
        </h3>
        <div className="space-y-3 text-stone-400 text-sm leading-relaxed">
          <p>Frederic Chopin taught piano differently from his contemporaries. While most teachers started with C Major, Chopin started with B Major — because the hand falls naturally over the black keys.</p>
          <p>His core principles: suppleness of the wrist, singing tone (cantabile), and rhythmic freedom (rubato). Every exercise in this app follows these principles.</p>
          <p className="text-stone-500 italic">"Simplicity is the final achievement. After one has played a vast quantity of notes, it is simplicity that emerges as the crowning reward of art."</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
