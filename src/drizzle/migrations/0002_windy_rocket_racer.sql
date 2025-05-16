CREATE TABLE "role" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theater" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
DROP TABLE "theaters" CASCADE;