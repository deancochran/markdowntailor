"use server";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";

import { withSentry } from "@/lib/utils/sentry";
import { eq } from "drizzle-orm";

/**
 * Delete a user and their Stripe customer
 */
export const deleteUser = withSentry("delete-user", async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.delete(user).where(eq(user.id, session.user.id));
});

export async function updateUserWithStripeCustomerId(
  userId: string,
  stripeCustomerId: string,
) {
  const [dbUser] = await db
    .update(user)
    .set({
      stripeCustomerId,
    })
    .where(eq(user.id, userId))
    .returning();

  if (!dbUser) {
    throw new Error("User not found");
  }
  return dbUser;
}
