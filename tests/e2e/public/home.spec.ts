import { expect, test } from "tests/utils";

test.describe("Home Page", () => {
  test("should display the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Resume Builder");
  });
});
