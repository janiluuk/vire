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

/**
 * Parse **`NEXT_PUBLIC_CALENDLY_EMBED_DOMAIN`** (hostname only, no port).
 */
export function parseExplicitCalendlyEmbedDomain(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const noProto = t.replace(/^https?:\/\//i, "");
  const host = noProto.split("/")[0]?.trim();
  if (!host) return null;
  return host.replace(/:\d+$/, "") || null;
}

/**
 * Hostname from env only (build-time). Prefer **`window.location.hostname`** in the
 * booking widget client so **`embed_domain`** matches the site the user actually
 * opened — wrong **`NEXT_PUBLIC_SITE_URL`** at build time breaks Calendly embeds.
 */
export function resolveCalendlyEmbedDomainFromEnv(): string | null {
  const explicit = process.env.NEXT_PUBLIC_CALENDLY_EMBED_DOMAIN?.trim();
  if (explicit) return parseExplicitCalendlyEmbedDomain(explicit);
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!site) return null;
  try {
    return new URL(site).hostname || null;
  } catch {
    return null;
  }
}

/**
 * Adds query params Calendly’s inline widget expects on custom origins. Without
 * **`embed_domain`**, the widget often shows “This Calendly URL is not valid.”
 * Preserves existing query keys from **`NEXT_PUBLIC_CALENDLY_EMBED_URL`**.
 */
export function withCalendlyInlineEmbedContext(
  schedulingUrl: string,
  embedDomain: string | null,
): string {
  if (!embedDomain) return schedulingUrl;
  let url: URL;
  try {
    url = new URL(schedulingUrl);
  } catch {
    return schedulingUrl;
  }
  if (!url.searchParams.has("embed_type")) {
    url.searchParams.set("embed_type", "Inline");
  }
  if (!url.searchParams.has("embed_domain")) {
    url.searchParams.set("embed_domain", embedDomain);
  }
  return url.toString();
}
