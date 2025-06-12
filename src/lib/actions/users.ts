"use server";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { withSentry } from "@/lib/utils/sentry";
import { eq, sql } from "drizzle-orm";
import { user } from "migrations/schema";

/**
 * Delete a user
 */
export const deleteUser = withSentry("delete-user", async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Delete user (cascades all user owned data)
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

export async function addCreditsToUser(userId: string, credits: number) {
  await db
    .update(user)
    .set({
      credits: sql`credits + ${credits}`,
    })
    .where(eq(user.id, userId));
}

export async function deductCreditsFromUser(userId: string, credits: number) {
  await db
    .update(user)
    .set({
      credits: sql`${user.credits} - ${credits.toFixed(4)}`,
    })
    .where(eq(user.id, userId));
}
