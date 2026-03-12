"use client";

import { useHabitStore } from "@/store/habitStore";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { ProductivityCalendar } from "@/components/dashboard/ProductivityCalendar";
import { JournalEditor } from "@/components/dashboard/JournalEditor";
import { TopStreaks } from "@/components/dashboard/TopStreaks";
import { RightPanel } from "@/components/dashboard/RightPanel";
import { JournalBook } from "@/components/dashboard/JournalBook";

export default function DashboardPage() {
  const { habits, activeView } = useHabitStore();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans relative selection:bg-primary/30">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Left Sidebar - Hidden on mobile, collapsible on tablet, fixed on desktop */}
      <div className="hidden md:flex md:w-64 h-full flex-shrink-0">
        <SidebarNav />
      </div>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        <div className="flex-1 p-6 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
          {/* Header */}
          <header className="space-y-2 relative z-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Good Evening <span className="inline-block animate-wave origin-bottom-right drop-shadow-sm text-foreground">👋</span>
            </h1>
            <p className="text-muted-foreground text-lg font-medium">
              Ready to stay consistent today?
            </p>
          </header>

          {/* Main Content Area */}
          {activeView === "dashboard" ? (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Row: Heatmap (2 cols) + Journal (1 col) */}
              <div className="lg:col-span-2">
                <ProductivityCalendar />
              </div>
              <div className="lg:col-span-1 h-full min-h-[250px]">
                <JournalEditor />
              </div>
              
              {/* Bottom Row: Top Streaks (Full width) */}
              <div className="lg:col-span-3 pb-8">
                <TopStreaks />
              </div>
            </section>
          ) : (
            <JournalBook />
          )}
        </div>
      </main>

      {/* Right Sidebar - Overview Panel */}
      <div className="hidden xl:block w-80 h-full flex-shrink-0">
        <RightPanel />
      </div>
    </div>
  );
}
