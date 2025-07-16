// import { expect, test } from "tests/utils";
// import { programmaticLogin } from "tests/utils/auth";

// test.describe("Settings Page", () => {
//   test.beforeEach(async ({ page, user }) => {
//     // Log in before each test
//     await programmaticLogin(page, user);
//     await page.goto("/settings");
//   });

//   test("displays user profile information", async ({ page }) => {
//     const name = await page.getByTestId("profile-name").textContent();
//     // We expect the profile name and email to be visible and non-empty
//     expect(name?.length).toBeGreaterThan(0);

//     // The user avatar should be visible (either image or fallback)
//     await expect(page.getByTestId("profile-avatar")).toBeVisible();
//   });

//   test("shows payment success alert when query param ?payment=success is set", async ({
//     page,
//   }) => {
//     await page.goto("/settings?payment=success");
//     const alert = page.getByTestId("payment-success-alert");
//     await expect(alert).toBeVisible();
//     await expect(alert).toContainText("Payment successful");
//   });
// });
