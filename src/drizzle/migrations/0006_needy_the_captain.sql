ALTER TABLE "musical" RENAME COLUMN "name" TO "composer";--> statement-breakpoint
ALTER TABLE "musical" ADD COLUMN "lyricist" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "musical" ADD COLUMN "title" varchar(255) NOT NULL;