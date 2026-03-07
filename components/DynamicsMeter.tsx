import React from 'react';
import { DynamicLevel, DYNAMIC_LEVELS, dynamicIndex } from '../utils/dynamics';

interface DynamicsMeterProps {
  currentLevel: DynamicLevel;
  targetLevel: DynamicLevel | null;
  rms: number;
}

/**
 * Vertical dynamics meter with color gradient and target indicator.
 *
 * - Blue tones for quiet (pp, p)
 * - Amber tones for medium (mp, mf)
 * - Red tones for loud (f, ff)
 * - If a target dynamic is provided, a marker shows where the user should aim.
 * - Compact enough to sit in a sidebar or above the piano.
 */
const DynamicsMeter: React.FC<DynamicsMeterProps> = ({ currentLevel, targetLevel, rms }) => {
  // Clamp RMS to [0, 0.6] for the visual bar (ff threshold is 0.4, give headroom)
  const fillPercent = Math.min(rms / 0.6, 1) * 100;

  const currentIdx = dynamicIndex(currentLevel);
  const targetIdx = targetLevel !== null ? dynamicIndex(targetLevel) : null;

  // Color for the current level label
  const levelColors: Record<DynamicLevel, string> = {
    pp: 'text-blue-400',
    p:  'text-blue-300',
    mp: 'text-amber-400',
    mf: 'text-amber-300',
    f:  'text-red-400',
    ff: 'text-red-300',
  };

  // Background color for the fill bar — gradient stop based on fill height
  const barGradient = 'bg-gradient-to-t from-blue-500 via-amber-500 to-red-500';

  // Target position as percentage of the meter height
  // Map each level index (0-5) to a percentage (each level occupies ~16.67% of the bar)
  const targetPercent = targetIdx !== null ? ((targetIdx + 0.5) / DYNAMIC_LEVELS.length) * 100 : null;

  // Determine match status for visual feedback
  const isMatch = targetLevel !== null && currentLevel === targetLevel;
  const isTooLoud = targetIdx !== null && currentIdx > targetIdx;
  const isTooQuiet = targetIdx !== null && currentIdx < targetIdx;

  return (
    <div className="flex items-stretch gap-3 h-full select-none">
      {/* Level labels column (bottom to top: pp -> ff) */}
      <div className="flex flex-col-reverse justify-between py-1 shrink-0">
        {DYNAMIC_LEVELS.map((level) => {
          const isActive = level === currentLevel;
          const isTarget = level === targetLevel;
          return (
            <div
              key={level}
              className={`
                text-xs font-mono font-bold leading-none py-0.5 px-1 rounded transition-all duration-150
                ${isActive ? `${levelColors[level]} scale-110` : 'text-stone-600'}
                ${isTarget ? 'ring-1 ring-amber-500/50' : ''}
              `}
            >
              {level}
            </div>
          );
        })}
      </div>

      {/* Vertical bar */}
      <div className="relative w-6 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
        {/* Fill */}
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-full transition-all duration-100 ${barGradient}`}
          style={{ height: `${fillPercent}%` }}
        />

        {/* Target marker line */}
        {targetPercent !== null && (
          <div
            className="absolute left-0 right-0 h-0.5 bg-white/80 z-10 pointer-events-none"
            style={{ bottom: `${targetPercent}%` }}
          >
            {/* Small triangle indicator */}
            <div className="absolute -right-1.5 -top-1 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-white/80" />
          </div>
        )}
      </div>

      {/* Status column */}
      <div className="flex flex-col justify-center gap-1 min-w-[48px]">
        {/* Current level, large */}
        <div className={`text-2xl font-serif font-bold italic ${levelColors[currentLevel]} transition-colors duration-150`}>
          {currentLevel}
        </div>

        {/* Feedback text when target is set */}
        {targetLevel !== null && (
          <div className={`text-[10px] font-semibold uppercase tracking-wider transition-colors duration-150 ${
            isMatch ? 'text-green-400' : isTooLoud ? 'text-red-400' : isTooQuiet ? 'text-blue-400' : 'text-stone-500'
          }`}>
            {isMatch ? 'On target' : isTooLoud ? 'Too loud' : isTooQuiet ? 'Too quiet' : ''}
          </div>
        )}

        {/* Raw RMS for the curious */}
        <div className="text-[9px] text-stone-600 font-mono tabular-nums">
          {rms.toFixed(3)}
        </div>
      </div>
    </div>
  );
};

export default DynamicsMeter;
