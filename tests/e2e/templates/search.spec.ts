import { expect, test } from "tests/utils";
import { programmaticLogin } from "tests/utils/auth";

test.describe("Templates Page Search and Filter", () => {
  test.beforeEach(async ({ page, user }) => {
    await programmaticLogin(page, user);
    await page.goto("/templates");
  });

  test("should list templates initially", async ({ page }) => {
    const templates = page.getByTestId("template-card");
    const count = await templates.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should filter templates by search input", async ({ page }) => {
    const searchInput = page.getByTestId("template-search");
    const templates = page.getByTestId("template-card");

    // Enter a search term that matches at least one template
    await searchInput.fill("software engineer");
    await page.waitForTimeout(500); // allow debounce or filter delay
    const filteredCount = await templates.count();
    expect(filteredCount).toEqual(1); // Assuming only one template matches

    // Enter a search term that matches no templates
    await searchInput.fill("xyznotemplate");
    await page.waitForTimeout(500);
    const filteredZeroCount = await templates.count();
    expect(filteredZeroCount).toBe(0);
  });

  test("should filter templates by tag filter", async ({ page }) => {
    const templates = page.getByTestId("template-card");
    // There should be some templates matching the tag
    const initCount = await templates.count();
    expect(initCount).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Filter by tag" }).click();

    // Assuming there is a tag to select, e.g., "Design"
    const firstTag = page.getByText("Design");
    await firstTag.click();

    // Verify count after selecting a tag, should match expected count
    await page.waitForTimeout(500); // allow debounce or filter delay
    const filteredCount = await templates.count();
    expect(filteredCount).toBeGreaterThan(0); // Expect some templates to match the selected tag
  });

  test("should show empty state when no templates match search or filter", async ({
    page,
  }) => {
    const searchInput = page.getByTestId("template-search");
    await searchInput.fill("nonexistenttemplate");
    await page.waitForTimeout(500);

    // Check for empty state message
    const emptyState = page.getByText("No templates found");
    await expect(emptyState).toBeVisible();
  });
});
