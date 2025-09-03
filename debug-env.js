#!/usr/bin/env node

console.log("=== Environment Variables Debug ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");

// Check for Railway-specific variables
console.log("\n=== Railway Variables ===");
console.log("RAILWAY_ENVIRONMENT:", process.env.RAILWAY_ENVIRONMENT);
console.log("RAILWAY_PROJECT_ID:", process.env.RAILWAY_PROJECT_ID);
console.log("RAILWAY_SERVICE_ID:", process.env.RAILWAY_SERVICE_ID);

// Check all database-related environment variables
console.log("\n=== All Database Variables ===");
const dbVars = Object.keys(process.env).filter(key => 
  key.includes('DATABASE') || 
  key.includes('POSTGRES') || 
  key.includes('PG') ||
  key.includes('DB')
);

if (dbVars.length === 0) {
  console.log("❌ No database-related environment variables found!");
} else {
  dbVars.forEach(key => {
    const value = process.env[key];
    if (key.toLowerCase().includes('password') || key.toLowerCase().includes('pass')) {
      console.log(`${key}:`, value ? "SET" : "NOT SET");
    } else {
      console.log(`${key}:`, value || "NOT SET");
    }
  });
}

console.log("\n=== All Environment Variables ===");
const allKeys = Object.keys(process.env).sort();
allKeys.forEach(key => {
  const value = process.env[key];
  if (key.toLowerCase().includes('password') || key.toLowerCase().includes('pass') || key.toLowerCase().includes('secret')) {
    console.log(`${key}:`, value ? "SET" : "NOT SET");
  } else {
    console.log(`${key}:`, value || "NOT SET");
  }
});
