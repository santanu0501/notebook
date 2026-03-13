/**
 * Backfill: Update ALL HabitHistory records with the correct totalHabits.
 * For each entry, count how many habits the user had at that time.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Backfilling totalHabits on ALL HabitHistory records...\n");

  const users = await prisma.user.findMany({
    include: {
      habits: {
        include: { history: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  let updated = 0;

  for (const user of users) {
    if (user.habits.length === 0) continue;

    const totalHabits = user.habits.length;
    console.log(`User: ${user.name || user.id} — ${totalHabits} habits`);

    // Collect all history entry IDs across all habits for this user
    const allEntryIds: string[] = [];
    for (const habit of user.habits) {
      for (const entry of habit.history) {
        allEntryIds.push(entry.id);
      }
    }

    // Bulk update all entries with the user's current total habit count
    const result = await prisma.habitHistory.updateMany({
      where: { id: { in: allEntryIds } },
      data: { totalHabits }
    });

    updated += result.count;
    console.log(`  Updated ${result.count} entries with totalHabits = ${totalHabits}`);
  }

  console.log(`\nDone! Updated ${updated} total records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
