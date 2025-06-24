import { expect, test } from "tests/utils";
import { programmaticLogin } from "tests/utils/auth";

test.describe("Logout Test User", () => {
  test("manual logout", async ({ page, user }) => {
    await programmaticLogin(page, user);
    await expect(page.getByText("TU", { exact: true })).toBeVisible();
    await page.getByText("TU", { exact: true }).click();
    const button = page.getByRole("button", { name: "Sign Out" });
    await expect(button).toBeVisible();
    await button.click();
    await page.waitForURL("/", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Sign In" }).click();
    await expect(page.getByTestId("policy-agreement")).toBeVisible();
  });
});
