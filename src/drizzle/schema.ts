import { sql, type SQL } from "drizzle-orm";
import { pgEnum, primaryKey } from "drizzle-orm/pg-core";
import {
  boolean,
  uuid,
  pgTable,
  bigint,
  text,
  uniqueIndex,
  varchar,
  type AnyPgColumn,
  date,
} from "drizzle-orm/pg-core";

export const accountTypeEnum = pgEnum("account_type", ["admin", "user"]);

export const UserTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    initialSetupComplete: boolean("initial_setup_complete")
      .default(false)
      .notNull(),
    isAdmin: boolean("is_admin").default(false).notNull(),
    passwordHash: text("password_hash").notNull(),
    account_type: accountTypeEnum().default("user").notNull(),
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
  userId: uuid("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  expiry: bigint("expiry", { mode: "number" }).notNull(),
  scope: text("scope").notNull(),
});

export const TheaterTable = pgTable("theater", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  approved: boolean("approved").default(false).notNull(),
});

export const RoleTable = pgTable("role", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  approved: boolean("approved").default(false).notNull(),
});

export const ActorTable = pgTable("actor", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  approved: boolean("approved").default(false).notNull(),
});

export const MusicalTable = pgTable("musical", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  composer: varchar("composer", { length: 255 }).notNull(),
  lyricist: varchar("lyricist", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  approved: boolean("approved").default(false).notNull(),
});

export const PerformanceTable = pgTable("performance", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  productionId: uuid("production_id")
    .defaultRandom()
    .notNull()
    .references(() => ProductionTable.id),
  date: date("date", { mode: "date" }).notNull(),
  theaterId: uuid("theater_id")
    .defaultRandom()
    .notNull()
    .references(() => TheaterTable.id),
});

export const CastingTable = pgTable(
  "casting",
  {
    roleId: uuid("role_id")
      .defaultRandom()
      .notNull()
      .references(() => RoleTable.id),
    actorId: uuid("actor_id")
      .defaultRandom()
      .notNull()
      .references(() => ActorTable.id),
    performanceId: uuid("performance_id")
      .defaultRandom()
      .notNull()
      .references(() => PerformanceTable.id),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.actorId, table.performanceId] }),
  ]
);

export const ProductionTable = pgTable("production", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  musicalId: uuid("musical_id")
    .notNull()
    .references(() => MusicalTable.id),
  startDate: date("start_date", { mode: "date" }).notNull(),
  endDate: date("end_date", { mode: "date" }).notNull(),
  posterUrl: text("poster_url").notNull(),
  approved: boolean("approved").default(false).notNull(),
});
