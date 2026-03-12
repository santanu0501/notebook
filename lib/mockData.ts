import { subDays, format } from "date-fns";
import { HabitHistoryEntry } from "./streak";

export interface Habit {
  id: string;
  name: string;
  history: HabitHistoryEntry[];
  icon?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  tags?: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
}

// Generate last 14 days history helper
const generateHistory = (
  completionProbability: number
): HabitHistoryEntry[] => {
  const history: HabitHistoryEntry[] = [];
  for (let i = 0; i < 14; i++) {
    const d = subDays(new Date(), i);
    history.push({
      date: format(d, "yyyy-MM-dd"),
      completed: Math.random() < completionProbability,
    });
  }
  return history;
};

export const MOCK_HABITS: Habit[] = [
  {
    id: "h1",
    name: "Read 20 Pages",
    icon: "book",
    history: generateHistory(0.7),
  },
  {
    id: "h2",
    name: "Meditation",
    icon: "cloud",
    history: generateHistory(0.5),
  },
  {
    id: "h3",
    name: "Coding Practice",
    icon: "code",
    history: generateHistory(0.9),
  },
  {
    id: "h4",
    name: "Exercise",
    icon: "activity",
    history: generateHistory(0.6),
  },
  {
    id: "h5",
    name: "Study AI",
    icon: "brain",
    history: generateHistory(0.8),
  },
  {
    id: "h6",
    name: "Journal Writing",
    icon: "pen-tool",
    history: generateHistory(0.65),
  },
];

export const MOCK_TASKS: Task[] = [
  { id: "t1", title: "Finish hackathon MVP", completed: false, tags: ["urgent"] },
  { id: "t2", title: "Push GitHub commit", completed: true, tags: ["casual"] },
  { id: "t3", title: "Write journal", completed: false },
  { id: "t4", title: "Review AI concepts", completed: false, tags: ["important"] },
  { id: "t5", title: "Plan out revision topics in planner", completed: true, tags: ["urgent"] },
  { id: "t6", title: "Make flashcards for 6 marker biological processes", completed: false, tags: ["important"] },
  { id: "t7", title: "Read 10 pages of a new book on system design and architecture for web apps", completed: false },
];

export const MOCK_JOURNAL_ENTRIES: JournalEntry[] = Array.from({ length: 10 }).map(
  (_, i) => ({
    id: `j${i}`,
    date: format(subDays(new Date(), i), "yyyy-MM-dd"),
    content:
      i === 0
        ? "Today I worked on my hackathon project and implemented the habit streak logic. Feeling productive."
        : `Journal entry for day minus ${i}. Feeling good and making progress on different subjects and goals. I mostly focused on maintaining my streak today.`,
  })
);
