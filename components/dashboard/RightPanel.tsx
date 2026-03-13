"use client";

import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { useHabitStore } from "@/store/habitStore";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, TrendingUp, Target, Minus } from "lucide-react";

export function RightPanel({ initialTasks = [] }: { initialTasks?: any[] }) {
  const { tasks, toggleTask, habits, setTasks, removeTask } = useHabitStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Always sync server tasks to keep local state up-to-date with real DB IDs
    setTasks(initialTasks);
    setMounted(true);
  }, [initialTasks, setTasks]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate Productivity Score based on completed habits today
  const productivityScore = useMemo(() => {
    if (!mounted || habits.length === 0) return 0;
    const today = format(new Date(), "yyyy-MM-dd");
    const completedToday = habits.filter(
      (h) => h.history.find((entry) => entry.date === today)?.completed
    ).length;

    return Math.round((completedToday / habits.length) * 100);
  }, [habits, mounted]);

  const scoreColor = useMemo(() => {
    if (productivityScore >= 80) return "text-green-500";
    if (productivityScore >= 50) return "text-blue-500";
    if (productivityScore >= 20) return "text-yellow-500";
    return "text-red-500";
  }, [productivityScore]);

  return (
    <aside className="h-full flex flex-col gap-6 bg-background/40 backdrop-blur-md border-l border-border/40 p-6 overflow-y-auto no-scrollbar relative z-20">
      {/* Productivity Score Card */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden group hover:border-border/80 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            Productivity Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="flex items-end gap-2">
            <span className={cn("text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br", 
              productivityScore >= 80 ? "from-green-400 to-emerald-600" :
              productivityScore >= 50 ? "from-blue-400 to-indigo-600" :
              productivityScore >= 20 ? "from-yellow-400 to-orange-500" :
              "from-red-400 to-rose-600"
            )}>
              {productivityScore}
            </span>
            <span className="text-muted-foreground font-medium pb-1">/ 100</span>
          </div>
          <Progress value={productivityScore} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Based on today&apos;s completed habits.
          </p>
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card className="flex-1 border-border/40 bg-card/60 backdrop-blur-md shadow-sm flex flex-col min-h-[300px]">
        <CardHeader className="pb-3 border-b border-border/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <CheckSquare className="w-4 h-4" /> Today&apos;s Tasks
            </CardTitle>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {tasks.filter(t => t.completed).length}/{tasks.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 min-h-0">
          <div className="h-full px-4 py-4 overflow-y-auto no-scrollbar">
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex flex-col gap-2 p-3.5 rounded-xl border transition-all duration-300 cursor-pointer group/task relative overflow-hidden",
                    task.completed 
                      ? "bg-muted/20 border-border/30" 
                      : "bg-background/50 border-border/50 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(var(--primary),0.05)]"
                  )}
                  onClick={async () => {
                    // Optimistic update in Zustand to make the UI feel fast
                    toggleTask(task.id);
                    
                    // Call the real database action
                    const { toggleTaskComplete } = await import("@/app/actions/tasks");
                    await toggleTaskComplete(task.id, task.completed);
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={async () => {
                          toggleTask(task.id);
                          const { toggleTaskComplete } = await import("@/app/actions/tasks");
                          await toggleTaskComplete(task.id, task.completed);
                        }}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          title={task.title}
                          className={cn(
                            "text-sm font-medium leading-tight transition-all truncate",
                            task.completed && "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </p>
                      </div>
                    </div>
                    {/* Delete minus button */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation(); // Prevent the whole div onClick from firing
                        removeTask(task.id);
                        const { deleteTask } = await import("@/app/actions/tasks");
                        await deleteTask(task.id);
                      }}
                      className="opacity-0 group-hover/task:opacity-100 flex-shrink-0 w-6 h-6 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all bg-background/50 border border-transparent hover:border-destructive/30"
                      aria-label="Delete task"
                      title="Delete task"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
