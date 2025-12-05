import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import { Pool } from "pg";
import { connectionString } from "../environment.js";

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20,
});

// Log connection errors
pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

export const db = drizzle(pool, { schema });
