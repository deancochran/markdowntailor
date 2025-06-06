"use server";

import { signIn, signOut } from "@/auth";

export const githublogin = async () => {
  await signIn("github", { redirectTo: "/" }, { prompt: "login" });
};
export const linkedinlogin = async () => {
  await signIn("linkedin", { redirectTo: "/" }, { prompt: "login" });
};

export const logout = async () => {
  await signOut({ redirectTo: "/" });
};
