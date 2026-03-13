"use server";

import { db as _db } from "../../lib/db";

// Bypass IDE caching issues where Prisma types are not updated in the editor
const db = _db as any;
import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { Resend } from "resend";
import {
  hasGoogleApiKeyPool,
  isRateLimitOrQuotaError,
  withGoogleApiKeyRotation,
} from "@/lib/ai/googleKeyRotation";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy");

async function generateCoachText(system: string, prompt: string): Promise<string | null> {
  if (!hasGoogleApiKeyPool()) return null;

  try {
    const { text } = await withGoogleApiKeyRotation(async (googleForKey) => {
      return await generateText({
        model: googleForKey("gemini-2.5-flash"),
        system,
        prompt,
        maxRetries: 0,
      });
    });

    const trimmed = text?.trim();
    return trimmed || null;
  } catch (error: any) {
    if (isRateLimitOrQuotaError(error)) {
      console.warn("Gemini quota exceeded; using fallback coach message.");
      return null;
    }

    console.error("Coach text generation failed:", error);
    return null;
  }
}

export async function runAuditor() {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    // 1. Find active habits
    const habits = await db.habit.findMany({
      where: { userId },
      include: {
        history: {
          orderBy: { date: 'desc' },
          take: 3, // look at recent history
        },
        accountabilityMessages: {
          where: { isRead: false },
        }
      }
    });

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Find all habits where the streak is broken (missed yesterday)
    const missedHabits: string[] = [];

    for (const habit of habits) {
      // @ts-ignore - The IDE TS Server cache might lose type inference here due to missing relation in old cache
      const historyYesterday = habit.history.find((h: any) => h.date === yesterdayStr);
      const completedYesterday = historyYesterday?.completed ?? false;

      // 🚨 DEV SIMULATION: ALWAYS TRUE right now so we can test the AI + Email.
      // Set to !completedYesterday when done testing
      if (!completedYesterday) {
        missedHabits.push(habit.title);
      }
    }

    // Only block if there's still an UNREAD message from the last 24 hours.
    // If the user already dismissed the previous toast, allow a new one on next reload.
    const recentMessage = await db.accountabilityMessage.findFirst({
      where: { 
        userId, 
        isRead: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    if (recentMessage) return;

    if (missedHabits.length > 0) {
      // Execute ENFORCER with ALL missed habits
      await runEnforcer(userId, missedHabits);
    } else if (habits.length > 0) {
      // ALL CLEAR — every habit streak is intact, send a positive message
      const habitNames = habits.map((h: any) => h.title);
      await runAllClear(userId, habitNames);
    }
  } catch (err) {
    console.error("Auditor error:", err);
  }
}

async function runEnforcer(userId: string, missedHabits: string[]) {
  // 1. Gather recent journal entries to learn about their goals
  const journals = await db.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const journalContext = journals.map((j: any) => `- [${j.createdAt.toISOString().split('T')[0]}]: ${j.content}`).join('\n');
  const missedList = missedHabits.join(", ");

  // 2. Generate the unhinged message
  let messageContent = `You've been slacking on your habits: ${missedList}. Get it together.`;

  const aiMessage = await generateCoachText(
    "You are the 'Ruthless Accountability Coach'. Your job is to motivate the user by being brutally honest, slightly unhinged, and strictly accountable. Do not be overly polite or generic. Use their own recent journal entries against them if relevant to point out their hypocrisy or abandoned goals. Keep it under 3 sentences. Be punchy, dark-humored, and intensely motivating in a rough way. DO NOT use emojis.",
    `The user has missed the following habits recently: ${missedList}. 
    
    Here are their recent journal entries to understand their state of mind and goals:
    ${journalContext || "(No journal entries found)"}
    
    Draft a highly personalized, slightly unhinged notification to shame or motivate them into doing their habits.`
  );
  if (aiMessage) messageContent = aiMessage;

  // 3. Save the message to DB (no specific habitId, applies to user generally)
  await db.accountabilityMessage.create({
    data: {
      userId,
      message: messageContent,
    }
  });

  // 4. Send an email if we have the user's email address and Resend is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        await resend.emails.send({
          from: 'The Coach <onboarding@resend.dev>', // Update with your verified domain in production
          to: user.email,
          subject: `You missed your routines. Are you giving up?`,
          html: `<div style="font-family: sans-serif; background-color: #fff0f0; border-left: 5px solid #d32f2f; padding: 20px; color: #333;">
            <p><strong>Look at what you did.</strong></p>
            <p>${messageContent}</p>
            <p style="font-size: 0.8rem; color: #666; margin-top: 30px;">- Sent involuntarily by your accountability system.</p>
          </div>`
        });
      }
    } catch (emailError) {
      console.error("Failed to send accountability email:", emailError);
    }
  }
}

async function runAllClear(userId: string, habitNames: string[]) {
  const journals = await db.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const journalContext = journals.map((j: any) => `- [${j.createdAt.toISOString().split('T')[0]}]: ${j.content}`).join('\n');
  const habitList = habitNames.join(", ");

  let messageContent = `All streaks intact. You're on track with: ${habitList}. Keep going.`;

  const aiMessage = await generateCoachText(
    "You are the 'Ruthless Accountability Coach'. The user has kept ALL their streaks intact — every habit was completed. Your job now is to acknowledge this with a short, punchy, slightly unhinged congratulations. Stay in character — you're impressed but still intense. Keep it under 2 sentences. No emojis. Be raw, real, and motivating.",
    `The user has completed ALL their habits: ${habitList}. Every streak is intact.
    
    Here are their recent journal entries for context:
    ${journalContext || "(No journal entries found)"}
    
    Give them a short, intense acknowledgment. You're impressed. But don't go soft.`
  );
  if (aiMessage) messageContent = aiMessage;

  // Save with [ALL_CLEAR] prefix so the UI knows to render it differently
  await db.accountabilityMessage.create({
    data: {
      userId,
      message: `[ALL_CLEAR]${messageContent}`,
    }
  });

  // Send a positive email
  if (process.env.RESEND_API_KEY) {
    try {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        await resend.emails.send({
          from: 'The Coach <onboarding@resend.dev>',
          to: user.email,
          subject: `All streaks intact. You earned this.`,
          html: `<div style="font-family: sans-serif; background-color: #f0fff4; border-left: 5px solid #16a34a; padding: 20px; color: #333;">
            <p><strong>Every streak is intact.</strong></p>
            <p>${messageContent}</p>
            <p style="font-size: 0.8rem; color: #666; margin-top: 30px;">- Sent begrudgingly by your accountability system.</p>
          </div>`
        });
      }
    } catch (emailError) {
      console.error("Failed to send all-clear email:", emailError);
    }
  }
}

// -------------------------------------------------------- //
// Methods for UI                                           //
// -------------------------------------------------------- //

export async function getUnreadAccountabilityMessages() {
  const { userId } = await auth();
  if (!userId) return [];

  return await db.accountabilityMessage.findMany({
    where: { userId, isRead: false },
    orderBy: { createdAt: 'asc' }
  });
}

export async function markAccountabilityMessageAsRead(messageId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const message = await db.accountabilityMessage.findUnique({
    where: { id: messageId }
  });

  if (!message || message.userId !== userId) {
    return null;
  }

  return await db.accountabilityMessage.update({
    where: { id: messageId },
    data: { isRead: true }
  });
}
