ALTER TABLE "casting" DROP CONSTRAINT "casting_performance_id_production_id_fk";
--> statement-breakpoint
ALTER TABLE "actor" ADD COLUMN "approved" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "musical" ADD COLUMN "approved" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "production" ADD COLUMN "approved" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "approved" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "theater" ADD COLUMN "approved" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text NOT NULL;--> statement-breakpoint
ALTER TABLE "casting" ADD CONSTRAINT "casting_performance_id_performance_id_fk" FOREIGN KEY ("performance_id") REFERENCES "public"."performance"("id") ON DELETE no action ON UPDATE no action;