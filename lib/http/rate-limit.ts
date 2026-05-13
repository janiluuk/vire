import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hitBuckets = new Map<string, number[]>();

let redisSingleton: Redis | null | undefined;
const limiterCache = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  if (redisSingleton !== undefined) return redisSingleton;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    redisSingleton = null;
    return null;
  }
  redisSingleton = new Redis({ url, token });
  return redisSingleton;
}

function getLimiter(max: number, windowMs: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const cacheKey = `${max}:${windowSec}`;
  let lim = limiterCache.get(cacheKey);
  if (!lim) {
    lim = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${windowSec} s`),
      prefix: `@vire/rl/${cacheKey}`,
    });
    limiterCache.set(cacheKey, lim);
  }
  return lim;
}

/** Use in Route Handlers where `Request` is available (also works in Vitest without Next request store). */
export function getClientIpFromHeaders(h: Headers): string {
  const xf = h.get("x-forwarded-for");
  if (xf) {
    for (const part of xf.split(",")) {
      const ip = part.trim();
      if (ip.length > 0) return ip;
    }
  }
  const real = h.get("x-real-ip")?.trim();
  if (real && real.length > 0) return real;
  return "unknown";
}

/** Prefer `getClientIpFromHeaders(req.headers)` in `app/api/**` routes. */
export function getClientIp(): string {
  return getClientIpFromHeaders(headers());
}

function checkRateLimitMemory(
  bucketKey: string,
  options: { windowMs: number; max: number },
): boolean {
  const { windowMs, max } = options;
  const now = Date.now();
  const bucket = (hitBuckets.get(bucketKey) ?? []).filter(
    (t) => t > now - windowMs,
  );
  if (bucket.length >= max) return false;
  bucket.push(now);
  hitBuckets.set(bucketKey, bucket);
  return true;
}

/**
 * Returns true if the request is allowed. Uses Upstash when
 * `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set; otherwise in-memory (single process).
 */
export async function checkRateLimit(
  bucketKey: string,
  options: { windowMs: number; max: number },
): Promise<boolean> {
  const limiter = getLimiter(options.max, options.windowMs);
  if (!limiter) {
    return checkRateLimitMemory(bucketKey, options);
  }
  const { success } = await limiter.limit(bucketKey);
  return success;
}
