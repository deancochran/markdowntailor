import { db } from "@/db/drizzle";
import { accounts, resume, user } from "@/db/schema";

import { eq } from "drizzle-orm";
import { User } from "next-auth";
import { v4 as uuidv4 } from "uuid";

/**
 * A schema-driven factory for creating test data.
 * By using the Zod schemas from `drizzle-zod`, we ensure that our test data
 * always conforms to the shape expected by our database, reducing test brittleness.
 */
export class DataFactory {
  /**
   * Creates a valid user object payload for database insertion.
   * @param overrides - An object with properties to override the defaults.
   * @returns A complete user object that satisfies the `insertUserSchema`.
   */
  static createUserData(
    overrides: Partial<typeof user.$inferInsert> = {},
  ): typeof user.$inferInsert {
    const id = uuidv4();
    const defaultUser: typeof user.$inferInsert = {
      // A unique email is crucial to prevent test collisions.
      email: `test-${id}@example.com`,
      name: "Test User",
      // Other fields can rely on database defaults, but setting them here can make tests more explicit.
      emailVerified: new Date(),
      image: "https://example.com/avatar.png",
    };

    return {
      ...defaultUser,
      ...overrides,
    };
  }

  /**
   * Creates a valid resume object payload for database insertion.
   * Note: This factory requires a `userId` as resumes cannot exist without an owner.
   * @param userId - The ID of the user who owns this resume.
   * @param overrides - An object with properties to override the defaults.
   * @returns A complete resume object that satisfies the `insertResumeSchema`.
   */
  static createResumeData(
    user: User,
    overrides: Partial<typeof resume.$inferInsert> = {},
  ): typeof resume.$inferInsert {
    return {
      userId: user.id,
      title: `Default Test Resume ${uuidv4()}`,
      markdown: "",
      css: "",
      ...overrides,
    };
  }
}

// --- Database Helpers ---

/**
 * Creates a test user directly in the database using schema-driven data.
 * This is the fastest and most reliable way to provision a user for tests.
 * @param overrides - Optional partial user data to override the factory defaults.
 * @returns The created user object, compatible with NextAuth's `User` type.
 */
export async function createTestUser(
  overrides: Partial<typeof user.$inferInsert> = {},
): Promise<User> {
  const userData = DataFactory.createUserData(overrides);
  const [createdUser] = await db.insert(user).values(userData).returning();

  return createdUser;
}

/**
 * Cleans up a user and their linked account from the database after a test.
 * @param userId - The ID of the user to clean up.
 */
export async function cleanupTestUser(userId: string): Promise<void> {
  if (!userId) return;
  try {
    await db.delete(accounts).where(eq(accounts.userId, userId));
    await db.delete(user).where(eq(user.id, userId));
  } catch (error) {
    console.warn(`Could not clean up test user ${userId}:`, error);
  }
}
/**
 * Creates a test resume directly in the database using schema-driven data.
 * This is the fastest and most reliable way to provision a resume for tests.
 * @param overrides - Optional partial resume data to override the factory defaults.
 * @returns The created resume object, compatible with NextAuth's `User` type.
 */
export async function createTestResume(
  user: User,
  overrides: Partial<typeof resume.$inferInsert> = {},
): Promise<typeof resume.$inferSelect> {
  const resumeData = DataFactory.createResumeData(user, overrides);
  const [createdResume] = await db
    .insert(resume)
    .values(resumeData)
    .returning();

  return createdResume;
}
