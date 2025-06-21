import { db } from "@/db/drizzle";
import { accounts, user } from "@/db/schema";
import { Page, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { User } from "next-auth";
import { v4 } from "uuid";
import { DataFactory } from "./data-factory";

export class AuthHelper {
  private page: Page;
  private currentUser?: User;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Creates a test user with proper accounts linking for credentials auth
   */
  async createAndAuthenticateUser(): Promise<User> {
    const id = v4();
    const testUserData = DataFactory.createUserData({
      id: id,
      name: `test-${id}`,
      email: `test-${id}@example.com`,
      emailVerified: new Date(),
      image: "https://avatars.githubusercontent.com/u/67470890?s=200&v=4",
    });

    const [createdUser] = await db
      .insert(user)
      .values(testUserData)
      .returning();

    // Create the corresponding accounts entry (this is crucial for credentials auth)
    await db.insert(accounts).values({
      userId: createdUser.id,
      type: "email",
      provider: "credentials",
      providerAccountId: createdUser.id,
    });

    // Now authenticate using the proper NextAuth flow
    await this.authenticateWithCredentials(createdUser.email as string);

    this.currentUser = createdUser;
    return this.currentUser;
  }

  /**
   * Authenticates using NextAuth's credentials flow
   */
  private async authenticateWithCredentials(email: string) {
    try {
      // Navigate to the signin page
      await this.page.goto("/api/auth/signin");
      await this.page.waitForLoadState("networkidle");

      // Fill in the credentials form
      await this.page.getByLabel("Email").fill(email);
      await this.page.getByLabel("Password").fill("test-password");

      // Submit the form
      await this.page
        .getByRole("button", { name: "Sign In With Password" })
        .click();

      // Wait for redirect
      await this.page.waitForURL("/");
      await this.page.waitForLoadState("networkidle");

      // Give NextAuth time to set up the session
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.error("Credentials authentication failed:", error);
      throw error;
    }
  }

  /**
   * Verifies that the user is authenticated
   */
  async verifyAuthenticated(): Promise<boolean> {
    const session = await this.getSessionData();
    return !!session?.user?.id;
  }

  /**
   * Gets the current session data
   */
  async getSessionData(): Promise<{
    user: { id: string; email: string; name: string };
    expires: string;
  } | null> {
    try {
      const response = await this.page.request.get("/api/auth/session");
      if (response.ok()) {
        const data = await response.json();
        return data && data.user ? data : null;
      }
      return null;
    } catch (error) {
      console.error("Failed to get session data:", error);
      return null;
    }
  }

  /**
   * Signs out the current user
   */
  async signOut(): Promise<void> {
    try {
      await this.page.goto("/api/auth/signout");

      const signOutButton = this.page.getByRole("button", { name: "Sign out" });
      if (await signOutButton.isVisible()) {
        await signOutButton.click();
      }

      await this.page.waitForURL("/");
      await this.page.context().clearCookies();
    } catch (error) {
      console.warn("Sign out failed:", error);
      // Clear cookies anyway
      await this.page.context().clearCookies();
    }
  }

  /**
   * Cleans up the test user and accounts
   */
  async cleanup(): Promise<void> {
    try {
      await this.signOut();
    } catch (error) {
      console.warn("Failed to sign out during cleanup:", error);
    }

    if (this.currentUser) {
      try {
        // Clean up the accounts first (foreign key constraint)
        await db
          .delete(accounts)
          .where(eq(accounts.userId, this.currentUser.id));

        // Then clean up the user
        await db.delete(user).where(eq(user.id, this.currentUser.id));
      } catch (error) {
        console.warn("Failed to cleanup test user:", error);
      }
      this.currentUser = undefined;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

export const authTest = test.extend<{
  authHelper: AuthHelper;
  authenticatedUser: NonNullable<User>;
}>({
  authHelper: async ({ page }, use) => {
    const authHelper = new AuthHelper(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(authHelper);
    await authHelper.cleanup();
  },

  authenticatedUser: async ({ authHelper }, use) => {
    const user = await authHelper.createAndAuthenticateUser();

    // Verify authentication worked
    const isAuthenticated = await authHelper.verifyAuthenticated();
    if (!isAuthenticated) {
      throw new Error("Failed to authenticate test user");
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(user);
  },
});
