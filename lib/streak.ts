export interface HabitHistoryEntry {
  date: string; // ISO format string: YYYY-MM-DD
  completed: boolean;
  totalHabits?: number; // Snapshot of total habits user had on this day
}

export function calculateCurrentStreak(history: HabitHistoryEntry[]): number {
  if (!history || history.length === 0) return 0;

  let streak = 0;
  // Sort history chronologically descending
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // We should only count contiguous days from today or yesterday.
  // For simplicity based on prompt, let's just count contiguous `completed: true` from the most recent entry backwards.
  for (const entry of sortedHistory) {
    if (entry.completed) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(history: HabitHistoryEntry[]): number {
  if (!history || history.length === 0) return 0;

  let maxStreak = 0;
  let currentStreak = 0;

  // Sort history chronologically ascending
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const entry of sortedHistory) {
    if (entry.completed) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}
