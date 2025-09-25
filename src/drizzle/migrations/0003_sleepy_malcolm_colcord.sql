ALTER TABLE "musical"
    DROP COLUMN "poster_url";

--> statement-breakpoint
ALTER TABLE "performance"
    DROP COLUMN "poster_url";

--> statement-breakpoint
ALTER TABLE "musical"
    ADD COLUMN "poster_id" uuid;

--> statement-breakpoint
ALTER TABLE "performance"
    ADD COLUMN "poster_id" uuid;

--> statement-breakpoint
ALTER TABLE "musical"
    ADD CONSTRAINT "musical_poster_id_uploaded_images_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."uploaded_images"("id") ON DELETE NO action ON UPDATE NO action;

--> statement-breakpoint
ALTER TABLE "performance"
    ADD CONSTRAINT "performance_poster_id_uploaded_images_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."uploaded_images"("id") ON DELETE NO action ON UPDATE NO action;

--> statement-breakpoint
ALTER TABLE "uploaded_images"
    DROP COLUMN "entity_type";

--> statement-breakpoint
ALTER TABLE "uploaded_images"
    DROP COLUMN "entity_id";

