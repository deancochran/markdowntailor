import { expect, test } from "@playwright/test";

test.describe("Unauthenticated User", () => {
  test("Can go to sign in page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("policy-agreement")).toBeVisible();
  });
});
