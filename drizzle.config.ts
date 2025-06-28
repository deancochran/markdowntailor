import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "migrations",
  dialect: "postgresql",

  dbCredentials: {
    url:
      process.env.NODE_ENV === "production"
        ? `${process.env.DATABASE_URL}?sslmode=no-verify`
        : `${process.env.DATABASE_URL}`,
    ssl: process.env.NODE_ENV === "production" ? true : undefined,
  },
  strict: true,
});
