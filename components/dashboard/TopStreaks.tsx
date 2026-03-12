"use client";

import { useHabitStore } from "@/store/habitStore";
import { calculateCurrentStreak, calculateLongestStreak } from "@/lib/streak";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";

export function TopStreaks() {
  const { habits } = useHabitStore();

  // Calculate streaks and sort by best current streak
  const streakData = habits
    .map((habit) => {
      const currentStreak = calculateCurrentStreak(habit.history);
      const longestStreak = calculateLongestStreak(habit.history);
      return { ...habit, currentStreak, longestStreak };
    })
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, 4); // Show top 4

  if (streakData.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-sm transition-colors hover:border-border/80 group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <CardContent className="p-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {streakData.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-orange-500/30"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-base truncate" title={habit.name}>
                  {habit.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm font-semibold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md">
                    {habit.currentStreak} {habit.currentStreak === 1 ? "Day" : "Days"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
