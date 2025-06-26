import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize Sentry first
    await import("./sentry.server.config");

    try {
      console.info("🚀 Starting database migration...");

      // Dynamically import Node.js-specific modules
      const { db } = await import("@/db/drizzle");
      const { migrate } = await import("drizzle-orm/node-postgres/migrator");

      await migrate(db, {
        migrationsFolder: "migrations",
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
