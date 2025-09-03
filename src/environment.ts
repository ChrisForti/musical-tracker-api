import "dotenv/config";
import assert from "assert";

// Railway provides DATABASE_URL when you add PostgreSQL service
export const connectionString = process.env.DATABASE_URL;

assert(
  connectionString,
  "DATABASE_URL must be set. Make sure you have added a PostgreSQL service to your Railway project."
);
