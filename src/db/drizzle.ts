import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Create the connection pool with better error handling
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set");
}
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? true : undefined,
});

export const db = drizzle(pool);
