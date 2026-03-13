import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getTasks } from "@/app/actions/tasks";
import { getHabits } from "@/app/actions/habits";
import { redirect } from "next/navigation";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { RightPanel } from "@/components/dashboard/RightPanel";
import { getJournalEntries } from "@/app/actions/journal";
import { DashboardWorkspace } from "@/components/dashboard/DashboardWorkspace";

function getGreeting() {
  const hourStr = new Date().toLocaleString("en-US", { 
    timeZone: "Asia/Kolkata", 
    hour: "numeric", 
    hour12: false 
  });
  const hour = parseInt(hourStr, 10);
  
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/login");
  }

  // Lazy sync user to our DB so foreign key constraints work for tasks/habits/journals
  const primaryEmail = user.emailAddresses[0]?.emailAddress;
  await db.user.upsert({
    where: { id: user.id },
    update: {
      email: primaryEmail,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    },
    create: {
      id: user.id,
      email: primaryEmail,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    }
  });

  // Fetch initial data from server here to pass into client components
  const serverTasks = await getTasks();
  const serverHabits = await getHabits();
  const serverJournalEntries = await getJournalEntries();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans relative selection:bg-primary/30">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Left Sidebar */}
      <div className="hidden md:flex md:w-64 h-full flex-shrink-0">
        <SidebarNav />
      </div>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        <div className="flex-1 p-6 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
          {/* Header */}
          <header className="space-y-2 relative z-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {getGreeting()}, {user.firstName || "User"} <span className="inline-block animate-wave origin-bottom-right drop-shadow-sm text-foreground">👋</span>
            </h1>
            <p className="text-muted-foreground text-lg font-medium">
              Ready to stay consistent today?
            </p>
          </header>

          {/* Main Content Area */}
          <DashboardWorkspace 
            serverHabits={serverHabits} 
            serverJournalEntries={serverJournalEntries} 
          />
        </div>
      </main>

      {/* Right Sidebar - Overview Panel */}
      <div className="hidden xl:block w-80 h-full flex-shrink-0">
        <RightPanel initialTasks={serverTasks} />
      </div>
    </div>
  );
}
