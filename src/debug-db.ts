import { db } from "./drizzle/db.js";

async function checkDatabaseState() {
  try {
    console.log("Checking database state...");

    // Check if uploaded_images table exists
    const result = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'uploaded_images'
    `);

    if (result.rows.length > 0) {
      console.log("✅ uploaded_images table already exists");
    } else {
      console.log("❌ uploaded_images table does not exist - migration needed");
    }

    // Check all tables
    const allTables = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("\nCurrent tables in database:");
    allTables.rows.forEach((row: any) => {
      console.log(`- ${row.table_name}`);
    });

    // Check migration tracking table
    const migrationCheck = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'drizzle' OR table_name LIKE '%migrations%'
    `);

    console.log("\nMigration tracking:");
    migrationCheck.rows.forEach((row: any) => {
      console.log(`- ${row.table_name}`);
    });
  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    process.exit(0);
  }
}

checkDatabaseState();
