ALTER TABLE "casting" ADD COLUMN "performance_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "musical" ADD COLUMN "poster_url" varchar(255);--> statement-breakpoint
ALTER TABLE "performance" ADD COLUMN "date" date;--> statement-breakpoint
ALTER TABLE "casting" ADD CONSTRAINT "casting_performance_id_performance_id_fk" FOREIGN KEY ("performance_id") REFERENCES "public"."performance"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casting" DROP COLUMN "verified";