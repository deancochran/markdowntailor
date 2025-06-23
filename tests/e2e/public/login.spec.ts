"Terms of Service";
"Privacy Policy";
import { expect, test } from "tests/utils";

test.describe("Login Page", async () => {
  test("Should Display Terms/Privacy Links and OAuth Buttons", async ({
    page,
  }) => {
    await page.goto("/login");
    const termsOfServiceLink = page.getByRole("link", {
      name: "Terms of Service",
    });
    await expect(termsOfServiceLink).toBeVisible();

    const privacyPolicyLink = page.getByRole("link", {
      name: "Privacy Policy",
    });

    await expect(privacyPolicyLink).toBeVisible();

    const continueWithGoogleButton = page.getByRole("button", {
      name: "Continue with Google",
    });
    await expect(continueWithGoogleButton).toBeVisible();

    const continueWithGithubButton = page.getByRole("button", {
      name: "Continue with Github",
    });
    await expect(continueWithGithubButton).toBeVisible();

    const continueWithLinkedInButton = page.getByRole("button", {
      name: "Continue with LinkedIn",
    });
    await expect(continueWithLinkedInButton).toBeVisible();
  });
});
