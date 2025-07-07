import { env } from "@/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "migrations",
  dialect: "postgresql",

  dbCredentials: {
    url: env.DATABASE_SSL_DISABLED
      ? `${env.DATABASE_URL as string}`
      : `${env.DATABASE_URL as string}?sslmode=no-verify`,
    ssl: env.DATABASE_SSL_DISABLED ? false : true,
  },
  strict: true,
});
