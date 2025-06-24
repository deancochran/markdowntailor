import { redis } from "@/lib/upstash";
import { generateCacheKey } from "@/lib/utils/pdfGenerator";
import { expect, test } from "tests/utils";
import { programmaticLogin, programmaticLogout } from "tests/utils/auth";
import {
  cleanupTestUser,
  createTestResume,
  createTestUser,
} from "tests/utils/data-factory";

const minimalResume = {
  markdown: "# John Doe\n\nSoftware Engineer with 5 years of experience.",
  css: "body { font-family: sans-serif; }",
};

test.describe("PDF API Endpoint", () => {
  // Use the user fixture for a logged-in user in most tests
  test.beforeEach(async ({ page, user }) => {
    await programmaticLogin(page, user);
  });

  // Note: 'user' fixture automatically cleans itself up.
  // We just need to log out after each test.
  test.afterEach(async ({ page }) => {
    await programmaticLogout(page);
  });

  test("should return 400 if resumeId is missing", async ({ page }) => {
    const response400 = await page.request.post("/api/pdf", {
      data: {}, // Missing resumeId
    });

    expect(response400.status()).toBe(400);
    const json = await response400.json();
    expect(json.error).toBe("Resume ID is required");

    const nonExistentId = "non-existent-uuid-12345";
    const response404 = await page.request.post("/api/pdf", {
      data: { resumeId: nonExistentId },
    });

    expect(response404.status()).toBe(404);
  });

  test("should return 403 when requesting another user's resume", async ({
    page,
    user,
  }) => {
    // Create a resume for the main test user (user1)
    const resumeForUser1 = await createTestResume(user, { ...minimalResume });

    // Create and log in as a second user
    const user2 = await createTestUser({
      email: `user2-${Date.now()}@example.com`,
    });
    await programmaticLogout(page);
    await programmaticLogin(page, user2);

    // As user2, try to access user1's resume
    const response = await page.request.post("/api/pdf", {
      data: { resumeId: resumeForUser1.id },
    });

    expect(response.status()).toBe(403);

    // Clean up the second user manually
    await cleanupTestUser(user2.id);
  });

  test("should serve a cached PDF on the second identical request", async ({
    page,
    user,
  }) => {
    const resume = await createTestResume(user, { ...minimalResume });

    // Ensure no stale cache exists before the test
    const cacheKey = generateCacheKey(
      minimalResume.markdown,
      minimalResume.css,
    );
    await redis.del(cacheKey);

    // First request - should generate and cache the PDF
    const firstResponse = await page.request.post("/api/pdf", {
      data: { resumeId: resume.id },
    });
    expect(firstResponse.ok()).toBe(true);
    const firstJson = await firstResponse.json();
    expect(firstJson.cached).toBe(false);

    // Second request - should be served from the cache
    const secondResponse = await page.request.post("/api/pdf", {
      data: { resumeId: resume.id },
    });
    expect(secondResponse.ok()).toBe(true);
    const secondJson = await secondResponse.json();
    expect(secondJson.cached).toBe(true);

    // Verify the cached content is the same as the original
    expect(secondJson.pdfBase64).toBe(firstJson.pdfBase64);
    expect(secondJson.pageCount).toBe(firstJson.pageCount);

    // Cleanup the cache created by this test
    await redis.del(cacheKey);
  });
});
