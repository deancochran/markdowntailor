import { db } from "@/db/drizzle";
import { aiRequestLog, InsertAiRequestLogSchema } from "@/db/schema";
import { Message } from "ai";
import { count, eq, sum } from "drizzle-orm";
import z from "zod";
import { withSentry } from "../utils/sentry";

export const MODEL = "gpt-4.1-nano";
const MODEL_LIMITS = {
  MAX_COST: 5.0,
  MAX_REQUESTS_PER_HOUR: 100,
  MAX_REQUESTS_PER_MINUTE: 10,
  // GPT-4.1-nano pricing (per million tokens)
  COST_PER_MILLION_INPUT_TOKENS: 0.1,
  COST_PER_MILLION_OUTPUT_TOKENS: 0.4,
} as const;

// Simple in-memory rate limiting
const rateLimits = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(
  userId: string,
  windowMs: number,
  maxRequests: number,
): boolean {
  const key = `${userId}-${windowMs}`;
  const now = Date.now();
  const existing = rateLimits.get(key);

  if (existing && now < existing.resetTime) {
    if (existing.count >= maxRequests) return false;
    existing.count++;
  } else {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
  }

  return true;
}

function calculateAccurateCost(
  promptTokens: number,
  completionTokens: number,
): number {
  const inputCost =
    (promptTokens / 1_000_000) * MODEL_LIMITS.COST_PER_MILLION_INPUT_TOKENS;
  const outputCost =
    (completionTokens / 1_000_000) *
    MODEL_LIMITS.COST_PER_MILLION_OUTPUT_TOKENS;
  return inputCost + outputCost;
}

function estimateCost(totalTokens: number): number {
  // Rough estimate: assume 30% input, 70% output tokens
  const estimatedInputTokens = Math.floor(totalTokens * 0.3);
  const estimatedOutputTokens = totalTokens - estimatedInputTokens;
  return calculateAccurateCost(estimatedInputTokens, estimatedOutputTokens);
}

export const checkAILimits = withSentry(
  "check-ai-limits",
  async (userId: string) => {
    try {
      // Rate limits still important for abuse prevention
      if (
        !checkRateLimit(userId, 60000, MODEL_LIMITS.MAX_REQUESTS_PER_MINUTE)
      ) {
        return {
          allowed: false,
          error: "Too many requests per minute. Please wait.",
        };
      }

      if (
        !checkRateLimit(userId, 3600000, MODEL_LIMITS.MAX_REQUESTS_PER_HOUR)
      ) {
        return { allowed: false, error: "Hourly request limit reached." };
      }

      const result = await db
        .select({
          totalCost: sum(aiRequestLog.costEstimate),
        })
        .from(aiRequestLog)
        .where(eq(aiRequestLog.userId, userId));

      const userBalance = parseFloat(result[0]?.totalCost || "0");

      if (userBalance > MODEL_LIMITS.MAX_COST) {
        return {
          allowed: false,
          error: `$${MODEL_LIMITS.MAX_COST} usage limit reached.`,
          usage: { userBalance },
        };
      }

      return { allowed: true, usage: { userBalance } };
    } catch (error) {
      console.error("Limit check failed:", error);
      return { allowed: false, error: "System error. Please try again." };
    }
  },
);

type LogAIRequestValues = Omit<
  z.infer<InsertAiRequestLogSchema>,
  "costEstimate"
>;

export const logAIRequest = withSentry(
  "log-ai-request",
  async (values: LogAIRequestValues) => {
    let costEstimate: number;

    if (
      values.promptTokens !== undefined &&
      values.completionTokens !== undefined
    ) {
      costEstimate = calculateAccurateCost(
        values.promptTokens,
        values.completionTokens,
      );
    } else {
      costEstimate = estimateCost(values.totalTokens);
    }
    try {
      await db.insert(aiRequestLog).values({
        ...values,
        costEstimate: costEstimate.toString(),
      });
    } catch (error) {
      console.error("Failed to log AI request:", error);
    }
  },
);

// Basic input cleaning
export function cleanInput(input: string): string {
  return input
    .slice(0, 8000) // Reasonable limit
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

export function cleanMessages(messages: Message[]): Message[] {
  return messages.map((msg) => ({
    ...msg,
    content:
      typeof msg.content === "string" ? cleanInput(msg.content) : msg.content,
  }));
}

export const getUserUsage = withSentry(
  "get-user-usage",
  async (userId: string) => {
    try {
      const result = await db
        .select({
          totalCost: sum(aiRequestLog.costEstimate),
          totalRequests: count(aiRequestLog.id),
          totalTokens: sum(aiRequestLog.totalTokens),
        })
        .from(aiRequestLog)
        .where(eq(aiRequestLog.userId, userId));

      const stats = result[0];
      const totalCost = Number(stats?.totalCost || 0);

      return {
        totalCost,
        totalRequests: stats?.totalRequests || 0,
        totalTokens: Number(stats?.totalTokens || 0),
        remainingBudget: MODEL_LIMITS.MAX_COST - totalCost,
        usagePercentage: (totalCost / MODEL_LIMITS.MAX_COST) * 100,
      };
    } catch (error) {
      console.error("Failed to get usage:", error);
      return null;
    }
  },
);
