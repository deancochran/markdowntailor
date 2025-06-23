import { expect, test } from "tests/utils";
import { programmaticLogin } from "tests/utils/auth";

test.describe("Logout Test User", () => {
  test("manual logout", async ({ page, user }) => {
    await programmaticLogin(page, user);
    await expect(page.getByText("TU", { exact: true })).toBeVisible();
    await page.getByText("TU", { exact: true }).click();
    await expect(page.getByRole("button", { name: "Sign Out" })).toBeVisible();
    await page.getByRole("button", { name: "Sign Out" }).click();
    await page.waitForURL("/", { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
    await page.getByRole("link", { name: "Sign In" }).click();
    await expect(page.getByTestId("policy-agreement")).toBeVisible();
  });
});
