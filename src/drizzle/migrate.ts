import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { connectionString } from "../environment.js";

const migrationClient = new Client(connectionString);

async function main() {
  await migrationClient.connect();
  await migrate(drizzle(migrationClient), {
    migrationsFolder: "./src/drizzle/migrations",
  });
  await migrationClient.end();
}

main().then(() => {
  console.log("Migration complete");
});
