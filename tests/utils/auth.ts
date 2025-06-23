import { Page } from "@playwright/test";
import { User } from "next-auth";

/**
 * Performs a programmatic login by submitting a form directly to the credentials callback URL.
 * @param page - The Playwright Page object.
 * @param user - The user object to log in with.
 */
export async function programmaticLogin(page: Page, user: User): Promise<void> {
  await page.goto("http://localhost:3000/auth/signin");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill("test");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("http://localhost:3000");

  await page.goto("/");
  await page.waitForLoadState("networkidle");
}

/**
 * Performs a programmatic login by submitting a form directly to the credentials callback URL.
 * @param page - The Playwright Page object.
 * @param user - The user object to log in with.
 */
export async function programmaticLogout(page: Page): Promise<void> {
  await page.goto("http://localhost:3000/auth/signout");
  await page.waitForURL("http://localhost:3000");
  await page.goto("/");
  await page.waitForLoadState("networkidle");
}
