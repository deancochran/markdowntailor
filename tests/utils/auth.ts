import { Page } from "@playwright/test";
import { User } from "next-auth";

/**
 * Performs a programmatic login by submitting a form directly to the credentials callback URL.
 * @param page - The Playwright Page object.
 * @param user - The user object to log in with.
 */
export async function programmaticLogin(page: Page, user: User): Promise<void> {
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");
}

/**
 * Performs a programmatic login by submitting a form directly to the credentials callback URL.
 * @param page - The Playwright Page object.
 */
export async function programmaticLogout(page: Page): Promise<void> {
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");
}
