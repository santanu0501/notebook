import { PrismaClient } from "@prisma/client";
import { format, subDays } from "date-fns";

const prisma = new PrismaClient();

// The Clerk User ID of the currently logged in user
const USER_ID = "user_3Arzez7nK8jRgT8p4LKjEKbF32v";

// AI Generated Data Context
const HABIT_TITLES = [
  { title: "Morning Run", color: "blue", category: "Health", icon: "Activity" },
  { title: "Read 10 Pages", color: "amber", category: "Mind", icon: "Book" },
  { title: "Meditation", color: "purple", category: "Mind", icon: "Target" }
];

const JOURNAL_ENTRIES = [
  "Feeling incredibly productive today. Managed to knock out all my morning tasks before 9 AM.",
  "Kind of a slow day. The morning run was tough, but I pushed through.",
  "Had a great brainstorming session. Sometimes stepping away from the screen is the best thing you can do.",
  "Focused primarily on deep work today. No distractions, just pure focus. It felt great.",
  "Rest day. Took some time to read and reset for the upcoming week.",
  "Struggled with motivation this afternoon, but managed to hit my reading goal.",
  "Incredible energy all day! The meditation habit is really starting to pay off.",
  "A bit overwhelmed with the project deadline, but writing it down helped clear my mind.",
  "Solid day. Completed all habits. Feeling consistent and disciplined.",
  "Took a long walk to clear my head. The weather was perfect.",
  "Learned something new about Prisma today. Very exciting progress on the app.",
  "Felt a bit under the weather, but still did the bare minimum to keep the streak alive.",
  "Fantastic deep work session. Reached a flow state for about 2 hours.",
  "Reflecting on the past two weeks... I've built some really solid routines."
];

async function main() {
  console.log(`Starting Database Seeding for user: ${USER_ID}...\n`);

  // 1. Clean up existing habits and journals for this user
  console.log("Cleaning up old demo data...");
  await prisma.habitHistory.deleteMany({
    where: { habit: { userId: USER_ID } }
  });
  await prisma.habit.deleteMany({ where: { userId: USER_ID } });
  await prisma.journalEntry.deleteMany({ where: { userId: USER_ID } });

  // 2. Create the Habits
  console.log("Creating new habits...");
  const createdHabits = [];
  for (const h of HABIT_TITLES) {
    const habit = await prisma.habit.create({
      data: {
        title: h.title,
        color: h.color,
        category: h.category,
        icon: h.icon,
        userId: USER_ID,
      }
    });
    createdHabits.push(habit);
  }

  // 3. Populate 14 Days of Habit History (randomized completions)
  console.log("Generating 14 days of habit streaks...");
  for (let i = 14; i >= 0; i--) {
    const dateStr = format(subDays(new Date(), i), "yyyy-MM-dd");
    
    for (const habit of createdHabits) {
      // 80% chance to complete a habit to make the map look nice but realistic
      const completed = Math.random() > 0.2;
      
      if (completed) {
        await prisma.habitHistory.create({
          data: {
            habitId: habit.id,
            date: dateStr,
            completed: true
          }
        });
      }
    }

    // 4. Create a Journal Entry for each day
    // Pick the journal entry that corresponds to the index (so 14 days = 14 entries)
    const journalContent = JOURNAL_ENTRIES[14 - i] || "Just another productive day.";
    
    await prisma.journalEntry.create({
      data: {
        content: journalContent,
        createdAt: subDays(new Date(), i),
        userId: USER_ID
      }
    });
  }

  console.log("\n✅ Database has been successfully seeded with 14 days of historical data!");
  console.log("Go check your browser to see the streaks and productivity map light up.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
