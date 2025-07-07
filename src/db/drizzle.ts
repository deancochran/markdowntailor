import { env } from "@/env";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle({
  connection: {
    connectionString: env.DATABASE_SSL_DISABLED
      ? `${env.DATABASE_URL as string}`
      : `${env.DATABASE_URL as string}?sslmode=no-verify`,
    ssl: env.DATABASE_SSL_DISABLED ? false : true,
  },
});

export { db };
