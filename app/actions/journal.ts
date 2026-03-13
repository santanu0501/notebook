"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveJournalEntry(content: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

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
    const session = await auth();
    const userId = session?.user?.id;

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
