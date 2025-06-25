"use server";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";

import { withSentry } from "@/lib/utils/sentry";
import Decimal from "decimal.js";
import { eq, sql } from "drizzle-orm";
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
  if (dbUser.alpha_credits_redeemed == false) {
    await db
      .update(user)
      .set({
        alpha_credits_redeemed: true,
        credits: sql`${user.credits} + ${sql.raw(new Decimal("25").toString())}`,
      })
      .where(eq(user.id, dbUser.id))
      .returning();
    console.log(`ALPHA CREDITS REDEEMED`);
  }
}
