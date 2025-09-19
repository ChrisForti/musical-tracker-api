ALTER TABLE "musical" RENAME COLUMN "poster_url" TO "poster_id";--> statement-breakpoint
ALTER TABLE "performance" RENAME COLUMN "poster_url" TO "poster_id";--> statement-breakpoint
ALTER TABLE "musical" ADD CONSTRAINT "musical_poster_id_uploaded_images_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."uploaded_images"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance" ADD CONSTRAINT "performance_poster_id_uploaded_images_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."uploaded_images"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploaded_images" DROP COLUMN "entity_type";--> statement-breakpoint
ALTER TABLE "uploaded_images" DROP COLUMN "entity_id";