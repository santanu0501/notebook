"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Book, CheckSquare, Flame, Settings, LogOut, Minus, PanelLeftClose, PanelLeft } from "lucide-react";
import { useHabitStore } from "@/store/habitStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "#", action: "dashboard" },
  { name: "Journal", icon: Book, path: "#", action: "journal" },
  { name: "Tasks", icon: CheckSquare, path: "#", action: "task" },
  { name: "Habits", icon: Flame, path: "#", action: "habit" },
  { name: "Settings", icon: Settings, path: "#" },
];

export function SidebarNav() {
  const { habits, toggleHabitToday, addTask, addHabit, removeHabit, setActiveView, activeView } = useHabitStore();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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

  const handleAddTask = async () => {
    if (inputValue.trim()) {
      const currentInput = inputValue.trim();
      addTask(currentInput);
      setIsTaskModalOpen(false);
      setInputValue("");
      const { createTask } = await import("@/app/actions/tasks");
      await createTask(currentInput);
    }
  };

  const handleAddHabit = async () => {
    if (inputValue.trim()) {
      const currentInput = inputValue.trim();
      addHabit(currentInput);
      setIsHabitModalOpen(false);
      setInputValue("");
      const { createHabit } = await import("@/app/actions/habits");
      await createHabit(currentInput);
    }
  };

  return (
    <aside
      className={cn(
        "border-r border-border/40 h-full flex flex-col bg-background/40 backdrop-blur-xl relative z-20 transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Header with toggle */}
      <div className={cn("p-4 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        <h2
          className={cn(
            "text-2xl font-extrabold tracking-tight bg-gradient-to-br from-primary to-blue-500 bg-clip-text text-transparent transition-all duration-300 whitespace-nowrap overflow-hidden",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100 pl-2"
          )}
        >
          Notebook.
        </h2>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200 flex-shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      <nav className={cn("flex-1 px-2 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar", collapsed && "px-2")}>
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.path}
            onClick={(e) => handleNavClick(e, item.name, item.action)}
            title={collapsed ? item.name : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative whitespace-nowrap",
              collapsed && "justify-center px-0",
              (item.action === "dashboard" || item.action === "journal") && activeView === item.action 
                ? "bg-primary/20 text-primary" 
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span className={cn(
              "transition-all duration-300",
              collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
            )}>
              {item.name}
            </span>
          </a>
        ))}

        {/* Habits section */}
        <div className={cn("mt-8 mb-4 transition-all duration-300", collapsed && "mt-4")}>
          <h3 className={cn(
            "px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 transition-all duration-300 whitespace-nowrap overflow-hidden",
            collapsed ? "opacity-0 h-0 mb-0" : "opacity-100 h-auto"
          )}>
            Habits
          </h3>
          {/* Divider when collapsed */}
          {collapsed && (
            <div className="mx-2 mb-2 border-t border-border/40" />
          )}
          <div className="space-y-1">
            {mounted && habits.map((habit) => {
              const today = mounted ? new Date().toISOString().split("T")[0] : "";
              const isCompleted = mounted 
                ? (habit.history.find(h => h.date === today)?.completed || false)
                : false;
              
              return (
                <div 
                  key={habit.id}
                  title={collapsed ? habit.name : undefined}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors group/habit",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <div className={cn("flex items-center space-x-3 min-w-0 flex-1", collapsed && "space-x-0 justify-center")}>
                    <Checkbox 
                      id={`habit-${habit.id}`} 
                      checked={isCompleted}
                      onCheckedChange={async () => {
                        toggleHabitToday(habit.id);
                        const { toggleHabit } = await import("@/app/actions/habits");
                        const d = new Date().toISOString().split("T")[0];
                        await toggleHabit(habit.id, d, isCompleted);
                      }}
                      className="w-4 h-4 flex-shrink-0"
                    />
                    <label 
                      htmlFor={`habit-${habit.id}`}
                      className={cn(
                        "text-sm font-medium leading-none cursor-pointer flex-1 transition-all truncate",
                        isCompleted ? "line-through text-muted-foreground" : "text-foreground",
                        collapsed && "w-0 opacity-0 overflow-hidden hidden"
                      )}
                    >
                      {habit.name}
                    </label>
                  </div>
                  {!collapsed && (
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        removeHabit(habit.id);
                        const { deleteHabit } = await import("@/app/actions/habits");
                        await deleteHabit(habit.id);
                      }}
                      className="opacity-0 group-hover/habit:opacity-100 flex-shrink-0 w-6 h-6 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all bg-background/50 border border-transparent hover:border-destructive/30"
                      aria-label="Delete habit"
                      title="Delete habit"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer Area with Sign Out */}
      <div className="p-3 mt-auto border-t border-border/40">
        <SignOutButton>
          <button className={cn(
            "flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group whitespace-nowrap",
            collapsed && "justify-center px-0"
          )}>
            <LogOut className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:-translate-x-1" />
            <span className={cn(
              "transition-all duration-300",
              collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
            )}>
              Sign Out
            </span>
          </button>
        </SignOutButton>
      </div>

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
