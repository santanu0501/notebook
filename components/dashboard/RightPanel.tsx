"use client";

import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { useHabitStore } from "@/store/habitStore";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, TrendingUp, Target } from "lucide-react";

export function RightPanel() {
  const { tasks, toggleTask, habits } = useHabitStore();
  const [mounted, setMounted] = useState(false);

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
    <aside className="h-full flex flex-col gap-6 bg-background/50 border-l border-border p-6 overflow-y-auto">
      {/* Productivity Score Card */}
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" /> Productivity Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-2">
            <span className={cn("text-5xl font-bold tracking-tighter", scoreColor)}>
              {productivityScore}
            </span>
            <span className="text-muted-foreground font-medium pb-1">/ 100</span>
          </div>
          <Progress value={productivityScore} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Based on today's completed habits.
          </p>
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card className="flex-1 border-border/50 bg-card shadow-sm flex flex-col min-h-[300px]">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <CheckSquare className="w-4 h-4" /> Today's Tasks
            </CardTitle>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {tasks.filter(t => t.completed).length}/{tasks.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-full px-4 py-4">
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex flex-col gap-2 p-3 rounded-lg border transition-all cursor-pointer group hover:border-primary/50",
                    task.completed 
                      ? "bg-muted/30 border-border/40" 
                      : "bg-background border-border"
                  )}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-0.5"
                    />
                    <div className="space-y-1.5 flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium leading-tight transition-all",
                          task.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {task.title}
                      </p>
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-1">
                          {task.tags.map(tag => (
                            <span 
                              key={tag} 
                              className={cn(
                                "text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm flex items-center gap-1",
                                tag === 'urgent' ? "bg-red-500/10 text-red-500" :
                                tag === 'important' ? "bg-orange-500/10 text-orange-500" :
                                "bg-blue-500/10 text-blue-500"
                              )}
                            >
                              <Target className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </aside>
  );
}
