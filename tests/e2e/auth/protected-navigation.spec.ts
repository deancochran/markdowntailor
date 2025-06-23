import { expect, test } from "tests/utils";

test.describe("Protected Page Routes", () => {
  test("/resumes", async ({ page }) => {
    await page.goto("/resumes");
    await page.waitForURL("/resumes", { waitUntil: "networkidle" });
    expect(page.url()).toBe("/login");
  });
  test("/resumes/any-resume-id", async ({ page }) => {
    await page.goto("/resumes/any-resume-id");
    await page.waitForURL("/", { waitUntil: "networkidle" });
    expect(page.url()).toBe("/login");
  });
  test("/resumes/any-resume-id/versions", async ({ page }) => {
    await page.goto("/resumes/any-resume-id/versions");
    await page.waitForURL("/", { waitUntil: "networkidle" });
    expect(page.url()).toBe("/login");
  });
  test("/templates", async ({ page }) => {
    await page.goto("/templates");
    await page.waitForURL("/", { waitUntil: "networkidle" });
    expect(page.url()).toBe("/login");
  });
  test("/settings", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL("/", { waitUntil: "networkidle" });
    expect(page.url()).toBe("/login");
  });
});
