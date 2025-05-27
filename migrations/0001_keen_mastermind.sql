CREATE TABLE "resume_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"resume_id" text NOT NULL,
	"version" integer NOT NULL,
	"title" text NOT NULL,
	"markdown" text DEFAULT '',
	"css" text DEFAULT '',
	"content" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resume" ALTER COLUMN "markdown" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "resume" ALTER COLUMN "markdown" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "resume" ALTER COLUMN "css" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "resume" ALTER COLUMN "css" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "authenticator" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "authenticator" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "resume" ADD COLUMN "content" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "resume" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "resume" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "verificationToken" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "verificationToken" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_resume_id_resume_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resume"("id") ON DELETE cascade ON UPDATE no action;