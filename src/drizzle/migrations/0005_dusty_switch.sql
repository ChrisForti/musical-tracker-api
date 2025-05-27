CREATE TABLE "performance" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"production_id" bigint NOT NULL,
	"date" date NOT NULL,
	"theater_id" bigint NOT NULL
);
