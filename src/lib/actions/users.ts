"use server";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import {
  addStripeCredits,
  getStripeCreditsBalance,
  getStripeCreditTransactions,
} from "@/lib/stripe/billing";
import { withSentry } from "@/lib/utils/sentry";
import { eq } from "drizzle-orm";
import { stripe } from "../stripe";

/**
 * Delete a user and their Stripe customer
 */
export const deleteUser = withSentry("delete-user", async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (session.user.stripeCustomerId) {
    await stripe.customers.del(session.user.stripeCustomerId);
  }
  await db.delete(user).where(eq(user.id, session.user.id));
});

export async function updateUserWithStripeCustomerId(
  userId: string,
  stripeCustomerId: string,
) {
  await db
    .update(user)
    .set({
      stripeCustomerId,
    })
    .where(eq(user.id, userId));
}

/**
 * Add credits to user via Stripe credit grant
 */
export async function addCreditsToUserViaStripe(
  userId: string,
  credits: string,
  category: "paid" | "promotional" = "paid",
  expiresAt?: Date,
) {
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!dbUser?.stripeCustomerId) {
    throw new Error("User does not have a Stripe customer ID");
  }

  await addStripeCredits(dbUser, credits, category, expiresAt);
}

/**
 * Get user's current credit balance from Stripe
 */
export async function getUserStripeCreditsBalance(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id || !session.user.stripeCustomerId) {
    throw new Error("Unauthorized or missing Stripe customer ID");
  }

  return await getStripeCreditsBalance(session.user);
}

/**
 * Get user's credit transaction history from Stripe
 */
export async function getUserStripeCreditTransactions(limit: number = 10) {
  const session = await auth();

  if (!session?.user?.id || !session.user.stripeCustomerId) {
    throw new Error("Unauthorized or missing Stripe customer ID");
  }

  return await getStripeCreditTransactions(session.user, limit);
}
