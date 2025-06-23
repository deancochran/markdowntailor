import { expect, test } from "tests/utils";

test.describe("Blocked Page", () => {
  test("Should Display Warning", async ({ page }) => {
    await page.goto("/blocked");
    await expect(page.getByText("429: Too Many Requests!")).toBeVisible();
  });
});
