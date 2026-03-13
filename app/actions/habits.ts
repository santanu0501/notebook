"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getHabits() {
  try {
    const { userId } = await auth();

    if (!userId) return [];

    const habitsDB = await db.habit.findMany({
      where: { userId },
      include: {
        history: true
      }
    });

    // Map `title` from DB to `name` for the frontend store expectations
    return habitsDB.map(h => ({
      ...h,
      name: h.title
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function toggleHabit(habitId: string, date: string, wasCompleted: boolean) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");
    
    // Ensure the user actually owns the habit first
    const habit = await db.habit.findUnique({
      where: { id: habitId, userId }
    });
    
    if (!habit) throw new Error("Habit not found");

    if (wasCompleted) {
      // Meaning we are un-completing it
      await db.habitHistory.delete({
        where: {
          habitId_date: {
            habitId,
            date
          }
        }
      });
    } else {
      // Count total habits user currently has
      const totalHabits = await db.habit.count({
        where: { userId }
      });

      // Meaning we are completing it
      await db.habitHistory.create({
        data: {
          habitId,
          date,
          completed: true,
          totalHabits
        }
      });
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function createHabit(title: string) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    await db.habit.create({
      data: {
        title,
        userId
      }
    });
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create habit" };
  }
}

export async function deleteHabit(id: string) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    // Thanks to Prisma's Cascade delete on habitHistory, this will clean up safely
    await db.habit.delete({
      where: { id, userId }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete habit" };
  }
}
