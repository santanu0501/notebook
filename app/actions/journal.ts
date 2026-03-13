"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function saveJournalEntry(content: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const newEntry = await db.journalEntry.create({
      data: {
        content,
        userId: userId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, entry: newEntry };
  } catch (error) {
    console.error("Failed to save journal:", error);
    return { success: false, error: "Failed to save entry" };
  }
}

export async function getJournalEntries() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return [];
    }

    const entries = await db.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return entries;
  } catch (error) {
    console.error("Failed to fetch journals:", error);
    return [];
  }
}

export async function deleteJournalEntry(id: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    await db.journalEntry.delete({
      where: {
        id,
        userId, // Ensure the user can only delete their own entries
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete journal:", error);
    return { success: false, error: "Failed to delete entry" };
  }
}
