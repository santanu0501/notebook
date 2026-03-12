import { create } from "zustand";
import { format } from "date-fns";
import { Habit, Task, JournalEntry, MOCK_HABITS, MOCK_TASKS, MOCK_JOURNAL_ENTRIES } from "../lib/mockData";

interface HabitStore {
  habits: Habit[];
  tasks: Task[];
  journalEntries: JournalEntry[];
  
  // Actions
  toggleHabitToday: (habitId: string) => void;
  toggleTask: (taskId: string) => void;
  addJournalEntry: (content: string) => void;
}

export const useHabitStore = create<HabitStore>((set) => ({
  habits: MOCK_HABITS,
  tasks: MOCK_TASKS,
  journalEntries: MOCK_JOURNAL_ENTRIES,

  toggleHabitToday: (habitId) =>
    set((state) => {
      const today = format(new Date(), "yyyy-MM-dd");
      return {
        habits: state.habits.map((habit) => {
          if (habit.id === habitId) {
            const todayEntry = habit.history.find((h) => h.date === today);
            
            let newHistory;
            if (todayEntry) {
              newHistory = habit.history.map((h) =>
                h.date === today ? { ...h, completed: !h.completed } : h
              );
            } else {
              newHistory = [...habit.history, { date: today, completed: true }];
            }

            return { ...habit, history: newHistory };
          }
          return habit;
        }),
      };
    }),

  toggleTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    })),

  addJournalEntry: (content) =>
    set((state) => ({
      journalEntries: [
        {
          id: `j${Date.now()}`,
          date: format(new Date(), "yyyy-MM-dd"),
          content,
        },
        ...state.journalEntries,
      ],
    })),
}));
