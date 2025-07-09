ALTER TABLE "resume" ALTER COLUMN "markdown" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "resume" ALTER COLUMN "css" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "resume_versions" ALTER COLUMN "markdown" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "resume_versions" ALTER COLUMN "css" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "resume" ADD COLUMN "styles" text DEFAULT '{"fontFamily":"Inter","fontSize":11,"lineHeight":1.4,"marginH":20,"marginV":20}' NOT NULL;--> statement-breakpoint
ALTER TABLE "resume_versions" ADD COLUMN "styles" text DEFAULT '{"fontFamily":"Inter","fontSize":11,"lineHeight":1.4,"marginH":20,"marginV":20}' NOT NULL;