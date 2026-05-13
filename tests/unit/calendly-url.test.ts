import { afterEach, describe, expect, it, vi } from "vitest";
import {
  normalizeCalendlySchedulingUrl,
  parseExplicitCalendlyEmbedDomain,
  resolveCalendlyEmbedDomainFromEnv,
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

  it("parseExplicitCalendlyEmbedDomain strips protocol and port", () => {
    expect(parseExplicitCalendlyEmbedDomain("https://x.example:443")).toBe(
      "x.example",
    );
  });

  it("resolveCalendlyEmbedDomainFromEnv uses hostname from NEXT_PUBLIC_SITE_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://sparkki.dudeisland.eu/fi/tuki");
    expect(resolveCalendlyEmbedDomainFromEnv()).toBe("sparkki.dudeisland.eu");
  });

  it("resolveCalendlyEmbedDomainFromEnv supports lab IP", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://192.168.2.100:1337");
    expect(resolveCalendlyEmbedDomainFromEnv()).toBe("192.168.2.100");
  });

  it("resolveCalendlyEmbedDomainFromEnv prefers explicit CALENDLY_EMBED_DOMAIN", () => {
    vi.stubEnv("NEXT_PUBLIC_CALENDLY_EMBED_DOMAIN", "https://custom.host:443");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ignored.example");
    expect(resolveCalendlyEmbedDomainFromEnv()).toBe("custom.host");
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
