import { afterEach, describe, expect, it, vi } from "vitest";

describe("content-security-policy.mjs", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("omits report-uri when no site URL is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("CSP_REPORT_BASE_URL", "");
    const { getContentSecurityPolicyValue } = await import(
      "../../content-security-policy.mjs"
    );
    expect(getContentSecurityPolicyValue()).not.toContain("report-uri");
  });

  it("appends report-uri from NEXT_PUBLIC_SITE_URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://sparkki.example.com");
    const { getContentSecurityPolicyValue } = await import(
      "../../content-security-policy.mjs"
    );
    expect(getContentSecurityPolicyValue()).toContain(
      "report-uri https://sparkki.example.com/api/csp-report",
    );
  });

  it("prefers CSP_REPORT_BASE_URL over NEXT_PUBLIC_SITE_URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ignored.example");
    vi.stubEnv("CSP_REPORT_BASE_URL", "http://localhost:1337");
    const { getContentSecurityPolicyValue } = await import(
      "../../content-security-policy.mjs"
    );
    expect(getContentSecurityPolicyValue()).toContain(
      "report-uri http://localhost:1337/api/csp-report",
    );
  });
});
