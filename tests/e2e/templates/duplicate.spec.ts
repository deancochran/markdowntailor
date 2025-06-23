import { programmaticLogin } from "@/tests/utils/auth";
import { expect, test } from "tests/utils";

test.describe("Template Duplicate Resume Creation", () => {
  test.beforeEach(async ({ page, user }) => {
    await programmaticLogin(page, user);
    // Go to templates page
    await page.goto("/templates");

    // Optionally ensure at least one resume exists before test (depends on app state)
    // For example, confirm resumes list count or create one here if needed
  });

  test("should create a duplicate resume when 'Use as template' button is clicked", async ({
    page,
  }) => {
    // Find the first template card
    const first_card = page.getByTestId("template-card").first();
    expect(first_card).toBeVisible();
    const firstTemplateCard = page
      .locator('[data-testid="template-card-preview"]')
      .first();
    await page.waitForURL("/templates", { waitUntil: "networkidle" });
    await firstTemplateCard.click();
    const cssTab = page.getByTestId("preview-tab-css");
    const mdTab = page.getByTestId("preview-tab-markdown");
    await expect(cssTab).toBeVisible();
    await expect(mdTab).toBeVisible();

    const duplicateButton = page.getByRole("button", { name: "Use Template" });
    await expect(duplicateButton).toBeVisible();
    await duplicateButton.click();

    // After clicking, the app should redirect or update to resumes listing page
    await page.waitForURL("/resumes");

    // Check that the resumes listing contains a new duplicate resume
    // This check assumes resumes have elements with data-testid="resume-card" and that count increases
    const resumes = page.getByTestId("resume-card");
    const count = await resumes.count();
    expect(count).toBeGreaterThan(0);

    // Optionally, check that the newly created resume is similar or named accordingly
    // For example, the most recent resume could have a "copy" or template name indicator
  });
});
