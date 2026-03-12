"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Book, CheckSquare, Flame, Settings } from "lucide-react";
import { useHabitStore } from "@/store/habitStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "#", action: "dashboard" },
  { name: "Journal", icon: Book, path: "#", action: "journal" },
  { name: "Tasks", icon: CheckSquare, path: "#", action: "task" },
  { name: "Habits", icon: Flame, path: "#", action: "habit" },
  { name: "Settings", icon: Settings, path: "#" },
];

export function SidebarNav() {
  const { habits, toggleHabitToday, addTask, addHabit, setActiveView, activeView } = useHabitStore();
  const [mounted, setMounted] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, name: string, action?: string) => {
    e.preventDefault();
    if (action === "dashboard" || action === "journal") {
      setActiveView(action);
    } else if (action === "task") {
      setInputValue("");
      setIsTaskModalOpen(true);
    } else if (action === "habit") {
      e.preventDefault();
      setInputValue("");
      setIsHabitModalOpen(true);
    }
  };

  const handleAddTask = () => {
    if (inputValue.trim()) {
      addTask(inputValue.trim());
      setIsTaskModalOpen(false);
      setInputValue("");
    }
  };

  const handleAddHabit = () => {
    if (inputValue.trim()) {
      addHabit(inputValue.trim());
      setIsHabitModalOpen(false);
      setInputValue("");
    }
  };

  return (
    <aside className="w-64 border-r border-border/40 h-full flex flex-col bg-background/40 backdrop-blur-xl relative z-20">
      <div className="p-6">
        <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-br from-primary to-blue-500 bg-clip-text text-transparent">
          Notebook.
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.path}
            onClick={(e) => handleNavClick(e, item.name, item.action)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative",
              (item.action === "dashboard" || item.action === "journal") && activeView === item.action 
                ? "bg-primary/20 text-primary" 
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            )}
          >
            <item.icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            {item.name}
          </a>
        ))}

        <div className="mt-8 mb-4">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Today&apos;s Habits
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
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors group"
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

      {/* Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <input
              type="text"
              placeholder="What do you need to do?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTask();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Habit Modal */}
      <Dialog open={isHabitModalOpen} onOpenChange={setIsHabitModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <input
              type="text"
              placeholder="What habit do you want to start?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddHabit();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHabitModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddHabit}>Add Habit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
