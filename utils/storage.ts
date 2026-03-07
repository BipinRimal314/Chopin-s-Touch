// Safe localStorage helpers for practice data tracking

const PREFIX = 'ct-';

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch { /* QuotaExceededError */ }
}

// --- Practice Days (streak tracking) ---

export function getPracticeDays(): string[] {
  return safeGet<string[]>('practice-days', []);
}

export function markPracticeDay(date?: string): void {
  const today = date || new Date().toISOString().split('T')[0];
  const days = getPracticeDays();
  if (!days.includes(today)) {
    days.push(today);
    safeSet('practice-days', days);
  }
}

export function getCurrentStreak(): number {
  const days = new Set(getPracticeDays());
  if (days.size === 0) return 0;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Start from today if practiced, otherwise yesterday
  const start = new Date(today);
  if (!days.has(todayStr)) {
    start.setDate(start.getDate() - 1);
    if (!days.has(start.toISOString().split('T')[0])) return 0;
  }

  let streak = 0;
  const d = new Date(start);
  while (days.has(d.toISOString().split('T')[0])) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  return streak;
}

export function getLongestStreak(): number {
  const days = getPracticeDays().sort();
  if (days.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);

    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }

  return longest;
}

// --- Session History ---

interface SessionRecord {
  date: string;
  seconds: number;
}

export function getSessions(): SessionRecord[] {
  return safeGet<SessionRecord[]>('sessions', []);
}

export function saveSession(seconds: number): void {
  if (seconds < 10) return;
  const today = new Date().toISOString().split('T')[0];
  const sessions = getSessions();

  const todaySession = sessions.find(s => s.date === today);
  if (todaySession) {
    todaySession.seconds += seconds;
  } else {
    sessions.push({ date: today, seconds });
  }

  safeSet('sessions', sessions);
  markPracticeDay(today);
}

export function getWeeklyMinutes(): { day: string; minutes: number }[] {
  const sessions = getSessions();
  const result: { day: string; minutes: number }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en', { weekday: 'short' });
    const session = sessions.find(s => s.date === dateStr);
    result.push({
      day: dayName,
      minutes: session ? Math.round(session.seconds / 60) : 0,
    });
  }

  return result;
}

// --- Exercise History (spaced repetition) ---

export function getExerciseHistory(): Record<string, string> {
  return safeGet<Record<string, string>>('exercise-history', {});
}

export function markExercisePracticed(exerciseId: string): void {
  const history = getExerciseHistory();
  history[exerciseId] = new Date().toISOString().split('T')[0];
  safeSet('exercise-history', history);
}

export function getStaleExercises(exerciseIds: string[], daysThreshold = 3): string[] {
  const history = getExerciseHistory();
  const today = new Date();
  const stale: string[] = [];

  for (const id of exerciseIds) {
    const lastDate = history[id];
    if (!lastDate) continue; // Never practiced — don't suggest yet
    const daysSince = (today.getTime() - new Date(lastDate).getTime()) / 86400000;
    if (daysSince >= daysThreshold) {
      stale.push(id);
    }
  }

  return stale;
}

// --- Best Accuracy ---

export function getBestAccuracy(): Record<string, number> {
  return safeGet<Record<string, number>>('best-accuracy', {});
}

export function saveBestAccuracy(exerciseId: string, accuracy: number): void {
  const best = getBestAccuracy();
  if (!best[exerciseId] || accuracy > best[exerciseId]) {
    best[exerciseId] = accuracy;
    safeSet('best-accuracy', best);
  }
}

// --- Achievements ---

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-exercise', title: 'First Steps', description: 'Complete your first exercise', icon: '🎵' },
  { id: 'first-piece', title: 'First Melody', description: 'Complete your first piece', icon: '🎶' },
  { id: 'daily-dozen', title: 'The Full Dozen', description: 'Complete all 12 Daily Dozen in one day', icon: '💪' },
  { id: 'streak-7', title: 'Week Warrior', description: 'Practice 7 days in a row', icon: '🔥' },
  { id: 'streak-30', title: 'Monthly Master', description: 'Practice 30 days in a row', icon: '⭐' },
  { id: 'perfect-score', title: 'Perfect Score', description: '100% accuracy on any exercise', icon: '💎' },
  { id: 'pieces-5', title: 'Repertoire Builder', description: 'Complete 5 pieces', icon: '📚' },
  { id: 'hour-practiced', title: 'Dedicated Hour', description: 'Practice for 60 minutes total', icon: '⏱️' },
];

export function getUnlockedAchievements(): Record<string, string> {
  return safeGet<Record<string, string>>('achievements', {});
}

export function unlockAchievement(id: string): boolean {
  const unlocked = getUnlockedAchievements();
  if (unlocked[id]) return false;
  unlocked[id] = new Date().toISOString().split('T')[0];
  safeSet('achievements', unlocked);
  return true;
}

export function checkAndUnlockAchievements(
  completedExercises: string[],
  completedPieces: string[],
  dailyDozenIds: string[],
): string[] {
  const newlyUnlocked: string[] = [];
  const unlocked = getUnlockedAchievements();

  if (completedExercises.length > 0 && !unlocked['first-exercise']) {
    if (unlockAchievement('first-exercise')) newlyUnlocked.push('first-exercise');
  }

  if (completedPieces.length > 0 && !unlocked['first-piece']) {
    if (unlockAchievement('first-piece')) newlyUnlocked.push('first-piece');
  }

  const allDozenDone = dailyDozenIds.every(id => completedExercises.includes(id));
  if (allDozenDone && !unlocked['daily-dozen']) {
    if (unlockAchievement('daily-dozen')) newlyUnlocked.push('daily-dozen');
  }

  const streak = getCurrentStreak();
  if (streak >= 7 && !unlocked['streak-7']) {
    if (unlockAchievement('streak-7')) newlyUnlocked.push('streak-7');
  }
  if (streak >= 30 && !unlocked['streak-30']) {
    if (unlockAchievement('streak-30')) newlyUnlocked.push('streak-30');
  }

  if (completedPieces.length >= 5 && !unlocked['pieces-5']) {
    if (unlockAchievement('pieces-5')) newlyUnlocked.push('pieces-5');
  }

  const sessions = getSessions();
  const totalSeconds = sessions.reduce((sum, s) => sum + s.seconds, 0);
  if (totalSeconds >= 3600 && !unlocked['hour-practiced']) {
    if (unlockAchievement('hour-practiced')) newlyUnlocked.push('hour-practiced');
  }

  return newlyUnlocked;
}

// --- Reset ---

export function resetAllPracticeData(): void {
  const keys = ['practice-days', 'sessions', 'exercise-history', 'best-accuracy', 'achievements'];
  keys.forEach(key => {
    try { localStorage.removeItem(PREFIX + key); } catch {}
  });
}
