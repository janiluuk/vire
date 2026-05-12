/**
 * Canonical site origin for sitemap, robots, and metadataBase.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://vire.fi).
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const vercel = process.env.VERCEL_URL?.replace(/^https?:\/\//, "");
  if (vercel) return `https://${vercel}`;
  return "http://localhost:1337";
}
