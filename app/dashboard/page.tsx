"use client";

import { useHabitStore } from "@/store/habitStore";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { HabitCard } from "@/components/dashboard/HabitCard";
import { JournalEditor } from "@/components/dashboard/JournalEditor";
import { CalendarHeatmap } from "@/components/dashboard/CalendarHeatmap";
import { RightPanel } from "@/components/dashboard/RightPanel";

export default function DashboardPage() {
  const { habits } = useHabitStore();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Left Sidebar - Hidden on mobile, collapsible on tablet, fixed on desktop */}
      <div className="hidden md:flex md:w-64 h-full flex-shrink-0">
        <SidebarNav />
      </div>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        <div className="flex-1 p-6 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
          {/* Header */}
          <header className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Good Evening <span className="inline-block animate-wave origin-bottom-right">👋</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Ready to stay consistent today?
            </p>
          </header>

          {/* Habits Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">Your Habits</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
            </div>
          </section>

          {/* Journal & Heatmap Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            <div className="h-full min-h-[350px]">
              <JournalEditor />
            </div>
            <div className="space-y-6">
              <CalendarHeatmap />
            </div>
          </section>
        </div>
      </main>

      {/* Right Sidebar - Overview Panel */}
      <div className="hidden xl:block w-80 h-full flex-shrink-0">
        <RightPanel />
      </div>
    </div>
  );
}
