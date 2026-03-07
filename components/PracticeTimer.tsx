import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface PracticeTimerProps {
  isActive: boolean; // true when user is in an exercise or piece
}

const PracticeTimer: React.FC<PracticeTimerProps> = ({ isActive }) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (seconds === 0 && !isActive) return null;

  return (
    <div className="flex items-center gap-1.5 text-stone-500">
      <Clock size={12} className={isActive ? 'text-amber-500' : ''} />
      <span className={`text-xs font-mono ${isActive ? 'text-amber-500' : 'text-stone-600'}`}>
        {formatTime(seconds)}
      </span>
    </div>
  );
};

export default PracticeTimer;
