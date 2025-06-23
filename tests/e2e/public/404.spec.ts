import { expect, test } from "tests/utils";

test.describe("404 Page", () => {
  test("Should Display Warning", async ({ page }) => {
    await page.goto("/not-a-page");
    await expect(page.getByText("404: Career Detour Ahead!")).toBeVisible();
  });
});
