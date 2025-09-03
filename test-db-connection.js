#!/usr/bin/env node

// Simple database connection test for Railway debugging
const { Client } = require("pg");

async function testConnection() {
  console.log("Environment variables:");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
  console.log("PGHOST:", process.env.PGHOST);
  console.log("PGPORT:", process.env.PGPORT);
  console.log("PGUSER:", process.env.PGUSER);
  console.log("PGPASSWORD:", process.env.PGPASSWORD ? "SET" : "NOT SET");
  console.log("PGDATABASE:", process.env.PGDATABASE);

  const connectionString =
    process.env.DATABASE_URL ||
    (process.env.PGHOST &&
    process.env.PGPORT &&
    process.env.PGUSER &&
    process.env.PGPASSWORD &&
    process.env.PGDATABASE
      ? `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`
      : undefined);

  if (!connectionString) {
    console.error("❌ No database connection string available!");
    process.exit(1);
  }

  console.log(
    "Using connection string format:",
    connectionString.replace(/:([^:@]+)@/, ":***@")
  );

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log("🔄 Connecting to database...");
    await client.connect();
    console.log("✅ Database connection successful!");

    const result = await client.query("SELECT version()");
    console.log("📊 PostgreSQL version:", result.rows[0].version);

    await client.end();
    console.log("✅ Connection closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

testConnection();
