"use server";

import { signIn, signOut } from "@/auth";

export const login = async () => {
  await signIn("github", { redirect: "/" });
};

export const logout = async () => {
  await signOut("github", { redirect: "/" });
};
