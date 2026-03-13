"use client";

import { useMemo, useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { useHabitStore } from "@/store/habitStore";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity, TrendingUp } from "lucide-react";

export function ProductivityCalendar({ initialHabits = [] }: { initialHabits?: any[] }) {
  const { habits, setHabits } = useHabitStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (initialHabits.length > 0) {
      setHabits(initialHabits);
    }
    setMounted(true);
  }, [initialHabits, setHabits]);

  // Generate 91 days grid (13 weeks * 7 days)
  const days = useMemo(() => {
    if (!mounted) return Array(91).fill("");
    const arr = [];
    for (let i = 90; i >= 0; i--) {
      arr.push(format(subDays(new Date(), i), "yyyy-MM-dd"));
    }
    return arr;
  }, [mounted]);

  // Aggregate completion data per day
  const getDayCompletionData = (date: string) => {
    if (!date) return { count: 0, completedHabits: [] };
    
    let count = 0;
    const completedHabits: string[] = [];
    
    habits.forEach((habit) => {
      const entry = habit.history.find((h) => h.date === date);
      if (entry?.completed) {
        count++;
        completedHabits.push(habit.name);
      }
    });
    
    return { count, completedHabits };
  };

  const getIntensityClass = (count: number, maxCount: number) => {
    if (count === 0 || maxCount === 0) return "bg-muted/20 hover:bg-muted/40";
    
    // Calculate ratio of completion
    const ratio = count / maxCount;
    
    if (ratio <= 0.25) return "bg-primary/20 shadow-[0_0_4px_rgba(var(--primary),0.1)]";
    if (ratio <= 0.5) return "bg-primary/40 shadow-[0_0_8px_rgba(var(--primary),0.2)]";
    if (ratio <= 0.75) return "bg-primary/70 shadow-[0_0_12px_rgba(var(--primary),0.4)]";
    return "bg-primary shadow-[0_0_16px_rgba(var(--primary),0.6)]";
  };

  const maxHabits = habits.length;

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 border-border/40 bg-card/60 backdrop-blur-md shadow-sm hover:border-border/80">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <CardHeader className="pb-2 relative z-10 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Productivity Map
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Last 90 days of activity</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1.5">
            <div className="w-3.5 h-3.5 rounded-[3px] bg-muted/20" />
            <div className="w-3.5 h-3.5 rounded-[3px] bg-primary/20" />
            <div className="w-3.5 h-3.5 rounded-[3px] bg-primary/40" />
            <div className="w-3.5 h-3.5 rounded-[3px] bg-primary/70" />
            <div className="w-3.5 h-3.5 rounded-[3px] bg-primary" />
          </div>
          <span>More</span>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-4">
        {/* We use a grid that matches the GitHub style (weeks as columns, days as rows usually, 
            so we'll use 7 rows to represent days of a full week). We'll use 7 rows flowing as columns. */}
        <TooltipProvider delay={100}>
          <div className="w-full flex justify-between sm:justify-start pb-4">
            <div className="grid grid-rows-7 grid-flow-col gap-2.5 sm:gap-3 w-full max-w-full">
              {days.map((date, index) => {
                if (!date) {
                   return <div key={index} className="w-full aspect-square min-w-[1.25rem] rounded-[4px] bg-muted/20" />;
                }
                
                const { count, completedHabits } = getDayCompletionData(date);
                
                return (
                  <Tooltip key={date}>
                    <TooltipTrigger className="cursor-pointer">
                      <div
                        className={cn(
                          "w-full aspect-square min-w-[1.25rem] rounded-[4px] transition-all duration-300 ring-offset-background hover:ring-2 hover:ring-primary/50 hover:ring-offset-1",
                          getIntensityClass(count, maxHabits)
                        )}
                        role="img"
                        aria-label={`${count} habits completed on ${date}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="p-0 border-border/50 shadow-md">
                      <div className="flex flex-col px-3 py-2.5 min-w-[180px]">
                        <p className="font-semibold border-b border-border/50 pb-1.5 mb-1.5 text-sm">
                          {format(new Date(date), "EEEE, MMM d, yyyy")}
                        </p>
                        {count > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            <p className="text-primary font-medium text-sm">
                              {count} of {maxHabits} completed
                            </p>
                            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                              {completedHabits.map(h => (
                                <li key={h} className="truncate">{h}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm pt-1">No habits completed.</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
