import { db } from "./build/drizzle/db.js";
import { MusicalTable } from "./build/drizzle/schema.js";
import { eq } from "drizzle-orm";

const musical = await db.query.MusicalTable.findFirst({
  where: eq(MusicalTable.id, "d540dc92-9039-4f9c-bd94-fb156ecc7c1d"),
});

console.log("Musical exists:", !!musical);
if (musical) {
  console.log("Musical title:", musical.title);
} else {
  console.log("Musical not found");
}

process.exit(0);
