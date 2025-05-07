import express from "express";
import { db } from "./drizzle/db.js";
import { sql } from "drizzle-orm";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});

app.listen(3000, async (err) => {
  if (err) {
    console.error(err);
  }

  const time = await db.execute(sql`SELECT NOW()`);
  const dbTimeStamp = time.rows[0]!.now ?? "";
  console.log("from database", dbTimeStamp);
  console.log("server starting on port 3000");
});
