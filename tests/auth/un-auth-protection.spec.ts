import { expect, test } from "@playwright/test";

// Test suite for unauthorized users trying to access protected resources
test.describe("No Auth Protection", () => {
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
      page,
    }) => {
      // Make a direct request to the API
      const response = await page.request.post("/api/chat", {
        data: {
          messages: [{ role: "user", content: "Test message" }],
          resume: {
            id: "test-resume",
            userId: "test-user",
            title: "Test Resume",
            markdown: "# Test",
            css: "body {color: black;}",
            content: "Test Resume",
          },
        },
      });

      // Should receive an unauthorized response
      expect(response.status()).toBe(401);
    });

    // Test with incorrect/invalid auth tokens
    test("should reject requests with invalid authentication", async ({
      page,
      context,
    }) => {
      // Set an invalid auth cookie
      await context.addCookies([
        {
          name: "next-auth.session-token",
          value: "invalid-token-value",
          domain: "localhost",
          path: "/",
        },
      ]);

      // Try to access protected API
      const response = await page.request.post("/api/chat", {
        data: {
          messages: [{ role: "user", content: "Test message" }],
          resume: {
            id: "test-resume",
            userId: "test-user",
            title: "Test Resume",
            markdown: "# Test",
            css: "body {color: black;}",
            content: "Test Resume",
          },
        },
      });

      // Should still be unauthorized
      expect(response.status()).toBe(401);
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
  });
});
