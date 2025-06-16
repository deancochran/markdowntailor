import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extending the built-in session types
   * This includes all user data since sessions are server-side and secure
   */
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      stripeCustomerId: string | null;
      model_preference: string;
      provider_preference: string;
      alpha_credits_redeemed: boolean;
      createdAt: Date;
      updatedAt: Date;
      image: string | null;
    } & DefaultSession["user"];
  }

  /**
   * Extending the built-in user types
   * Used during sign-in/sign-up processes
   */
  interface User {
    id: string;
    name: string;
    email: string;
    stripeCustomerId: string | null;
    model_preference: string;
    provider_preference: string;
    alpha_credits_redeemed: boolean;
    createdAt: Date;
    updatedAt: Date;
    image: string | null;
  }
}

/**
 * Extending JWT types - ONLY non-sensitive data
 * JWTs are encoded (not encrypted) and might be accessible client-side
 */
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
  }
}
