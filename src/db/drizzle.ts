import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

// Create the connection pool with better error handling
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set");
}
export const db = drizzle(process.env.DATABASE_URL as string);
