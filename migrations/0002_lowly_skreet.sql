ALTER TABLE "resume" ALTER COLUMN "markdown" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "resume" ALTER COLUMN "css" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "resume" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "resume_versions" ALTER COLUMN "markdown" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "resume_versions" ALTER COLUMN "css" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "resume_versions" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "resume_versions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;