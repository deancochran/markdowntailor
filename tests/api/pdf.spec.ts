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

  test("should return 429 for rate-limited requests", async ({
    page,
    user,
  }) => {
    const resume = await createTestResume(user, minimalResume);
    const requestPayload = { data: { resumeId: resume.id } };

    // The default Upstash rate limiter is 5 requests per 10 seconds.
    // We send 10 requests rapidly to ensure we trigger the limit.
    const promises = [];
    for (let i = 0; i < 16; i++) {
      promises.push(page.request.post("/api/pdf", requestPayload));
    }
    const responses = await Promise.all(promises);
    const statusCodes = responses.map((res) => res.status());

    expect(statusCodes).toContain(429);
  });

  test("should return 400 if resumeId is missing", async ({ page }) => {
    const response = await page.request.post("/api/pdf", {
      data: {}, // Missing resumeId
    });

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Resume ID is required");
  });

  test("should return 404 for a non-existent resume", async ({ page }) => {
    const nonExistentId = "non-existent-uuid-12345";
    const response = await page.request.post("/api/pdf", {
      data: { resumeId: nonExistentId },
    });

    expect(response.status()).toBe(404);
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

  test("should successfully generate a PDF for a valid request", async ({
    page,
    user,
  }) => {
    const resume = await createTestResume(user, { ...minimalResume });

    const response = await page.request.post("/api/pdf", {
      data: { resumeId: resume.id },
    });

    expect(response.ok()).toBe(true);
    const json = await response.json();

    expect(json).toHaveProperty("pdfBase64");
    expect(typeof json.pdfBase64).toBe("string");
    expect(json.pdfBase64.length).toBeGreaterThan(100);

    expect(json).toHaveProperty("pageCount");
    expect(typeof json.pageCount).toBe("number");
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
