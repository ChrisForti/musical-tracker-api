import "dotenv/config";
import assert from "assert";

// Railway provides these variables automatically when you add PostgreSQL service
const DATABASE_URL = process.env.DATABASE_URL;
const PGHOST = process.env.PGHOST;
const PGPORT = process.env.PGPORT;
const PGUSER = process.env.PGUSER;
const PGPASSWORD = process.env.PGPASSWORD;
const PGDATABASE = process.env.PGDATABASE;

// Try DATABASE_URL first, then construct from individual variables
export const connectionString =
  DATABASE_URL ||
  (PGHOST && PGPORT && PGUSER && PGPASSWORD && PGDATABASE
    ? `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}`
    : undefined);

assert(
  connectionString,
  "DATABASE_URL must be set, or all PG* variables must be provided (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE)."
);
