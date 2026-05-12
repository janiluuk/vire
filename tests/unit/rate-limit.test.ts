import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/http/rate-limit";

describe("checkRateLimit (in-memory when Upstash unset)", () => {
  it("allows requests up to max within the window", async () => {
    const key = `rl-test-${Math.random()}`;
    expect(await checkRateLimit(key, { windowMs: 60_000, max: 3 })).toBe(true);
    expect(await checkRateLimit(key, { windowMs: 60_000, max: 3 })).toBe(true);
    expect(await checkRateLimit(key, { windowMs: 60_000, max: 3 })).toBe(true);
  });

  it("rejects when max is exceeded", async () => {
    const key = `rl-test-${Math.random()}`;
    expect(await checkRateLimit(key, { windowMs: 60_000, max: 2 })).toBe(true);
    expect(await checkRateLimit(key, { windowMs: 60_000, max: 2 })).toBe(true);
    expect(await checkRateLimit(key, { windowMs: 60_000, max: 2 })).toBe(false);
  });
});
