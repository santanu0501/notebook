"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useHabitStore } from "@/store/habitStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function JournalBook() {
  const { journalEntries, removeJournalEntry } = useHabitStore();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(
    journalEntries.length > 0 ? journalEntries[0].id : null
  );

  const selectedEntry = journalEntries.find((entry) => entry.id === selectedEntryId);

  const handleDeleteEntry = async (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    // Optimistic removal from local state
    removeJournalEntry(entryId);

    // If the deleted entry was selected, select another one
    if (selectedEntryId === entryId) {
      const remaining = journalEntries.filter((entry) => entry.id !== entryId);
      setSelectedEntryId(remaining.length > 0 ? remaining[0].id : null);
    }

    // Delete from database
    const { deleteJournalEntry } = await import("@/app/actions/journal");
    await deleteJournalEntry(entryId);
  };

  if (journalEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[500px]">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-primary/60" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No Journal Entries Yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Head back to the dashboard and write your first journal entry to start filling your book!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
      {/* Left Pane - Entry List (Pages) */}
      <Card className="md:col-span-4 border-border/40 bg-card/60 backdrop-blur-md shadow-sm flex flex-col h-full overflow-hidden relative group hover:border-border/80 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <CardHeader className="pb-3 border-b border-border/30 shrink-0">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <BookOpen className="w-4 h-4" /> Journal Pages
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 min-h-0">
          <div className="h-full px-3 py-3 overflow-y-auto no-scrollbar">
            <div className="space-y-2">
              {journalEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "w-full text-left p-4 rounded-xl transition-all duration-200 border cursor-pointer group/entry relative",
                    selectedEntryId === entry.id
                      ? "bg-primary/10 border-primary/30 shadow-sm"
                      : "bg-background/50 border-border/50 hover:bg-muted/50 hover:border-border/80"
                  )}
                  onClick={() => setSelectedEntryId(entry.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      selectedEntryId === entry.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium",
                        selectedEntryId === entry.id ? "text-primary" : "text-foreground"
                      )}>
                        {format(parseISO(entry.date), "MMMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {entry.content}
                      </p>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteEntry(e, entry.id)}
                      className="opacity-0 group-hover/entry:opacity-100 shrink-0 w-7 h-7 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all border border-transparent hover:border-destructive/30"
                      aria-label="Delete journal entry"
                      title="Delete journal entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Pane - Full Entry Content */}
      <Card className="md:col-span-8 border-border/40 bg-card/60 backdrop-blur-md shadow-sm h-full flex flex-col relative group hover:border-border/80 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {selectedEntry ? (
          <>
            <CardHeader className="pb-4 border-b border-border/30 shrink-0">
              <h2 className="text-2xl font-bold text-foreground">
                {format(parseISO(selectedEntry.date), "EEEE, MMMM do, yyyy")}
              </h2>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
              <ScrollArea className="h-full px-6 py-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {selectedEntry.content}
                  </p>
                </div>
              </ScrollArea>
            </CardContent>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select an entry to read.
          </div>
        )}
      </Card>
    </div>
  );
}
