"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getTasks() {
  try {
    const { userId } = await auth();

    if (!userId) return [];

    const tasks = await db.task.findMany({
      where: { userId },
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

    await db.task.delete({
      where: { id, userId }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete task" };
  }
}
