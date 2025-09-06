import "dotenv/config";
import assert from "assert";

// Check for various Railway database URL patterns
export const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRESQL_URL ||
  process.env.DB_URL;

assert(
  connectionString,
  "No database URL found. Checked: DATABASE_URL, POSTGRES_URL, POSTGRESQL_URL, DB_URL. Make sure PostgreSQL service is linked to your app."
);
