import * as schema from "@/db/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import { Pool } from "pg";

// Stores the db connection in the global scope to prevent multiple instances due to hot reloading with Next.js
const globalForDb = globalThis as unknown as {
  drizzle: NodePgDatabase<typeof schema>;
};

// Tested and compatible with Next.js Boilerplate
const createDbConnection = () => {
  return drizzle(
    new Pool({
      connectionString: `${process.env.DATABASE_URL}?sslmode=no-verify`,
      ssl: process.env.NODE_ENV === "production" ? true : undefined,
    }),
  );
};

const db = globalForDb.drizzle || createDbConnection();

// Only store in global during development to prevent hot reload issues
if (process.env.NODE_ENV !== "production") {
  globalForDb.drizzle = db;
}

await migrate(db, {
  migrationsFolder: path.join(process.cwd(), "migrations"),
});

export { db };
