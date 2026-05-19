const FETCH_MS = 4_000;
const MAX_HTML_BYTES = 256_000;

function extractOgImage(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return null;
}

function resolveAbsoluteUrl(base: string, maybeRelative: string): string | null {
  try {
    return new URL(maybeRelative, base).href;
  } catch {
    return null;
  }
}

/** Best-effort product/listing image from a spec page URL (og:image / twitter:image). */
export async function fetchOgImageUrl(pageUrl: string): Promise<string | null> {
  const trimmed = pageUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const res = await fetch(trimmed, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "SparkkiSpecBot/1.0 (+https://sparkki.fi)",
      },
    });
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, MAX_HTML_BYTES);
    const raw = extractOgImage(html);
    if (!raw) return null;
    return resolveAbsoluteUrl(trimmed, raw);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
