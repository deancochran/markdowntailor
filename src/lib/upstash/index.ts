import { env } from "@/env";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});
// Rate limiters using Redis
export const middlewareRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(15, "5 s"),
});

export const apiRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(15, "30 s"),
});
