import { db } from "@/db/drizzle";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import GitHub from "next-auth/providers/github";
import LinkedIn from "next-auth/providers/linkedin";

import NextAuth from "next-auth";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [GitHub, LinkedIn],
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
