import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "migrations",
  dialect: "postgresql",

  dbCredentials: {
    url: process.env.DATABASE_SSL_DISABLED
      ? `${process.env.DATABASE_URL as string}`
      : `${process.env.DATABASE_URL as string}?sslmode=no-verify`,
    ssl: process.env.DATABASE_SSL_DISABLED ? false : true,
  },
  strict: true,
});
