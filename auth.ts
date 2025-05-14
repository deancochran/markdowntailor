import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import ForwardEmail from "next-auth/providers/forwardemail";
// import Google from "next-auth/providers/google";
import { db } from "@/db/drizzle";
import { accounts, sessions, users, verificationTokens } from "@/db/schemas";

export const { handlers, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    ForwardEmail,
  ],
  callbacks: {
    async session({ session, user }) {
      // Add custom user data to session
      if (session?.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.username = user.username;
      }
      return session;
    },
  },
});
