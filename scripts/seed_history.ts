/**
 * Seed script: Creates habit history entries for the last 15 days
 * for ALL habits regardless of creation date (for demo/display purposes).
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

async function main() {
  console.log("Seeding habit history for last 15 days...\n");

  const users = await prisma.user.findMany({
    include: {
      habits: {
        include: { history: true }
      }
    }
  });

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    if (user.habits.length === 0) continue;
    const totalHabits = user.habits.length;

    console.log(`User: ${user.name || user.id} (${totalHabits} habits)`);

    for (let dayOffset = 1; dayOffset <= 15; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      const dateStr = formatDate(date);

      for (const habit of user.habits) {
        // Check if entry already exists for this habit + date
        const existing = habit.history.find((h) => h.date === dateStr);
        if (existing) {
          skipped++;
          continue;
        }

        // Random completion: ~70% chance
        const completed = Math.random() < 0.7;

        await prisma.habitHistory.create({
          data: {
            habitId: habit.id,
            date: dateStr,
            completed,
            totalHabits
          }
        });
        created++;
      }
    }
  }

  console.log(`\nDone! Created ${created} new entries, skipped ${skipped} existing.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
