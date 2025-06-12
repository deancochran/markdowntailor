import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const middlewareRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export const apiRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(5, "5 s"),
});
