"use client";

import { useMemo } from "react";
import { Habit } from "@/lib/mockData";
import { calculateCurrentStreak, calculateLongestStreak } from "@/lib/streak";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Activity, Book, Brain, Cloud, Code, PenTool } from "lucide-react";

// Helper to map icon names to Lucide components
const IconMap: Record<string, any> = {
  book: Book,
  cloud: Cloud,
  code: Code,
  activity: Activity,
  brain: Brain,
  "pen-tool": PenTool,
};

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const currentStreak = useMemo(() => calculateCurrentStreak(habit.history), [habit.history]);
  const longestStreak = useMemo(() => calculateLongestStreak(habit.history), [habit.history]);

  // Calculate completion percentage over the provided 14 days history
  const completionRate = useMemo(() => {
    if (!habit.history || habit.history.length === 0) return 0;
    const completedDays = habit.history.filter((h) => h.completed).length;
    return Math.round((completedDays / habit.history.length) * 100);
  }, [habit.history]);

  const IconComponent = habit.icon && IconMap[habit.icon] ? IconMap[habit.icon] : Activity;

  return (
    <Card className="hover:-translate-y-1 transition-transform duration-200 border-border/50 bg-card overflow-hidden shadow-sm hover:shadow-md">
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <IconComponent className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base leading-none tracking-tight">{habit.name}</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 my-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-orange-500" /> Current
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">{currentStreak}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Best
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">{longestStreak}</div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/40">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">Completion Rate</span>
            <span className="text-foreground">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
