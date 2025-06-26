import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Create the connection pool with better error handling
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set");
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({
  connectionString,
  // Add connection timeout to fail fast if DB is unreachable
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool);
