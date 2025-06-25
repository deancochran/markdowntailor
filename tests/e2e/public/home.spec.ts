import { expect, test } from "tests/utils";

test.describe("Home Page", () => {
  test("Should Display Logo", async ({ page }) => {
    await page.goto("/");
    const logo = page.getByRole("link", { name: "markdowntailor" });
    await expect(logo).toBeVisible();
  });
});
