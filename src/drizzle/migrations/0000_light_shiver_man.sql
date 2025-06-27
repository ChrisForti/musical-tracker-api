--> statement-breakpoint
CREATE TABLE "actor"(
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(255) NOT NULL,
    "approved" boolean DEFAULT FALSE NOT NULL
);

--> statement-breakpoint
CREATE TABLE "casting"(
    "role_id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "actor_id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "performance_id" uuid DEFAULT gen_random_uuid() NOT NULL,
    CONSTRAINT "casting_role_id_actor_id_performance_id_pk" PRIMARY KEY ("role_id", "actor_id", "performance_id")
);

--> statement-breakpoint
CREATE TABLE "musical"(
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "composer" varchar(255) NOT NULL,
    "lyricist" varchar(255) NOT NULL,
    "title" varchar(255) NOT NULL,
    "approved" boolean DEFAULT FALSE NOT NULL
);

--> statement-breakpoint
CREATE TABLE "performance"(
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "production_id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "date" date NOT NULL,
    "theater_id" uuid DEFAULT gen_random_uuid() NOT NULL
);

--> statement-breakpoint
CREATE TABLE "production"(
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "musical_id" uuid NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date NOT NULL,
    "poster_url" text NOT NULL,
    "approved" boolean DEFAULT FALSE NOT NULL
);

--> statement-breakpoint
CREATE TABLE "role"(
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(255) NOT NULL,
    "approved" boolean DEFAULT FALSE NOT NULL
);

--> statement-breakpoint
CREATE TABLE "theater"(
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(255) NOT NULL,
    "approved" boolean DEFAULT FALSE NOT NULL
);

--> statement-breakpoint
CREATE TABLE "tokens"(
    "hash" text PRIMARY KEY NOT NULL,
    "user_id" uuid NOT NULL,
    "expiry" bigint NOT NULL,
    "scope" text NOT NULL
);

CREATE TYPE "public"."account_type" AS ENUM(
    'admin',
    'user'
);

--> statement-breakpoint
CREATE TABLE "users"(
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "first_name" varchar(100) NOT NULL,
    "last_name" varchar(100) NOT NULL,
    "email" text NOT NULL,
    "email_verified" boolean DEFAULT FALSE NOT NULL,
    "initial_setup_complete" boolean DEFAULT FALSE NOT NULL,
    "is_admin" boolean DEFAULT FALSE NOT NULL,
    "password_hash" text NOT NULL,
    "account_type" "account_type" DEFAULT 'user' NOT NULL
);

--> statement-breakpoint
ALTER TABLE "casting"
    ADD CONSTRAINT "casting_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE NO action ON UPDATE NO action;

--> statement-breakpoint
ALTER TABLE "casting"
    ADD CONSTRAINT "casting_actor_id_actor_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actor"("id") ON DELETE NO action ON UPDATE NO action;

--> statement-breakpoint
ALTER TABLE "casting"
    ADD CONSTRAINT "casting_performance_id_performance_id_fk" FOREIGN KEY ("performance_id") REFERENCES "public"."performance"("id") ON DELETE NO action ON UPDATE NO action;

--> statement-breakpoint
ALTER TABLE "performance"
    ADD CONSTRAINT "performance_production_id_production_id_fk" FOREIGN KEY ("production_id") REFERENCES "public"."production"("id") ON DELETE NO action ON UPDATE NO action;

--> statement-breakpoint
ALTER TABLE "performance"
    ADD CONSTRAINT "performance_theater_id_theater_id_fk" FOREIGN KEY ("theater_id") REFERENCES "public"."theater"("id") ON DELETE NO action ON UPDATE NO action;

--> statement-breakpoint
ALTER TABLE "production"
    ADD CONSTRAINT "production_musical_id_musical_id_fk" FOREIGN KEY ("musical_id") REFERENCES "public"."musical"("id") ON DELETE NO action ON UPDATE NO action;

--> statement-breakpoint
ALTER TABLE "tokens"
    ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO action;

--> statement-breakpoint
CREATE UNIQUE INDEX "emailUniqueIndex" ON "users" USING btree(lower("email"));

