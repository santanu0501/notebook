"use client";

import { useMemo, useState } from "react";
import { format, subDays, parseISO, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the valid sentiments aligned with the AI schema
type Sentiment = 
  | 'Positive' | 'Productive' | 'Calm' | 'Neutral' 
  | 'Anxious' | 'Sad' | 'Lethargic' | 'Stressed' 
  | 'Overwhelmed' | 'Angry' | 'Frustrated';

interface JournalEntryWithMetadata {
  id: string;
  date: string;
  content: string;
  sentiment?: Sentiment | null;
  themes?: string[];
}

export function EmotionalTrends({ 
  entries, 
  days = 14 
}: { 
  entries: JournalEntryWithMetadata[];
  days?: number;
}) {
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);

  // Count entries missing sentiment
  const missingCount = useMemo(() => {
    return entries.filter(e => !e.sentiment).length;
  }, [entries]);

  // Generate the last X days array
  const dateRange = useMemo(() => {
    return Array.from({ length: days }).map((_, i) => subDays(new Date(), days - 1 - i));
  }, [days]);

  // Map entries to days for the mood calender and extract common themes
  const { moodData, topThemes } = useMemo(() => {
    const themeCounts: Record<string, number> = {};
    
    // Count themes from ALL entries
    entries.forEach(entry => {
      if (entry.themes && Array.isArray(entry.themes)) {
        entry.themes.forEach(theme => {
          if (theme) {
            // Capitalize first letter for consistency
            const normalizedTheme = theme.charAt(0).toUpperCase() + theme.slice(1).toLowerCase();
            themeCounts[normalizedTheme] = (themeCounts[normalizedTheme] || 0) + 1;
          }
        });
      }
    });

    const moodData = dateRange.map(date => {
      const entryForDay = entries.find(entry => isSameDay(parseISO(entry.date), date));

      return {
        date,
        sentiment: entryForDay?.sentiment as Sentiment | undefined | null,
        hasEntry: !!entryForDay
      };
    });

    // Sort themes by frequency and get top 4
    const sortedThemes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([theme]) => theme);

    return { moodData, topThemes: sortedThemes };
  }, [entries, dateRange]);

  // Helper to map sentiments to Tailwind colors
  const getSentimentColor = (sentiment?: Sentiment | null) => {
    if (!sentiment) return "bg-muted/30 border-border/40 text-transparent";
    
    switch (sentiment) {
      case 'Positive':
        return "bg-emerald-400/40 text-emerald-400 border-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.4)]";
      case 'Productive':
        return "bg-cyan-400/40 text-cyan-400 border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.4)]";
      case 'Calm':
        return "bg-sky-400/40 text-sky-400 border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.4)]";
      case 'Neutral':
        return "bg-slate-400/40 text-slate-400 border-slate-400/50 shadow-[0_0_12px_rgba(148,163,184,0.4)]";
      case 'Anxious':
        return "bg-amber-400/40 text-amber-400 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.4)]";
      case 'Stressed':
        return "bg-orange-500/40 text-orange-500 border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.4)]";
      case 'Overwhelmed':
        return "bg-fuchsia-500/40 text-fuchsia-500 border-fuchsia-500/50 shadow-[0_0_12px_rgba(217,70,239,0.4)]";
      case 'Sad':
        return "bg-violet-500/40 text-violet-500 border-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.4)]";
      case 'Lethargic':
        return "bg-indigo-500/40 text-indigo-400 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.4)]";
      case 'Angry':
        return "bg-red-500/40 text-red-500 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.4)]";
      case 'Frustrated':
        return "bg-rose-500/40 text-rose-500 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.4)]";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getSentimentEmoji = (sentiment?: Sentiment | null) => {
    if (!sentiment) return "";
    switch (sentiment) {
      case 'Positive': case 'Productive': return "😊";
      case 'Calm': case 'Neutral': return "😌";
      case 'Anxious': case 'Stressed': case 'Overwhelmed': return "😰";
      case 'Sad': case 'Lethargic': return "😔";
      case 'Angry': case 'Frustrated': return "😤";
      default: return "";
    }
  };

  const handleBackfill = async () => {
    setIsBackfilling(true);
    setBackfillResult(null);
    try {
      const { backfillJournalSentiments } = await import("@/app/actions/journal");
      const result = await backfillJournalSentiments();
      if (result.success) {
        setBackfillResult(`✅ Analyzed ${result.updated}/${result.total} entries!`);
        // Reload the page to show updated data
        window.location.reload();
      } else {
        setBackfillResult(`❌ ${result.error}`);
      }
    } catch (err) {
      setBackfillResult("❌ Backfill failed");
    } finally {
      setIsBackfilling(false);
    }
  };

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden group hover:border-border/80 transition-colors mb-6">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider relative z-10">
          The Mood Ring
        </CardTitle>
        <div className="flex items-center gap-3">
          {missingCount > 0 && (
            <button
              onClick={handleBackfill}
              disabled={isBackfilling}
              className={cn(
                "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium transition-all",
                isBackfilling 
                  ? "bg-primary/10 text-primary/60 border-primary/20 cursor-wait" 
                  : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30 cursor-pointer"
              )}
            >
              <RefreshCw className={cn("w-3 h-3", isBackfilling && "animate-spin")} />
              {isBackfilling ? "Analyzing..." : `Analyze ${missingCount} old entries`}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5 relative z-10">
        
        {backfillResult && (
          <div className="text-xs text-center py-1.5 px-3 rounded-lg bg-muted/50 border border-border/30">
            {backfillResult}
          </div>
        )}

        {/* Mood Calendar Row */}
        <div>
          <div className="flex gap-1 justify-between">
            {moodData.map((day, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center group/day relative cursor-help"
                title={day.hasEntry ? `${day.sentiment || 'Unanalyzed'} ${getSentimentEmoji(day.sentiment)}` : 'No entry'}
              >
                <div className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-all duration-300 flex items-center justify-center",
                  getSentimentColor(day.sentiment),
                  day.hasEntry && !day.sentiment ? "bg-muted/80 border-dashed border-muted-foreground/30" : "",
                  !day.hasEntry && "opacity-50"
                )}>
                  <span className={cn(
                    "text-[10px] sm:text-[11px] font-semibold",
                    day.sentiment ? "text-white/90" : "text-muted-foreground/70"
                  )}>
                    {format(day.date, "d")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Themes */}
        {topThemes.length > 0 && (
          <div className="pt-3 border-t border-border/30">
            <span className="text-xs font-medium text-muted-foreground block mb-2">
              Recurring Themes
            </span>
            <div className="flex flex-wrap gap-2">
              {topThemes.map((theme, i) => (
                <span 
                  key={i} 
                  className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {entries.length > 0 && topThemes.length === 0 && missingCount > 0 && (
          <div className="pt-2 text-xs text-muted-foreground italic text-center">
            Click &quot;Analyze old entries&quot; above to generate mood colors and themes.
          </div>
        )}

      </CardContent>
    </Card>
  );
}
