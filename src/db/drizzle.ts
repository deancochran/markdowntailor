import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle({
  connection: {
    connectionString:
      process.env.NODE_ENV === "production"
        ? `${process.env.DATABASE_URL}?sslmode=no-verify`
        : `${process.env.DATABASE_URL}`,
    ssl: process.env.NODE_ENV === "production" ? true : undefined,
  },
});

export { db };
