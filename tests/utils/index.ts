import { test as base } from "@playwright/test";

type AppFixtures = {
  // user: User;
};

// Extend the base Playwright `test` object with our custom fixtures.
export const test = base.extend<AppFixtures>({
  // The 'user' fixture handles the lifecycle of a test user. It is set to 'auto'
  // to run for every test that uses this custom `test` object.
  // user: [
  //   async ({}, use) => {
  //     const testUser = await createTestUser();
  //     await use(testUser);
  //     await cleanupTestUser(testUser.id);
  //   },
  //   { auto: false },
  // ],
});

// Re-export 'expect' from Playwright for convenience.
export { expect } from "@playwright/test";
