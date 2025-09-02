ALTER TABLE "production" RENAME COLUMN "approved" TO "verified";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "account_type" TO "role";--> statement-breakpoint
ALTER TABLE "casting" DROP CONSTRAINT "casting_performance_id_performance_id_fk";
--> statement-breakpoint
ALTER TABLE "casting" DROP CONSTRAINT "casting_role_id_actor_id_performance_id_pk";--> statement-breakpoint
ALTER TABLE "casting" ALTER COLUMN "role_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "casting" ALTER COLUMN "actor_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "musical_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "casting" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "casting" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_musical_id_musical_id_fk" FOREIGN KEY ("musical_id") REFERENCES "public"."musical"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casting" DROP COLUMN "performance_id";