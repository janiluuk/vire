/**
 * Single source of truth for CSP directive string (report-only + enforcing).
 * Imported by next.config.mjs.
 *
 * When `CSP_REPORT_BASE_URL` or `NEXT_PUBLIC_SITE_URL` is a valid http(s) origin,
 * appends `report-uri` so browsers can POST violation reports to `/api/csp-report`.
 *
 * @see docs/operations.md — CSP rollout, report-only, enforcing, reporting.
 */

function cspReportUriSuffix() {
  const raw =
    process.env.CSP_REPORT_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "";
  try {
    const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(href);
    const origin = `${u.protocol}//${u.host}`;
    return ` report-uri ${origin}/api/csp-report`;
  } catch {
    return "";
  }
}

export function getContentSecurityPolicyValue() {
  const core = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.network",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://api.stripe.com https://r.stripe.com https://m.stripe.network https://*.stripe.com https://www.youtube.com https://i.ytimg.com https://plausible.io https://discord.com https://discordapp.com https://*.discordapp.com https://calendly.com https://*.calendly.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://www.youtube-nocookie.com https://calendly.com https://*.calendly.com https://discord.com https://discordapp.com https://widgetsent.io",
    "worker-src 'self' blob:",
    "form-action 'self' https://checkout.stripe.com",
  ].join("; ");
  return `${core}${cspReportUriSuffix()}`;
}
