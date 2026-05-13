import { describe, expect, it } from "vitest";
import { getClientIpFromHeaders } from "@/lib/http/rate-limit";

describe("getClientIpFromHeaders", () => {
  it("reads x-forwarded-for first hop", () => {
    const h = new Headers();
    h.set("x-forwarded-for", "198.51.100.2, 10.0.0.1");
    expect(getClientIpFromHeaders(h)).toBe("198.51.100.2");
  });

  it("falls back to x-real-ip", () => {
    const h = new Headers();
    h.set("x-real-ip", "192.0.2.1");
    expect(getClientIpFromHeaders(h)).toBe("192.0.2.1");
  });

  it("skips empty leading hops in x-forwarded-for", () => {
    const h = new Headers();
    h.set("x-forwarded-for", " , , 198.51.100.9");
    expect(getClientIpFromHeaders(h)).toBe("198.51.100.9");
  });
});
