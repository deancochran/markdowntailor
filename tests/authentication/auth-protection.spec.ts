import { expect, test } from "@playwright/test";

// Test suite for unauthorized users trying to access protected resources
test.describe("Authentication Protection", () => {
  // Setup for each test: ensuring we're using a fresh context with no authentication
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // Test group for protected page routes
  test.describe("Protected Page Routes", () => {
    // Test that accessing protected routes redirects to login
    test("should redirect to login when accessing /resumes", async ({
      page,
    }) => {
      // Attempt to access a protected route
      await page.goto("/resumes");

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByTestId("policy-agreement")).toBeVisible();
    });

    test("should redirect to login when accessing /templates", async ({
      page,
    }) => {
      // Attempt to access another protected route
      await page.goto("/templates");

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByTestId("policy-agreement")).toBeVisible();
    });

    // Testing nested protected routes
    test("should redirect to login when accessing nested protected routes", async ({
      page,
    }) => {
      // Try to access a nested protected route
      await page.goto("/resumes/any-resume-id");

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByTestId("policy-agreement")).toBeVisible();
    });
  });

  // Test group for protected API endpoints
  test.describe("Protected API Endpoints", () => {
    test("should return 401 when accessing /api/chat without authentication", async ({
      request,
    }) => {
      // Make a direct request to the API
      const response = await request.post("/api/chat", {
        data: {
          messages: [{ role: "user", content: "Test message" }],
          resume: { markdown: "# Test", css: "body {color: black;}" },
        },
      });

      // Should receive an unauthorized response
      expect(response.status()).toBe(401);
    });

    // Test with incorrect/invalid auth tokens if applicable
    test("should reject requests with invalid authentication", async ({
      request,
      context,
    }) => {
      // Set an invalid auth cookie or header
      await context.addCookies([
        {
          name: "next-auth.session-token",
          value: "invalid-token-value",
          domain: "localhost",
          path: "/",
        },
      ]);

      // Try to access protected API
      const response = await request.post("/api/chat", {
        data: {
          messages: [{ role: "user", content: "Test message" }],
          resume: { markdown: "# Test", css: "body {color: black;}" },
        },
      });

      // Should still be unauthorized
      expect(response.status()).toBe(401);
    });
  });

  // Test for direct access to protected resources
  test.describe("Direct Resource Access", () => {
    // Trying to access resources that should only be available to authenticated users
    test("should not expose protected data in the DOM for unauthenticated users", async ({
      page,
    }) => {
      // Go to home page
      await page.goto("/");

      // Verify we don't see protected content
      const protectedContentVisible = await page.evaluate(() => {
        // Look for elements or content that should only be visible to authenticated users
        // This depends on your app's structure
        const protectedElements = document.querySelectorAll(
          // Selectors for elements that should only appear for authenticated users
          "[data-testid=user-profile], [data-testid=resume-list], .authenticated-only",
        );
        return protectedElements.length > 0;
      });

      expect(protectedContentVisible).toBe(false);
    });
  });

  // Testing authentication flow
  test.describe("Authentication Flows", () => {
    test("login page should be accessible to unauthenticated users", async ({
      page,
    }) => {
      await page.goto("/login");

      // Login page should be visible and functional
      await expect(page.getByTestId("policy-agreement")).toBeVisible();

      // GitHub login button should be present
      const githubButton = page.getByText("Continue with GitHub", {
        exact: true,
      });
      await expect(githubButton).toBeVisible();

      // LinkedIn login button should be present
      const linkedinButton = page.getByText("Continue with LinkedIn", {
        exact: true,
      });
      await expect(linkedinButton).toBeVisible();
    });

    // Additional tests for redirect after login could be added here
    // but would require mock authentication which is more complex
  });
});
