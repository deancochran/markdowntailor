"use server";

import { signIn, signOut } from "@/auth";

export const githublogin = async () => {
  await signIn("github", { redirectTo: "/resumes" }, { prompt: "login" });
};
export const linkedinlogin = async () => {
  await signIn("linkedin", { redirectTo: "/resumes" }, { prompt: "login" });
};

export const googlelogin = async () => {
  await signIn("google", { redirectTo: "/resumes" }, { prompt: "login" });
};

export const logout = async () => {
  await signOut({ redirectTo: "/" });
};
