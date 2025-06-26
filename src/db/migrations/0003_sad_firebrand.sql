ALTER TABLE "user" ADD COLUMN "model_preference" text DEFAULT 'o3' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "provider_preference" text DEFAULT 'openai' NOT NULL;