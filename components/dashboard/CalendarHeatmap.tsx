"use client";

import { useMemo, useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { useHabitStore } from "@/store/habitStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar as CalendarIcon, FileText, CheckCircle2 } from "lucide-react";

export function CalendarHeatmap() {
  const { habits, journalEntries } = useHabitStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate 14 days grid
  const days = useMemo(() => {
    if (!mounted) return [];
    
    const arr = [];
    for (let i = 13; i >= 0; i--) {
      arr.push(format(subDays(new Date(), i), "yyyy-MM-dd"));
    }
    return arr;
  }, [mounted]);

  const getDayStats = (date: string) => {
    let completedCount = 0;
    const completedHabits: string[] = [];
    
    habits.forEach((habit) => {
      const entry = habit.history.find((h) => h.date === date);
      if (entry?.completed) {
        completedCount++;
        completedHabits.push(habit.name);
      }
    });

    const journal = journalEntries.find((j) => j.date === date);

    return { completedCount, completedHabits, journal };
  };

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted/50 border border-border/50";
    if (count <= 1) return "bg-blue-300/40 border border-blue-400/20";
    if (count <= 3) return "bg-blue-400/60 border border-blue-500/20";
    if (count <= 4) return "bg-blue-500/80 border border-blue-600/20";
    return "bg-blue-600 border border-blue-700/20"; // 5+ habits
  };

  const selectedStats = selectedDate ? getDayStats(selectedDate) : null;

  return (
    <>
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4" /> 14-Day History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <TooltipProvider delay={100}>
              {days.map((date) => {
                const { completedCount } = getDayStats(date);
                return (
                  <Tooltip key={date}>
                    <TooltipTrigger className="cursor-pointer">
                      <div
                        onClick={() => setSelectedDate(date)}
                        className={`w-8 h-8 rounded-sm transition-all hover:ring-2 ring-primary/50 ring-offset-1 ring-offset-background ${getIntensityClass(
                          completedCount
                        )}`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedDate(date);
                          }
                        }}
                        aria-label={`Activity on ${date}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs font-medium">
                        {format(new Date(date), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {completedCount} habits completed
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Day Details */}
      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              {selectedDate && format(new Date(selectedDate), "EEEE, MMMM do, yyyy")}
            </DialogTitle>
            <DialogDescription>
              Activity overview for this day.
            </DialogDescription>
          </DialogHeader>
          
          {selectedStats && (
            <div className="space-y-6 mt-4">
              {/* Habits Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> Habits Completed ({selectedStats.completedCount})
                </h4>
                {selectedStats.completedHabits.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedStats.completedHabits.map((habit) => (
                      <li key={habit} className="text-sm flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {habit}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md border border-border/50">
                    No habits completed on this day.
                  </p>
                )}
              </div>

              {/* Journal Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                  <FileText className="w-4 h-4" /> Journal Entry
                </h4>
                {selectedStats.journal ? (
                  <div className="text-sm text-foreground bg-muted/50 p-4 rounded-md leading-relaxed border border-border/50">
                    {selectedStats.journal.content}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md border border-border/50">
                    No journal entry for this day.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
