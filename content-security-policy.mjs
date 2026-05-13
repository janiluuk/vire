/**
 * Single source of truth for CSP directive string (report-only + enforcing).
 * Imported by next.config.mjs and middleware.ts.
 *
 * @see docs/operations.md — staging with report-only; production enforcing via ENABLE_CSP_ENFORCE.
 */
export function getContentSecurityPolicyValue() {
  return [
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
}
