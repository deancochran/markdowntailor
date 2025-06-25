ALTER TABLE "user" ALTER COLUMN "name" SET DEFAULT 'ResumeBuilder';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "model_preference" SET DEFAULT 'o4-mini';