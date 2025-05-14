import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      id: string;
      role: string;
      username?: string;
    } & DefaultSession["user"];
  }

  /**
   * Extending the built-in user types
   */
  interface User {
    role: string;
    username?: string;
  }
}
