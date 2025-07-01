import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_SSL_DISABLED
      ? `${process.env.DATABASE_URL as string}`
      : `${process.env.DATABASE_URL as string}?sslmode=no-verify`,
    ssl: process.env.DATABASE_SSL_DISABLED ? false : true,
  },
});

export { db };
