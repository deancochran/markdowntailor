"use server";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { withSentry } from "@/lib/utils/sentry";
import { eq } from "drizzle-orm";
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
