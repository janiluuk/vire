/**
 * Calendly scheduling URLs for the public booking applet.
 * No secret keys — only an HTTPS event link is required (see docs/operations.md).
 */

export function normalizeCalendlySchedulingUrl(raw: string): string | null {
  let s = raw.trim();
  if (!s) return null;
  if (/^calendly\.com\//i.test(s) || /^www\.calendly\.com\//i.test(s)) {
    s = `https://${s}`;
  }
  let url: URL;
  try {
    url = new URL(s);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  if (host !== "calendly.com") return null;
  if (!url.pathname || url.pathname === "/") return null;
  url.hostname = "calendly.com";
  url.hash = "";
  return url.toString();
}
