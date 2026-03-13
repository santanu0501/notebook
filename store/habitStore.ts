import { create } from "zustand";
import { format } from "date-fns";
import { Habit, Task, JournalEntry, MOCK_HABITS, MOCK_TASKS, MOCK_JOURNAL_ENTRIES } from "../lib/mockData";

interface HabitStore {
  habits: Habit[];
  tasks: Task[];
  journalEntries: JournalEntry[];
  activeView: "dashboard" | "journal";
  
  // Actions
  toggleHabitToday: (habitId: string) => void;
  toggleTask: (taskId: string) => void;
  addJournalEntry: (content: string) => void;
  addTask: (title: string) => void;
  addHabit: (name: string) => void;
  setActiveView: (view: "dashboard" | "journal") => void;
  setTasks: (tasks: any[]) => void;
  setHabits: (habits: any[]) => void;
  setJournalEntries: (entries: any[]) => void;

  removeTask: (taskId: string) => void;
  removeHabit: (habitId: string) => void;
  removeJournalEntry: (id: string) => void;
}

export const useHabitStore = create<HabitStore>((set) => ({
  habits: MOCK_HABITS,
  tasks: MOCK_TASKS,
  journalEntries: MOCK_JOURNAL_ENTRIES,
  activeView: "dashboard",

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

  addTask: (title) =>
    set((state) => ({
      tasks: [
        { id: `t${Date.now()}`, title, completed: false },
        ...state.tasks,
      ],
    })),

  addHabit: (name) =>
    set((state) => ({
      habits: [
        { id: `h${Date.now()}`, name, history: [] },
        ...state.habits,
      ],
    })),

  setActiveView: (view) =>
    set({ activeView: view }),

  setTasks: (dbTasks) => 
    set({ tasks: dbTasks }),
    
  setHabits: (dbHabits) =>
    set({ habits: dbHabits }),
    
  setJournalEntries: (entries) =>
    set({ journalEntries: entries }),

  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== taskId)
    })),

  removeHabit: (habitId) =>
    set((state) => ({
      habits: state.habits.filter(h => h.id !== habitId)
    })),

  removeJournalEntry: (id) =>
    set((state) => ({
      journalEntries: state.journalEntries.filter(entry => entry.id !== id)
    }))
}));
