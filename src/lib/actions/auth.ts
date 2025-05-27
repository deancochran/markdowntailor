"use server";

import { signIn, signOut } from "@/auth";

export const githublogin = async () => {
  await signIn("github", { redirectTo: "/" });
};
export const linkedinlogin = async () => {
  await signIn("linkedin", { redirectTo: "/" });
};

export const logout = async () => {
  await signOut({ redirectTo: "/" });
};
