import { sql, type SQL } from "drizzle-orm";
import {
  bigserial,
  boolean,
  pgTable,
  text,
  uniqueIndex,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const UserTable = pgTable(
  "users",
  {
    id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    initialSetupComplete: boolean("initial_setup_complete")
      .default(false)
      .notNull(),
    isAdmin: boolean("is_admin").default(false).notNull(),
    passwordHash: text("password_hash").notNull(),
  },
  (table) => {
    return [uniqueIndex("emailUniqueIndex").on(lower(table.email))];
  }
);

export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}
