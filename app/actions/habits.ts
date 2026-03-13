"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getHabits() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return [];

    return await db.habit.findMany({
      where: { userId },
      include: {
        history: true
      }
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function toggleHabit(habitId: string, date: string, wasCompleted: boolean) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

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
      // Meaning we are completing it
      await db.habitHistory.create({
        data: {
          habitId,
          date,
          completed: true
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
