import { db } from "@/db/drizzle";
import { aiRequestLog } from "@/db/schema";
import { calculateRequestCost, getPreferredModelObject } from "@/lib/ai";
import {
  getStripeCreditsBalance,
  hasStripeCreditsForAmount,
} from "@/lib/stripe/billing";
import { withSentry } from "@/lib/utils/sentry";
import { User } from "next-auth";

export const logAIRequestWithStripeCredits = withSentry(
  "log-ai-request-stripe",
  async (
    values: Omit<
      typeof aiRequestLog.$inferInsert,
      "userId" | "model" | "modelProvider" | "credits"
    >,
    authUser: User,
  ) => {
    // Ensure user has Stripe customer ID
    if (!authUser.stripeCustomerId) {
      throw new Error("User does not have a Stripe customer ID configured");
    }

    const model_selection = getPreferredModelObject(authUser);
    const cost = calculateRequestCost(
      model_selection,
      values.promptTokens,
      values.completionTokens,
    );

    // Check if user has sufficient credits in Stripe
    const hasSufficientCredits = await hasStripeCreditsForAmount(
      authUser,
      cost,
    );

    if (!hasSufficientCredits) {
      const currentBalance = await getStripeCreditsBalance(authUser);
      throw new Error(
        `Insufficient Stripe credits. Required: $${cost}, Available: $${currentBalance}`,
      );
    }

    // Log the request
    await db.insert(aiRequestLog).values({
      ...values,
      userId: authUser.id,
      model: model_selection.model_name,
      modelProvider: model_selection.provider_name,
    });
  },
);

/**
 * Migration helper: Get user's current credit balance from Stripe
 * This can be used to display the balance in the UI
 */
export const getCurrentStripeBalance = withSentry(
  "get-current-stripe-balance",
  async (authUser: User & { stripeCustomerId: string }): Promise<string> => {
    if (!authUser.stripeCustomerId) {
      throw new Error("User does not have a Stripe customer ID configured");
    }

    return await getStripeCreditsBalance(authUser);
  },
);

/**
 * Helper to check if user has sufficient credits before making a request
 */
export const checkStripeCreditsForRequest = withSentry(
  "check-stripe-credits-for-request",
  async (
    authUser: User & { stripeCustomerId: string },
    promptTokens: number,
    completionTokens: number,
  ): Promise<{ hasEnough: boolean; required: string; available: string }> => {
    if (!authUser.stripeCustomerId) {
      throw new Error("User does not have a Stripe customer ID configured");
    }

    const model_selection = getPreferredModelObject(authUser);
    const cost = calculateRequestCost(
      model_selection,
      promptTokens,
      completionTokens,
    );
    const available = await getStripeCreditsBalance(authUser);
    const hasEnough = await hasStripeCreditsForAmount(authUser, cost);

    return {
      hasEnough,
      required: cost,
      available,
    };
  },
);
