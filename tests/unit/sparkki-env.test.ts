import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveForGoodNotifyEmail } from "@/lib/site/sparkki-env";

describe("sparkki-env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers SPARKKI_FOR_GOOD_NOTIFY_EMAIL over VIRE_", () => {
    vi.stubEnv("SPARKKI_FOR_GOOD_NOTIFY_EMAIL", " sparkki@example.com ");
    vi.stubEnv("VIRE_FOR_GOOD_NOTIFY_EMAIL", "vire@example.com");
    expect(resolveForGoodNotifyEmail()).toBe("sparkki@example.com");
  });

  it("falls back to VIRE_FOR_GOOD_NOTIFY_EMAIL", () => {
    vi.stubEnv("VIRE_FOR_GOOD_NOTIFY_EMAIL", "legacy@example.com");
    expect(resolveForGoodNotifyEmail()).toBe("legacy@example.com");
  });

  it("returns undefined when unset", () => {
    expect(resolveForGoodNotifyEmail()).toBeUndefined();
  });
});
