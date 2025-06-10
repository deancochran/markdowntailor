"use server";

import { signIn, signOut } from "@/auth";
import { withSentry } from "@/lib/utils/sentry";

export const githublogin = withSentry("github-login", async () => {
  await signIn("github", { redirectTo: "/" }, { prompt: "login" });
});

export const linkedinlogin = withSentry("linkedin-login", async () => {
  await signIn("linkedin", { redirectTo: "/" }, { prompt: "login" });
});

export const logout = withSentry("logout", async () => {
  await signOut({ redirectTo: "/" });
});
