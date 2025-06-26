import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",

  dbCredentials: {
    url: process.env.DATABASE_URL as string,
    ssl: process.env.NODE_ENV === "production" ? "require" : undefined,
  },
  strict: true,
});
