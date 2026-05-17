import { describe, expect, it } from "vitest";
import { normalizeSpecsCacheKey } from "@/lib/specs/laptop-specs-cache";

describe("normalizeSpecsCacheKey", () => {
  it("normalizes whitespace and case", () => {
    const a = normalizeSpecsCacheKey("  Lenovo ", " ThinkPad  T450 ");
    const b = normalizeSpecsCacheKey("lenovo", "thinkpad t450");
    expect(a.makeNorm).toBe(b.makeNorm);
    expect(a.modelNorm).toBe(b.modelNorm);
    expect(a.makeDisplay).toBe("Lenovo");
    expect(a.modelDisplay).toBe("ThinkPad  T450");
  });
});
