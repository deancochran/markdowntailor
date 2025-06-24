import { expect, test } from "tests/utils";

test.describe("Protected Page Routes", () => {
  test("/resumes", async ({ page }) => {
    await page.goto("/resumes");
    await page.waitForURL("/login");
    expect(page.url()).toBe("http://localhost:3000/login");
  });
  test("/resumes/any-resume-id", async ({ page }) => {
    await page.goto("/resumes/any-resume-id");
    await page.waitForURL("/login");
    expect(page.url()).toBe("http://localhost:3000/login");
  });
  test("/resumes/any-resume-id/versions", async ({ page }) => {
    await page.goto("/resumes/any-resume-id/versions");
    await page.waitForURL("/login");
    expect(page.url()).toBe("http://localhost:3000/login");
  });
  test("/templates", async ({ page }) => {
    await page.goto("/templates");
    await page.waitForURL("/login");
    expect(page.url()).toBe("http://localhost:3000/login");
  });
  test("/settings", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL("/login");
    expect(page.url()).toBe("http://localhost:3000/login");
  });
});
