// index.ts
import { db } from "@/db/drizzle";
import { migrate } from "drizzle-orm/node-postgres/migrator";

console.info("Starting database migration...");
await migrate(db, { migrationsFolder: "./migrations" });
console.info("Finished database migration...");
