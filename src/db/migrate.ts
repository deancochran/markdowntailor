import { db } from "@/db/drizzle";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";

export async function run_migrations() {
  console.log("Running migrations...");
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "migrations"),
  });
  console.log("Migrations done!");
}
