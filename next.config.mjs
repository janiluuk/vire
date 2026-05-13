import createNextIntlPlugin from "next-intl/plugin";
import { getContentSecurityPolicyValue } from "./content-security-policy.mjs";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * Staging CSP (report-only). Same directives as enforcing mode; see content-security-policy.mjs.
 * Set ENABLE_CSP_REPORT_ONLY=true to emit Content-Security-Policy-Report-Only.
 * Set ENABLE_CSP_ENFORCE=true to emit enforcing Content-Security-Policy.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  /** DESIGN_SYSTEM.md — public URLs `/meista` match Vire IA while pages stay under existing segments */
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:locale/meista/yhteiso",
          destination: "/:locale/yhteiso",
        },
        { source: "/:locale/meista", destination: "/:locale/about" },
      ],
    };
  },
  async redirects() {
    return [
      {
        source: "/admin/ai-tools",
        destination: "/admin/ai-testing",
        permanent: false,
      },
    ];
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
    ];
    if (process.env.ENABLE_HSTS === "true") {
      security.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }
    if (process.env.ENABLE_CSP_REPORT_ONLY === "true") {
      security.push({
        key: "Content-Security-Policy-Report-Only",
        value: getContentSecurityPolicyValue(),
      });
    }
    if (process.env.ENABLE_CSP_ENFORCE === "true") {
      security.push({
        key: "Content-Security-Policy",
        value: getContentSecurityPolicyValue(),
      });
    }
    return [
      {
        source: "/:path*",
        headers: security,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
