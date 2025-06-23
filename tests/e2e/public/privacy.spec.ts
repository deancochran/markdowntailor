import { expect, test } from "tests/utils";

test.describe("Privacy Policy Page", () => {
  test("Should Display Privacy Policy", async ({ page }) => {
    await page.goto("/privacy-policy");
    const privacyPolicy = page.getByText("Privacy Policy", { exact: true });
    await expect(privacyPolicy).toBeVisible();
  });
});
