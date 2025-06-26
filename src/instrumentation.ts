import { db } from "@/db/drizzle";
import * as Sentry from "@sentry/nextjs";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize Sentry first
    await import("./sentry.server.config");

    // Run database migrations
    try {
      console.info("🚀 Starting database migration...");

      await migrate(db, {
        migrationsFolder: path.join(process.cwd(), "migrations"),
      });

      console.info("✅ Database migration completed successfully!");
    } catch (error) {
      console.error("❌ Migration failed:", error);

      // Report migration failure to Sentry
      Sentry.captureException(error, {
        tags: {
          component: "database_migration",
          phase: "startup",
        },
      });

      // Re-throw to prevent server from starting with broken DB
      throw error;
    }
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
