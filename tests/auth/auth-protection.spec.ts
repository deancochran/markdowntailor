import { expect } from "@playwright/test";
import { authTest } from "tests/utils/auth";

// Test suite for unauthorized users trying to access protected resources
authTest.describe("Auth Protection", () => {
  authTest.beforeEach(async ({ authenticatedUser }) => {
    // Clean up any existing test data for this user
  });

  authTest.afterEach(async ({ authenticatedUser }) => {
    // Clean up test data
  });

  // Testing authentication flow
  authTest("Authentication Flows", async ({ page }) => {
    // Now try to access login page
    await page.goto("/login");

    // Should be redirected away from login (typically to dashboard/home)
    await page.waitForTimeout(1000); // Give time for redirect
    expect(page.url()).not.toMatch(/\/login/);
  });
});
