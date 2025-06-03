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
    role: text("role").notNull(), // may not need .notnull()
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
  expiry: bigint("expiry", { mode: "number" }).notNull(),
  scope: text("scope").notNull(),
});

export const TheaterTable = pgTable("theater", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  approved: boolean("approved").default(false),
});

export const RoleTable = pgTable("role", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  approved: boolean("approved").default(false),
});

export const ActorTable = pgTable("actor", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  approved: boolean("approved").default(false),
});

export const MusicalTable = pgTable("musical", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  composer: varchar("composer", { length: 255 }).notNull(),
  lyricist: varchar("lyricist", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  approved: boolean("approved").default(false),
});

export const PerformanceTable = pgTable("performance", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  productionId: bigint("production_id", { mode: "number" })
    .notNull()
    .references(() => ProductionTable.id),
  date: date("date", { mode: "date" }).notNull(),
  theaterId: bigint("theater_id", { mode: "number" })
    .notNull()
    .references(() => TheaterTable.id),
});

export const CastingTable = pgTable(
  "casting",
  {
    roleId: bigint("role_id", { mode: "number" })
      .notNull()
      .references(() => RoleTable.id),
    actorId: bigint("actor_id", { mode: "number" })
      .notNull()
      .references(() => ActorTable.id),
    performanceId: bigint("performance_id", { mode: "number" })
      .notNull()
      .references(() => PerformanceTable.id),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.actorId, table.performanceId] }),
  ]
);

export const ProductionTable = pgTable("production", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  musicalId: bigint("musical_id", { mode: "number" })
    .notNull()
    .references(() => MusicalTable.id),
  startDate: date("start_date", { mode: "date" }).notNull(),
  endDate: date("end_date", { mode: "date" }).notNull(),
  posterUrl: text("poster_url").notNull(),
  approved: boolean("approved").default(false),
});
