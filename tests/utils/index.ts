import { User } from "next-auth";
import { APIRequestContext, Page } from "playwright";
import { test as base } from "playwright/test";
import { cleanupTestUser, createTestUser } from "./data-factory";

type AppFixtures = {
  user: User;
  authedPage: Page;
  authedRequest: APIRequestContext;
};

// Extend the base Playwright `test` object with our custom fixtures.
export const test = base.extend<AppFixtures>({
  // The 'user' fixture handles the lifecycle of a test user. It is set to 'auto'
  // to run for every test that uses this custom `test` object.
  user: [
    async ({}, use) => {
      const testUser = await createTestUser();
      await use(testUser);
      await cleanupTestUser(testUser.id);
    },
    { auto: true },
  ],
});

// Re-export 'expect' from Playwright for convenience.
export { expect } from "@playwright/test";
