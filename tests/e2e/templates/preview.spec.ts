import { programmaticLogin } from "@/tests/utils/auth";
import { expect, test } from "tests/utils";

test.describe("Template Preview Modal", () => {
  test.beforeEach(async ({ page, user }) => {
    await programmaticLogin(page, user);
    await page.goto("/templates");
  });

  test("should open preview modal when a template card is clicked", async ({
    page,
  }) => {
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
    const closeButton = page.getByRole("button", { name: "Close" });
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await expect(cssTab).not.toBeVisible();
    await expect(mdTab).not.toBeVisible();
  });
});
