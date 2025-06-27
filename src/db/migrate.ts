import { db } from "@/db/drizzle";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";

async function run() {
  console.log("Running migrations...");
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "migrations"),
  });
  console.log("Migrations done!");
}

run().catch((error) => {
  console.error(error, "MIGRATION_FAILED");
  process.exit(1);
});
