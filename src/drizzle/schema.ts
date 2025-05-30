import { table } from "console";
import { sql, type SQL } from "drizzle-orm";
import { primaryKey } from "drizzle-orm/pg-core";
import {
  bigserial,
  boolean,
  pgTable,
  bigint,
  text,
  uniqueIndex,
  varchar,
  type AnyPgColumn,
  date,
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

export const TokenTable = pgTable("tokens", {
  hash: text("hash").primaryKey(),
  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  expiry: bigint({ mode: "number" }).notNull(),
  scope: text("scope").notNull(),
});

export const TheaterTable = pgTable("theater", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const RoleTable = pgTable("role", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const ActorTable = pgTable("actor", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const MusicalTable = pgTable("musical", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  composer: varchar("composer", { length: 255 }).notNull(),
  lyricist: varchar("lyricist", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
});

export const PerformanceTable = pgTable("performance", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  productionId: bigint("production_id", { mode: "number" }).notNull(),
  date: date({ mode: "date" }).notNull(),
  theaterId: bigint("theater_id", { mode: "number" }).notNull(),
});

export const CastingTable = pgTable(
  "casting",
  {
    roleId: bigint("role_id", { mode: "number" }).notNull(),
    actorId: bigint("actor_id", { mode: "number" }).notNull(),
    performanceId: bigint("performance_id", { mode: "number" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.actorId, table.performanceId] }),
  ]
);
