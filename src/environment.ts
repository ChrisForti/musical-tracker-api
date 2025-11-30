import "dotenv/config";
import assert from "assert";

// Default port for the API server
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Check for various Railway database URL patterns
export const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRESQL_URL ||
  process.env.DB_URL;

// Validate required environment variables
export function validateEnv() {
  // Only DATABASE_URL is critical for startup
  if (!connectionString) {
    throw new Error(
      "Missing required environment variable: DATABASE_URL\n" +
        "Please check your .env file and ensure DATABASE_URL is set."
    );
  }

  // Warn about missing AWS config but don't crash
  const hasAwsConfig =
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET;

  if (!hasAwsConfig) {
    console.warn("⚠️  WARNING: AWS S3 configuration is incomplete. Image uploads will fail.");
    console.warn("Missing:", {
      AWS_ACCESS_KEY_ID: !process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: !process.env.AWS_SECRET_ACCESS_KEY,
      AWS_S3_BUCKET: !process.env.AWS_S3_BUCKET,
    });
  }

  console.log("Environment validation successful:", {
    port: PORT,
    hasDbConnection: !!connectionString,
    hasAwsConfig: !!hasAwsConfig,
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.AWS_S3_BUCKET || "(not set)",
  });
}

// Validate environment variables immediately
validateEnv();
