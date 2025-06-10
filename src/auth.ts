import { db } from "@/db/drizzle";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import LinkedIn from "next-auth/providers/linkedin";

import { eq } from "drizzle-orm";
import NextAuth, { User } from "next-auth";
import z, { ZodError } from "zod";
import { user } from "./db/schema";

const providers = [GitHub, LinkedIn];

const testSignInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});
if (process.env.NODE_ENV === "development") {
  providers.push(
    //@ts-expect-error issue https://github.com/nextauthjs/next-auth/issues/6174
    Credentials({
      id: "password",
      name: "Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, _request) {
        try {
          const { password: _password, email } =
            await testSignInSchema.parseAsync(credentials);

          const dbUser = await db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1);

          if (dbUser.length === 0) {
            return null;
          }
          const currentUser = dbUser[0];
          return { ...currentUser, role: "user" } as User;
        } catch (error) {
          if (error instanceof ZodError) {
            return null;
          }
        }
        return null;
      },
    }),
  );
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: providers,
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT for all providers
  },
});
