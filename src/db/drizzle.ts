import { drizzle } from "drizzle-orm/node-postgres";
// import { drizzle } from "drizzle-orm/neon-http";
// import { neon } from "@neondatabase/serverless";
import "dotenv/config";

// const sql = neon(process.env.DATABASE_URL!);
// You can specify any property from the node-postgres connection options
export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL,
    // ssl: true
  },
});
