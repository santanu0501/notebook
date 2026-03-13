"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateObject } from "ai";
import { z } from "zod";
import { isRateLimitOrQuotaError, withGoogleApiKeyRotation } from "@/lib/ai/googleKeyRotation";

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

export async function verifyHabitImage(habitName: string, imagePayload: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    let mimeType = "image/jpeg";
    let base64Data = imagePayload;

    if (imagePayload.startsWith("data:")) {
      const dataUrlMatch = imagePayload.match(/^data:(.*?);base64,(.*)$/);
      if (!dataUrlMatch || !dataUrlMatch[2]) {
        throw new Error("Invalid image data format.");
      }
      mimeType = dataUrlMatch[1] || mimeType;
      base64Data = dataUrlMatch[2];
    }

    const imageInput = Buffer.from(base64Data, "base64");

    const result = await withGoogleApiKeyRotation(async (googleForKey) => {
      return await generateObject({
        model: googleForKey("gemini-2.5-flash", {
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
          ]
        }),
        maxRetries: 0,
        schema: z.object({
          success: z.boolean().describe("Whether the image verifies the completion of the habit"),
          comment: z.string().describe("A sarcastic or witty comment if the verification fails, or an empty string if it succeeds")
        }),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `The user wants to complete the habit "${habitName}". They have uploaded an image as proof. Is this image valid proof for this habit? Be very lenient. For instance, if the habit is "workout" or "exercise", a sweaty selfie, gym mirror pic, or literally any post-workout body pic is 100% valid proof. Don't be pedantic. If it's unrelated (like a blank wall or a cup of coffee for a workout), fail them. If they fail, provide a ruthless, sarcastic comment.`
              },
              {
                type: "image",
                image: imageInput,
                mimeType,
              }
            ]
          }
        ]
      });
    });

    return result.object;
  } catch (error: any) {
    console.error("verifyHabitImage error:", error);

    const lowerHabitName = habitName.toLowerCase();
    const isWorkoutHabit = /(workout|exercise|gym|training|fitness|run|cardio|lift)/.test(lowerHabitName);
    const isQuotaOrRateLimit = isRateLimitOrQuotaError(error);

    if (isWorkoutHabit && isQuotaOrRateLimit) {
      return {
        success: true,
        comment: "",
      };
    }

    return {
      success: false,
      comment: "Could not verify this photo right now. Please try again in a moment.",
    };
  }
}
