import { expect, test } from "tests/utils";
import { programmaticLogin } from "tests/utils/auth";
import { createTestResume } from "tests/utils/data-factory";

// This date must match the one in `src/middlewear.ts`
const ALPHA_ACCESS_CUTOFF = new Date("2025-08-01T00:00:00Z");

// We assume `/api/pdf` is a protected API route for this test suite.
// The middleware should apply the alpha access rules to it.
const PROTECTED_API_ROUTE = "/api/pdf";

const minimalResume = {
  markdown: "# Test Resume",
  css: "body { font-size: 12pt; }",
};

test.describe("Alpha Access API", () => {
  test("should allow API access to protected routes before the cutoff date", async ({
    page,
    user,
  }) => {
    // Set the time to 1 month before the cutoff
    const timeBeforeCutoff = new Date(ALPHA_ACCESS_CUTOFF);
    timeBeforeCutoff.setMonth(timeBeforeCutoff.getMonth() - 1);
    await page.clock.setSystemTime(timeBeforeCutoff);

    await programmaticLogin(page, user);
    const resume = await createTestResume(user, minimalResume);

    const response = await page.request.post(PROTECTED_API_ROUTE, {
      data: { resumeId: resume.id },
    });

    // The request should succeed
    expect(response.ok()).toBe(true);
    const json = await response.json();
    expect(json).toHaveProperty("pdfBase64");
  });

  test("should block API access to protected routes after the cutoff date", async ({
    page,
    user,
  }) => {
    // Set the time to 1 day after the cutoff
    const timeAfterCutoff = new Date(ALPHA_ACCESS_CUTOFF.getTime() + 86400000); // 1 day in ms
    await page.clock.setSystemTime(timeAfterCutoff);

    await programmaticLogin(page, user);
    const resume = await createTestResume(user, minimalResume);

    const response = await page.request.post(PROTECTED_API_ROUTE, {
      data: { resumeId: resume.id },
      // Do not follow redirects, so we can assert the redirect itself
      maxRedirects: 0,
    });

    // The middleware should issue a redirect to the homepage.
    // NextResponse.redirect() issues a 307 (Temporary Redirect).
    expect(response.status()).toBe(307);

    // The `Location` header should point to the root of the application.
    const location = response.headers().location;
    const requestUrl = new URL(page.url());
    expect(location).toBe(`${requestUrl.origin}/`);
  });

  test("should block API access for unauthenticated users regardless of date", async ({
    page,
  }) => {
    // Set time to before the cutoff, when access should be allowed for authenticated users
    const timeBeforeCutoff = new Date(ALPHA_ACCESS_CUTOFF);
    timeBeforeCutoff.setMonth(timeBeforeCutoff.getMonth() - 1);
    await page.clock.setSystemTime(timeBeforeCutoff);

    // Do not log in the user
    const response = await page.request.post(PROTECTED_API_ROUTE, {
      data: { resumeId: "any-id" },
    });

    // The API's own auth check should return 401
    expect(response.status()).toBe(401);
  });
});
