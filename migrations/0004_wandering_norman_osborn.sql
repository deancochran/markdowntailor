ALTER TABLE "user" ADD COLUMN "balance" numeric(10, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "credits";