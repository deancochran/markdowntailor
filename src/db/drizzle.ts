import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(`${process.env.DATABASE_URL}`, {
  ssl: process.env.NODE_ENV === "production" ? true : undefined,
});

export { db };
