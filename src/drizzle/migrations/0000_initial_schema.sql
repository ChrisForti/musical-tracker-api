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
	"performance_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "musical" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"composer" varchar(255) NOT NULL,
	"lyricist" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"poster_id" uuid,
	"verified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"musical_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"theater_id" uuid,
	"date" date,
	"notes" text,
	"poster_id" uuid
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
CREATE TABLE "uploaded_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_filename" varchar(255) NOT NULL,
	"s3_key" varchar(500) NOT NULL,
	"s3_url" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"width" integer,
	"height" integer,
	"uploaded_by" uuid NOT NULL,
	"image_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
ALTER TABLE "casting" ADD CONSTRAINT "casting_performance_id_performance_id_fk" FOREIGN KEY ("performance_id") REFERENCES "public"."performance"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "musical" ADD CONSTRAINT "musical_poster_id_uploaded_images_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."uploaded_images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance" ADD CONSTRAINT "performance_musical_id_musical_id_fk" FOREIGN KEY ("musical_id") REFERENCES "public"."musical"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance" ADD CONSTRAINT "performance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance" ADD CONSTRAINT "performance_theater_id_theater_id_fk" FOREIGN KEY ("theater_id") REFERENCES "public"."theater"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance" ADD CONSTRAINT "performance_poster_id_uploaded_images_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."uploaded_images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production" ADD CONSTRAINT "production_musical_id_musical_id_fk" FOREIGN KEY ("musical_id") REFERENCES "public"."musical"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_musical_id_musical_id_fk" FOREIGN KEY ("musical_id") REFERENCES "public"."musical"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploaded_images" ADD CONSTRAINT "uploaded_images_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "emailUniqueIndex" ON "users" USING btree (lower("email"));