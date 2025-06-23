import { db } from "@/db/drizzle";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import { user } from "./db/schema";

const providers = [GitHub, LinkedIn, Google];
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
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.password !== "string" ||
          !credentials.email
        ) {
          return null;
        }

        const email = credentials.email as string;
        const dbUser = await db
          .select()
          .from(user)
          .where(eq(user.email, email))
          .limit(1);

        if (dbUser.length === 0) {
          return null;
        }

        const currentUser = dbUser[0];
        return { ...currentUser } as User;
      },
    }),
  );
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: providers,
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        try {
          // Fetch fresh, complete user data from database
          const dbUser = await db
            .select()
            .from(user)
            .where(eq(user.id, token.sub))
            .limit(1);

          if (dbUser.length > 0) {
            const currentUser = dbUser[0];

            // Include all data in session (server-side only)
            session.user = {
              ...session.user,
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              stripeCustomerId: currentUser.stripeCustomerId,
              model_preference: currentUser.model_preference,
              provider_preference: currentUser.provider_preference,
              alpha_credits_redeemed: currentUser.alpha_credits_redeemed,
              credits: currentUser.credits,
              createdAt: currentUser.createdAt,
              updatedAt: currentUser.updatedAt,
            };
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Handle error appropriately
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT for all providers
  },
});
