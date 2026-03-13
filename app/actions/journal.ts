"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateObject } from "ai";
import { z } from "zod";
import { hasGoogleApiKeyPool, withGoogleApiKeyRotation } from "@/lib/ai/googleKeyRotation";

export async function saveJournalEntry(content: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    let sentiment = null;
    let themes: string[] = [];

    try {
      if (hasGoogleApiKeyPool()) {
        const { object } = await withGoogleApiKeyRotation(async (googleForKey) => {
          return await generateObject({
          model: googleForKey('gemini-2.5-flash'),
          maxRetries: 0,
          schema: z.object({
            sentiment: z.enum(['Positive', 'Productive', 'Calm', 'Neutral', 'Anxious', 'Sad', 'Lethargic', 'Stressed', 'Overwhelmed', 'Angry', 'Frustrated']).describe('The core overarching emotion of the journal entry.'),
            themes: z.array(z.string()).max(3).describe('Up to 3 key themes discussed in the entry, like "Work", "Family", "Health", "Sleep", "Finance", "Social", "Creative", "Spiritual", etc. Keep them 1-2 words.'),
          }),
          prompt: `Analyze the following journal entry and extract its core sentiment and up to 3 key themes.
          
          Journal Entry:
          "${content}"`
        });
        });
        
        sentiment = object.sentiment;
        themes = object.themes;
      }
    } catch (aiError) {
      console.error("Failed to generate AI metadata for journal:", aiError);
      // We continue to save the journal even if AI fails
    }

    const newEntry = await db.journalEntry.create({
      data: {
        content,
        sentiment,
        themes,
        userId: userId,
      } as any,
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

export async function updateJournalEntry(id: string, content: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    let sentiment = null;
    let themes: string[] = [];

    // Re-run AI analysis on the updated content
    try {
      if (hasGoogleApiKeyPool()) {
        const { object } = await withGoogleApiKeyRotation(async (googleForKey) => {
          return await generateObject({
          model: googleForKey('gemini-2.5-flash'),
          maxRetries: 0,
          schema: z.object({
            sentiment: z.enum(['Positive', 'Productive', 'Calm', 'Neutral', 'Anxious', 'Sad', 'Lethargic', 'Stressed', 'Overwhelmed', 'Angry', 'Frustrated']).describe('The core overarching emotion of the journal entry.'),
            themes: z.array(z.string()).max(3).describe('Up to 3 key themes discussed in the entry, like "Work", "Family", "Health", "Sleep", "Finance", "Social", "Creative", "Spiritual", etc. Keep them 1-2 words.'),
          }),
          prompt: `Analyze the following journal entry and extract its core sentiment and up to 3 key themes.\n\nJournal Entry:\n"${content}"`
        });
        });
        
        sentiment = object.sentiment;
        themes = object.themes;
      }
    } catch (aiError) {
      console.error("Failed to generate AI metadata for updated journal:", aiError);
      // We continue to update the journal even if AI fails
    }

    const updatedEntry = await db.journalEntry.update({
      where: {
        id,
        userId, // Ensure they own it before updating
      },
      data: {
        content,
        sentiment,
        themes,
      } as any,
    });

    revalidatePath("/dashboard");
    return { success: true, entry: updatedEntry };
  } catch (error) {
    console.error("Failed to update journal:", error);
    return { success: false, error: "Failed to update entry" };
  }
}

/**
 * Batch backfill: Analyze all journal entries that are missing sentiment/themes.
 */
export async function backfillJournalSentiments() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    if (!hasGoogleApiKeyPool()) {
      return { success: false, error: "No AI API key configured" };
    }

    const entriesToBackfill = await db.journalEntry.findMany({
      where: { userId, sentiment: null } as any,
      orderBy: { createdAt: "desc" },
    });

    let updated = 0;

    for (const entry of entriesToBackfill) {
      try {
        const { object } = await withGoogleApiKeyRotation(async (googleForKey) => {
          return await generateObject({
          model: googleForKey('gemini-2.5-flash'),
          maxRetries: 0,
          schema: z.object({
            sentiment: z.enum(['Positive', 'Productive', 'Calm', 'Neutral', 'Anxious', 'Sad', 'Lethargic', 'Stressed', 'Overwhelmed', 'Angry', 'Frustrated']).describe('The core overarching emotion of the journal entry.'),
            themes: z.array(z.string()).max(3).describe('Up to 3 key themes discussed in the entry, like "Work", "Family", "Health", "Sleep", "Finance", "Social", "Creative", "Spiritual", etc. Keep them 1-2 words.'),
          }),
          prompt: `Analyze the following journal entry and extract its core sentiment and up to 3 key themes.\n\nJournal Entry:\n"${entry.content}"`
        });
        });

        await db.journalEntry.update({
          where: { id: entry.id },
          data: { sentiment: object.sentiment, themes: object.themes } as any,
        });
        updated++;
      } catch (aiError) {
        console.error(`Failed to backfill entry ${entry.id}:`, aiError);
        // Continue with the next entry
      }
    }

    revalidatePath("/dashboard");
    return { success: true, updated, total: entriesToBackfill.length };
  } catch (error) {
    console.error("Failed to backfill sentiments:", error);
    return { success: false, error: "Backfill failed" };
  }
}
