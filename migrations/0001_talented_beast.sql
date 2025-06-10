ALTER TABLE "ai_request_log" DROP CONSTRAINT "ai_request_log_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "ai_request_log" ADD COLUMN "stripe_account_id" text;--> statement-breakpoint
ALTER TABLE "ai_request_log" ADD CONSTRAINT "ai_request_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;