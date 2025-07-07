// cache-handler.ts - TypeScript version
import { Redis } from "@upstash/redis";

interface CacheHandlerValue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  lastModified: number;
  tags: string[];
  expires?: number;
}

interface CacheHandlerContext {
  revalidate?: number;
  expire?: number;
  tags?: string[];
}

export default class NextjsUpstashCacheHandler {
  private redis: Redis;
  private keyPrefix: string;
  private defaultTtl: number;

  constructor(options: { keyPrefix?: string; defaultTtl?: number } = {}) {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    this.keyPrefix = options.keyPrefix || "nextjs-cache:";
    this.defaultTtl = options.defaultTtl || 31536000; // 1 year default
  }

  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get(
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ value: any; lastModified: number; tags: string[] } | null> {
    try {
      const cacheKey = this.getKey(key);
      const cached = await this.redis.get(cacheKey);

      if (!cached) return null;

      const parsed: CacheHandlerValue =
        typeof cached === "string"
          ? JSON.parse(cached)
          : (cached as CacheHandlerValue);

      // Check if cache has expired
      if (parsed.expires && Date.now() > parsed.expires) {
        await this.delete(key);
        return null;
      }

      return {
        value: parsed.value,
        lastModified: parsed.lastModified,
        tags: parsed.tags || [],
      };
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    ctx: CacheHandlerContext = {},
  ): Promise<boolean> {
    try {
      const cacheKey = this.getKey(key);
      const now = Date.now();

      // Calculate expiration time
      let expires: number | null = null;
      if (ctx.revalidate) {
        expires = now + ctx.revalidate * 1000;
      } else if (ctx.expire) {
        expires = ctx.expire;
      }

      const cacheValue: CacheHandlerValue = {
        value: data,
        lastModified: now,
        tags: ctx.tags || [],
        expires: expires || undefined,
      };

      // Set TTL based on revalidate time or use default
      const ttl = ctx.revalidate || this.defaultTtl;

      await this.redis.setex(cacheKey, ttl, JSON.stringify(cacheValue));

      // Store tag associations for cache invalidation
      if (ctx.tags && ctx.tags.length > 0) {
        const tagPromises = ctx.tags.map((tag) =>
          this.redis.sadd(`${this.keyPrefix}tag:${tag}`, key),
        );
        await Promise.all(tagPromises);
      }

      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  async revalidateTag(tag: string): Promise<boolean> {
    try {
      const tagKey = `${this.keyPrefix}tag:${tag}`;
      const keys = await this.redis.smembers(tagKey);

      if (keys.length > 0) {
        // Delete all keys associated with this tag
        const deletePromises = keys.map((key) => this.delete(key));
        await Promise.all(deletePromises);

        // Clean up the tag set
        await this.redis.del(tagKey);
      }

      return true;
    } catch (error) {
      console.error("Cache revalidateTag error:", error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const cacheKey = this.getKey(key);
      await this.redis.del(cacheKey);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }
}
