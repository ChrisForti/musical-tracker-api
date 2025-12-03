import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import { Pool } from "pg";
import { connectionString } from "../environment.js";

console.log("🔌 Initializing database connection pool...");

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20,
});

// Log connection errors
pool.on("error", (err) => {
  console.error("❌ Unexpected database pool error:", err);
});

pool.on("connect", () => {
  console.log("✅ Database client connected to pool");
});

export const db = drizzle(pool, { schema });

console.log("✅ Database connection pool initialized");
