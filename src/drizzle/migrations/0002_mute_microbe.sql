CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "role" TO "account_type";--> statement-breakpoint
ALTER TABLE "actor" ALTER COLUMN "approved" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "musical" ALTER COLUMN "approved" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "production" ALTER COLUMN "approved" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "approved" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "theater" ALTER COLUMN "approved" SET NOT NULL;