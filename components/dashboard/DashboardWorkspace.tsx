"use client";

import { useEffect } from "react";
import { useHabitStore } from "@/store/habitStore";
import { ProductivityCalendar } from "@/components/dashboard/ProductivityCalendar";
import { JournalEditor } from "@/components/dashboard/JournalEditor";
import { TopStreaks } from "@/components/dashboard/TopStreaks";
import { JournalBook } from "@/components/dashboard/JournalBook";

export function DashboardWorkspace({ 
  serverHabits, 
  serverJournalEntries 
}: { 
  serverHabits: any[]; 
  serverJournalEntries: any[]; 
}) {
  const { activeView, setJournalEntries } = useHabitStore();

  useEffect(() => {
    // Sync server journal entries to the global store so JournalBook and other components can use them
    if (serverJournalEntries) {
      // Map the DB entry to match the store's JournalEntry format if needed
      const formattedEntries = serverJournalEntries.map(entry => ({
        id: entry.id,
        date: new Date(entry.createdAt).toISOString(),
        content: entry.content
      }));
      setJournalEntries(formattedEntries);
    }
  }, [serverJournalEntries, setJournalEntries]);

  if (activeView === "journal") {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <JournalBook />
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-2">
        <ProductivityCalendar initialHabits={serverHabits} />
      </div>
      <div className="lg:col-span-1 h-full min-h-[250px]">
        <JournalEditor />
      </div>
      
      <div className="lg:col-span-3 pb-8">
        <TopStreaks initialHabits={serverHabits} />
      </div>
    </section>
  );
}
