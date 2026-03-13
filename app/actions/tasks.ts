"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Get the start of today in IST (midnight)
function getTodayStartIST(): Date {
  const now = new Date();
  // Convert to IST string to get the correct IST date
  const istDateStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // "YYYY-MM-DD"
  // Create a Date at midnight IST (IST = UTC+5:30)
  return new Date(`${istDateStr}T00:00:00+05:30`);
}

export async function getTasks() {
  try {
    const { userId } = await auth();

    if (!userId) return [];

    const todayStart = getTodayStartIST();

    // Delete old tasks (before today) in the background
    await db.task.deleteMany({
      where: {
        userId,
        createdAt: { lt: todayStart }
      }
    });

    // Return only today's tasks
    const tasks = await db.task.findMany({
      where: {
        userId,
        createdAt: { gte: todayStart }
      },
      orderBy: { createdAt: "asc" }
    });
    return tasks;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createTask(title: string) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    await db.task.create({
      data: {
        title,
        userId
      }
    });
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create task" };
  }
}

export async function toggleTaskComplete(id: string, currentState: boolean) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    // Check if the task exists in the database first
    const existingTask = await db.task.findUnique({
      where: { id }
    });

    if (!existingTask || existingTask.userId !== userId) {
      // Task doesn't exist in DB (likely a local/mock task) — skip silently
      return { success: false, error: "Task not found in database" };
    }

    await db.task.update({
      where: { id, userId },
      data: { completed: !currentState }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteTask(id: string) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    // Check if the task exists in the database first
    const existingTask = await db.task.findUnique({
      where: { id }
    });

    if (!existingTask || existingTask.userId !== userId) {
      return { success: false, error: "Task not found in database" };
    }

    await db.task.delete({
      where: { id, userId }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete task" };
  }
}
