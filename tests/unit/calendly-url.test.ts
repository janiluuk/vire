import { afterEach, describe, expect, it, vi } from "vitest";
import {
  normalizeCalendlySchedulingUrl,
  resolveCalendlyEmbedDomain,
  withCalendlyInlineEmbedContext,
} from "@/lib/site/calendly-url";

describe("calendly-url", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("normalizes bare calendly.com paths", () => {
    expect(normalizeCalendlySchedulingUrl("calendly.com/u/ev")).toBe(
      "https://calendly.com/u/ev",
    );
  });

  it("rejects non-calendly hosts", () => {
    expect(
      normalizeCalendlySchedulingUrl("https://evil.com/calendly.com/x"),
    ).toBeNull();
  });

  it("resolveCalendlyEmbedDomain uses hostname from NEXT_PUBLIC_SITE_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://sparkki.dudeisland.eu/fi/tuki");
    expect(resolveCalendlyEmbedDomain()).toBe("sparkki.dudeisland.eu");
  });

  it("resolveCalendlyEmbedDomain supports lab IP", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://192.168.2.100:1337");
    expect(resolveCalendlyEmbedDomain()).toBe("192.168.2.100");
  });

  it("resolveCalendlyEmbedDomain prefers explicit CALENDLY_EMBED_DOMAIN and strips port", () => {
    vi.stubEnv("NEXT_PUBLIC_CALENDLY_EMBED_DOMAIN", "https://custom.host:443");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ignored.example");
    expect(resolveCalendlyEmbedDomain()).toBe("custom.host");
  });

  it("withCalendlyInlineEmbedContext adds embed_type and embed_domain", () => {
    const out = withCalendlyInlineEmbedContext(
      "https://calendly.com/janiluuk/30min",
      "sparkki.dudeisland.eu",
    );
    const u = new URL(out);
    expect(u.searchParams.get("embed_type")).toBe("Inline");
    expect(u.searchParams.get("embed_domain")).toBe("sparkki.dudeisland.eu");
  });

  it("withCalendlyInlineEmbedContext preserves existing params and does not override embed_domain", () => {
    const out = withCalendlyInlineEmbedContext(
      "https://calendly.com/x/y?embed_domain=already.set&foo=1",
      "ignored.example",
    );
    expect(out).toContain("embed_domain=already.set");
    expect(out).toContain("foo=1");
  });

  it("withCalendlyInlineEmbedContext returns input when embed domain missing", () => {
    const base = "https://calendly.com/a/b";
    expect(withCalendlyInlineEmbedContext(base, null)).toBe(base);
  });
});
