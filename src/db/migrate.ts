import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./drizzle";

try {
  console.info("Starting to migrate...");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  await migrate(db, { migrationsFolder: "migrations" });
  console.info("migrated successfully");
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
}
