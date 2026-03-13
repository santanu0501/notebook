import { createGoogleGenerativeAI } from "@ai-sdk/google";

function getGoogleApiKeys() {
  const keysFromPool = (process.env.GOOGLE_GENERATIVE_AI_API_KEYS || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);

  if (keysFromPool.length > 0) return keysFromPool;

  const singleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  return singleKey ? [singleKey] : [];
}

export function hasGoogleApiKeyPool() {
  return getGoogleApiKeys().length > 0;
}

export function isRateLimitOrQuotaError(error: any) {
  const message = error?.message || "";

  return (
    error?.statusCode === 429 ||
    /quota|rate limit|too many requests|resource_exhausted|429/i.test(message)
  );
}

export async function withGoogleApiKeyRotation<T>(
  callback: (
    googleForKey: ReturnType<typeof createGoogleGenerativeAI>,
    meta: { keyIndex: number; totalKeys: number }
  ) => Promise<T>
): Promise<T> {
  const keys = getGoogleApiKeys();

  if (keys.length === 0) {
    throw new Error("No Gemini API keys configured");
  }

  let lastError: unknown;

  for (let index = 0; index < keys.length; index++) {
    const apiKey = keys[index];
    const googleForKey = createGoogleGenerativeAI({ apiKey });

    try {
      return await callback(googleForKey, { keyIndex: index, totalKeys: keys.length });
    } catch (error: any) {
      lastError = error;

      if (!isRateLimitOrQuotaError(error)) {
        throw error;
      }

      if (index < keys.length - 1) {
        console.warn(`Gemini key ${index + 1}/${keys.length} is rate-limited. Switching key.`);
      }
    }
  }

  throw lastError ?? new Error("All Gemini API keys failed");
}
