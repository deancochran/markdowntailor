ALTER TABLE "user"
ALTER COLUMN "credits"
SET
    DATA TYPE numeric(19, 4);

--> statement-breakpoint
ALTER TABLE "user"
ALTER COLUMN "credits"
SET DEFAULT '0.00';

--> statement-breakpoint
ALTER TABLE "ai_request_log"
ADD COLUMN "credits" numeric(19, 4) DEFAULT '0.0000' NOT NULL;

--> statement-breakpoint
ALTER TABLE "user"
ADD COLUMN "alpha_credits_redeemed" boolean DEFAULT false NOT NULL;

--> statement-breakpoint
ALTER TABLE "ai_request_log"
DROP COLUMN "cost_estimate";
