import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Validate Redis environment variables
if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  console.warn(
    "Missing Redis environment variables. Redis functionality may not work.",
  );
}

export const redis = Redis.fromEnv();

// Rate limiters using Redis
export const middlewareRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(15, "5 s"),
});

export const apiRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(15, "30 s"),
});
