"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Book, CheckSquare, CalendarDays, Brain, Target, Settings, Check } from "lucide-react";
import { useHabitStore } from "@/store/habitStore";
import { Checkbox } from "@/components/ui/checkbox";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "#" },
  { name: "Journal", icon: Book, path: "#" },
  { name: "Habits", icon: CheckSquare, path: "#" },
  { name: "Calendar", icon: CalendarDays, path: "#" },
  { name: "Knowledge Review", icon: Brain, path: "#" },
  { name: "Assignments", icon: Target, path: "#" },
  { name: "Settings", icon: Settings, path: "#" },
];

export function SidebarNav() {
  const { habits, toggleHabitToday } = useHabitStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="w-64 border-r border-border h-full flex flex-col bg-background/50">
      <div className="p-6">
        <h2 className="text-xl font-bold font-mono tracking-tight text-primary">DailyRoutine</h2>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.path}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group"
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </a>
        ))}

        <div className="mt-8 mb-4">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Today's Habits
          </h3>
          <div className="space-y-1">
            {habits.map((habit) => {
              const today = mounted ? new Date().toISOString().split("T")[0] : "";
              const isCompleted = mounted 
                ? (habit.history.find(h => h.date === today)?.completed || false)
                : false;
              
              return (
                <div 
                  key={habit.id}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Checkbox 
                    id={`habit-${habit.id}`} 
                    checked={isCompleted}
                    onCheckedChange={() => toggleHabitToday(habit.id)}
                    className="w-4 h-4"
                  />
                  <label 
                    htmlFor={`habit-${habit.id}`}
                    className={cn(
                      "text-sm font-medium leading-none cursor-pointer flex-1 transition-all",
                      isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {habit.name}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
