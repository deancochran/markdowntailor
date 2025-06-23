ALTER TABLE "user" ALTER COLUMN "model_preference" SET DEFAULT 'claude-sonnet-4-20250514';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "provider_preference" SET DEFAULT 'anthropic';--> statement-breakpoint
ALTER TABLE "resume" DROP COLUMN "content";