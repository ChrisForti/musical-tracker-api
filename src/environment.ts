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
  const requiredVars = {
    DATABASE_URL: connectionString,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  };

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env file and ensure all required variables are set."
    );
  }

  console.log("Environment validation successful:", {
    port: PORT,
    hasDbConnection: !!connectionString,
    hasAwsConfig: true,
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.AWS_S3_BUCKET,
  });
}

// Validate environment variables immediately
validateEnv();
