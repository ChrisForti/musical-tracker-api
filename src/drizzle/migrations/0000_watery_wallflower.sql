CREATE TYPE "public"."account_type" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "actor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"verified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "casting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"verified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "musical" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"composer" varchar(255) NOT NULL,
	"lyricist" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"verified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"musical_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"notes" text,
	"poster_url" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "production" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"musical_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"poster_url" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"musical_id" uuid NOT NULL,
	"verified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theater" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"city" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"hash" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expiry" bigint NOT NULL,
	"scope" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"initial_setup_complete" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"role" "account_type" DEFAULT 'user' NOT NULL,
	"password_hash" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "casting" ADD CONSTRAINT "casting_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casting" ADD CONSTRAINT "casting_actor_id_actor_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance" ADD CONSTRAINT "performance_musical_id_musical_id_fk" FOREIGN KEY ("musical_id") REFERENCES "public"."musical"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance" ADD CONSTRAINT "performance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production" ADD CONSTRAINT "production_musical_id_musical_id_fk" FOREIGN KEY ("musical_id") REFERENCES "public"."musical"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_musical_id_musical_id_fk" FOREIGN KEY ("musical_id") REFERENCES "public"."musical"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "emailUniqueIndex" ON "users" USING btree (lower("email"));