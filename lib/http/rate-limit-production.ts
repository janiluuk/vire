import { getClientIpFromHeaders } from "@/lib/http/rate-limit";

let warnedInMemory = false;

function usesDistributedRateLimit(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

/** Log once per process when production runs without Upstash (rate limits are per-instance only). */
export function warnInMemoryRateLimitInProduction(): void {
  if (process.env.NODE_ENV !== "production") return;
  if (usesDistributedRateLimit()) return;
  if (warnedInMemory) return;
  warnedInMemory = true;
  console.warn(
    JSON.stringify({
      level: "warn",
      msg: "rate_limit_in_memory",
      hint: "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for distributed limits in production",
    }),
  );
}

/** Returns 503 JSON response when production requires Upstash but it is missing (optional strict mode). */
export function rateLimitUnavailableResponse(
  reqHeaders: Headers,
): Response | null {
  if (process.env.NODE_ENV !== "production") return null;
  if (usesDistributedRateLimit()) return null;
  if (process.env.REQUIRE_UPSTASH_RATE_LIMIT !== "true") {
    warnInMemoryRateLimitInProduction();
    return null;
  }
  const ip = getClientIpFromHeaders(reqHeaders);
  console.error(
    JSON.stringify({
      level: "error",
      msg: "rate_limit_upstash_required",
      ip,
    }),
  );
  return Response.json(
    { error: "service_unavailable", message: "Rate limiting not configured" },
    { status: 503 },
  );
}
