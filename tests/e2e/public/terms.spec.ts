import { expect, test } from "tests/utils";

test.describe("Terms of Service Page", () => {
  test("Should Display Terms", async ({ page }) => {
    await page.goto("/terms-of-service");
    const terms = page.getByText("Terms of Service", { exact: true });
    await expect(terms).toBeVisible();
  });
});
