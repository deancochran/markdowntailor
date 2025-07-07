import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  NEXT_RUNTIME: z.enum(["edge", "nodejs"]).default("edge"),
  NEXT_PUBLIC_BASE_URL: z.string().url("Invalid base URL"),
  DATABASE_URL: z.string().url("Invalid database URL"),
  AUTH_DRIZZLE_URL: z.string().url("Invalid database URL"),
  AUTH_SECRET: z.string().min(32, "Auth secret must be at least 32 characters"),
  AUTH_TRUST_HOST: z.string().nullable(),
  AUTH_URL: z.string().url("Invalid auth URL"),
  AUTH_CREDENTIALS_ENABLED: z.string().nullable(),
  RATE_LIMITING_DISABLED: z.string().nullable(),
  DATABASE_SSL_DISABLED: z.string().nullable(),
  AUTH_GITHUB_ID: z.string().url("GitHub id required"),
  AUTH_GITHUB_SECRET: z.string().min(1, "GitHub key required"),
  AUTH_LINKEDIN_ID: z.string().min(1, "LinkedIn id required"),
  AUTH_LINKEDIN_SECRET: z.string().min(1, "LinkedIn key required"),
  AUTH_GOOGLE_ID: z.string().min(1, "Google id required"),
  AUTH_GOOGLE_SECRET: z.string().min(1, "Google key required"),
  ANTHROPIC_API_KEY: z.string().min(1, "Anthropic API key required"),
  UPSTASH_REDIS_REST_URL: z.string().url("Invalid Upstash Redis REST URL"),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1, "Upstash Redis REST token required"),
  STRIPE_SECRET_KEY: z.string().min(1, "Stripe secret key required"),
  STRIPE_PUBLIC_KEY: z.string().min(1, "Stripe public key required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "Stripe webhook secret required"),
  STRIPE_ALPHA_PRICE_ID: z.string().min(1, "Stripe ALPHA version required"),
  ALPHA_ACCESS_CUTOFF_DATE: z
    .string()
    .min(1, "Alpha access cutoff date required"),
});

export const env = envSchema.parse(process.env);
