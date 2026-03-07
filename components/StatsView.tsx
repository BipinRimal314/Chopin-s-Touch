import React, { useMemo } from 'react';
import { Flame, Clock, Trophy, RefreshCw, ChevronRight } from 'lucide-react';
import { CHOPIN_EXERCISES, DAILY_DOZEN_IDS } from '../constants';
import { Exercise } from '../types';
import {
  getPracticeDays,
  getCurrentStreak,
  getLongestStreak,
  getWeeklyMinutes,
  getStaleExercises,
  getExerciseHistory,
  getUnlockedAchievements,
  getBestAccuracy,
  ACHIEVEMENTS,
} from '../utils/storage';

interface StatsViewProps {
  onSelectExercise: (ex: Exercise) => void;
}

const StatsView: React.FC<StatsViewProps> = ({ onSelectExercise }) => {
  const streak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  const weeklyMinutes = getWeeklyMinutes();
  const totalMinutesToday = weeklyMinutes[weeklyMinutes.length - 1]?.minutes || 0;
  const totalMinutesWeek = weeklyMinutes.reduce((sum, d) => sum + d.minutes, 0);
  const maxWeeklyMinutes = Math.max(...weeklyMinutes.map(d => d.minutes), 1);
  const unlocked = getUnlockedAchievements();
  const bestAccuracy = getBestAccuracy();
  const exerciseHistory = getExerciseHistory();

  const practiceDays = useMemo(() => new Set(getPracticeDays()), []);

  // Calendar: last 28 days
  const calendarDays = useMemo(() => {
    const days: { date: string; practiced: boolean; isToday: boolean }[] = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        practiced: practiceDays.has(dateStr),
        isToday: i === 0,
      });
    }
    return days;
  }, [practiceDays]);

  // Padding for first row alignment (Monday = 0)
  const firstDayPadding = useMemo(() => {
    if (calendarDays.length === 0) return 0;
    const firstDay = new Date(calendarDays[0].date);
    return (firstDay.getDay() + 6) % 7; // Mon=0, Sun=6
  }, [calendarDays]);

  // Spaced repetition: Daily Dozen exercises not practiced in 3+ days
  const reviewExercises = useMemo(() => {
    const staleIds = getStaleExercises(DAILY_DOZEN_IDS, 3);
    return staleIds
      .slice(0, 5)
      .map(id => CHOPIN_EXERCISES.find(ex => ex.id === id))
      .filter((ex): ex is Exercise => !!ex);
  }, []);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-2">
        <h1 className="text-2xl md:text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 mb-1">
          Your Progress
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-stone-900 rounded-xl border border-stone-800 p-4 text-center">
          <Flame size={20} className="mx-auto mb-1 text-orange-500" />
          <div className="text-2xl font-bold text-stone-100">{streak}</div>
          <div className="text-xs text-stone-500">Day Streak</div>
        </div>
        <div className="bg-stone-900 rounded-xl border border-stone-800 p-4 text-center">
          <Clock size={20} className="mx-auto mb-1 text-amber-500" />
          <div className="text-2xl font-bold text-stone-100">{totalMinutesToday}m</div>
          <div className="text-xs text-stone-500">Today</div>
        </div>
        <div className="bg-stone-900 rounded-xl border border-stone-800 p-4 text-center">
          <Trophy size={20} className="mx-auto mb-1 text-yellow-500" />
          <div className="text-2xl font-bold text-stone-100">{Object.keys(unlocked).length}</div>
          <div className="text-xs text-stone-500">Badges</div>
        </div>
      </div>

      {/* Streak Calendar */}
      <div className="bg-stone-900 rounded-xl border border-stone-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-stone-300">Last 28 Days</h3>
          <span className="text-xs text-stone-500">Longest: {longestStreak} days</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] text-stone-600 font-medium mb-1">{d}</div>
          ))}
          {Array.from({ length: firstDayPadding }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {calendarDays.map(({ date, practiced, isToday }) => (
            <div
              key={date}
              className={`
                aspect-square rounded-sm flex items-center justify-center text-[9px]
                ${practiced
                  ? 'bg-amber-600/80 text-amber-100'
                  : 'bg-stone-800/50 text-stone-700'}
                ${isToday ? 'ring-1 ring-amber-500' : ''}
              `}
              title={date}
            >
              {new Date(date + 'T00:00:00').getDate()}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-stone-900 rounded-xl border border-stone-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-stone-300">This Week</h3>
          <span className="text-xs text-stone-500">{totalMinutesWeek}m total</span>
        </div>
        <div className="space-y-2">
          {weeklyMinutes.map(({ day, minutes }, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-stone-500 w-8">{day}</span>
              <div className="flex-1 h-5 bg-stone-800 rounded-full overflow-hidden">
                {minutes > 0 && (
                  <div
                    className="h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-full transition-all"
                    style={{ width: `${(minutes / maxWeeklyMinutes) * 100}%` }}
                  />
                )}
              </div>
              <span className="text-xs text-stone-500 w-8 text-right">
                {minutes > 0 ? `${minutes}m` : '\u2014'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Suggestions */}
      {reviewExercises.length > 0 && (
        <div className="bg-stone-900 rounded-xl border border-stone-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-stone-300">Review Suggested</h3>
          </div>
          <p className="text-xs text-stone-500 mb-3">These exercises need a refresher (3+ days since last practice).</p>
          <div className="space-y-2">
            {reviewExercises.map(ex => {
              const lastDate = exerciseHistory[ex.id];
              const daysSince = lastDate
                ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000)
                : null;
              return (
                <button
                  key={ex.id}
                  onClick={() => onSelectExercise(ex)}
                  className="w-full flex items-center gap-3 p-3 bg-stone-800/50 rounded-lg active:bg-stone-800 transition-colors text-left min-h-[44px]"
                >
                  <span className="text-stone-300 text-sm flex-1">{ex.title}</span>
                  <span className="text-xs text-stone-500">
                    {daysSince !== null ? `${daysSince}d ago` : 'Never'}
                  </span>
                  {bestAccuracy[ex.id] !== undefined && (
                    <span className="text-xs text-amber-700">{bestAccuracy[ex.id]}%</span>
                  )}
                  <ChevronRight size={14} className="text-amber-700" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-stone-900 rounded-xl border border-stone-800 p-5">
        <h3 className="text-sm font-semibold text-stone-300 mb-4">Achievements</h3>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map(achievement => {
            const isUnlocked = !!unlocked[achievement.id];
            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border ${
                  isUnlocked
                    ? 'bg-amber-900/20 border-amber-800/30'
                    : 'bg-stone-800/30 border-stone-800 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{achievement.icon}</span>
                  <span className={`text-sm font-medium ${isUnlocked ? 'text-stone-200' : 'text-stone-500'}`}>
                    {achievement.title}
                  </span>
                </div>
                <p className="text-xs text-stone-500">{achievement.description}</p>
                {isUnlocked && (
                  <p className="text-[10px] text-amber-700 mt-1">Unlocked {unlocked[achievement.id]}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center py-6 border-t border-stone-800">
        <p className="text-stone-500 italic text-sm max-w-lg mx-auto">
          "Simplicity is the final achievement. After one has played a vast quantity of notes, it is simplicity that emerges as the crowning reward of art." — Frederic Chopin
        </p>
      </div>
    </div>
  );
};

export default StatsView;
