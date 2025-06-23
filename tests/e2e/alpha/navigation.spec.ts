import { expect, test } from "tests/utils";
import { programmaticLogin } from "tests/utils/auth";

// This date must match the one in `src/middleware.ts`
const ALPHA_ACCESS_CUTOFF = new Date("2025-08-01T00:00:00Z");
const PROTECTED_ROUTE = "/resumes";

test.describe("Alpha Access Navigation", () => {
  test("should allow access to protected routes before the cutoff date", async ({
    page,
    user,
  }) => {
    // Set the time to 1 day before the cutoff
    const timeBeforeCutoff = new Date(ALPHA_ACCESS_CUTOFF.getTime() - 86400000); // 1 day in ms
    await page.clock.setSystemTime(timeBeforeCutoff);

    await programmaticLogin(page, user);
    await page.goto(PROTECTED_ROUTE);

    // The user should successfully land on the protected route
    await expect(page).toHaveURL(new RegExp(PROTECTED_ROUTE));
    // Check for a known element on the resumes page to be sure
    await expect(
      page.getByRole("heading", { name: "Your Resumes" }),
    ).toBeVisible();
  });

  test("should redirect to home page for protected routes after the cutoff date", async ({
    page,
    user,
  }) => {
    // Set the time to 1 day after the cutoff
    const timeAfterCutoff = new Date(ALPHA_ACCESS_CUTOFF.getTime() + 86400000); // 1 day in ms
    await page.clock.setSystemTime(timeAfterCutoff);

    await programmaticLogin(page, user);
    await page.goto(PROTECTED_ROUTE);

    // The user should be redirected to the homepage
    await expect(page).toHaveURL("/");

    // Verify the user is on the homepage by checking its title or a unique element
    await expect(
      page.getByRole("heading", { name: "Resume Builder" }),
    ).toBeVisible();
  });

  test("should block access for unauthenticated users regardless of date", async ({
    page,
  }) => {
    // Set the time to before the cutoff, when access should be allowed for authenticated users
    const timeBeforeCutoff = new Date(ALPHA_ACCESS_CUTOFF.getTime() - 86400000);
    await page.clock.setSystemTime(timeBeforeCutoff);

    // Do not log in the user
    await page.goto(PROTECTED_ROUTE);

    // The user should be redirected to the login page
    await expect(page).toHaveURL("/login");
  });
});
