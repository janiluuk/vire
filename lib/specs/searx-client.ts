/**
 * SearXNG search client. Tries JSON API first; falls back to HTML parsing when
 * the instance blocks `format=json` (common behind WAF — HTML still returns 200).
 */

export type SearxResult = { title?: string; url?: string; content?: string };

const SEARX_USER_AGENT =
  process.env.SPECS_SEARXNG_USER_AGENT?.trim() ||
  "Sparkki/1.0 (+https://sparkki.fi; laptop-spec-lookup)";

function stripHtmlTags(html: string): string {
  return html
    .replace(/<span class="highlight">/gi, "")
    .replace(/<\/span>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** @internal exported for unit tests */
export function parseSearxHtmlResults(html: string): SearxResult[] {
  const out: SearxResult[] = [];
  const articleRe =
    /<article class="result[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
  let m: RegExpExecArray | null;
  while ((m = articleRe.exec(html)) !== null) {
    const block = m[1]!;
    const urlM =
      block.match(/class="url_header"[^>]*href="([^"]+)"/i) ??
      block.match(/href="(https?:\/\/[^"]+)"[^>]*class="url_header"/i);
    const url = urlM?.[1]?.trim();
    if (!url || !/^https?:\/\//i.test(url)) continue;

    const titleM = block.match(/<h3>\s*<a[^>]*>([\s\S]*?)<\/a>\s*<\/h3>/i);
    const title = titleM ? stripHtmlTags(titleM[1]!) : "";

    const contentM = block.match(/<p class="content">\s*([\s\S]*?)\s*<\/p>/i);
    const content = contentM ? stripHtmlTags(contentM[1]!) : "";

    out.push({ title, url, content });
    if (out.length >= 12) break;
  }
  return out;
}

async function searxFetch(
  base: string,
  query: string,
  format: "json" | "html",
): Promise<{ ok: boolean; status: number; body: string }> {
  const u = new URL(`${base}/search`);
  u.searchParams.set("q", query);
  if (format === "json") {
    u.searchParams.set("format", "json");
  }
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 14_000);
  try {
    const res = await fetch(u.toString(), {
      headers: {
        Accept:
          format === "json"
            ? "application/json"
            : "text/html,application/xhtml+xml",
        "User-Agent": SEARX_USER_AGENT,
      },
      signal: ac.signal,
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body };
  } catch {
    return { ok: false, status: 0, body: "" };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Search SearXNG for laptop spec pages. Uses JSON when allowed; otherwise HTML scrape.
 */
export async function searxSearch(
  base: string,
  query: string,
): Promise<SearxResult[]> {
  const jsonRes = await searxFetch(base, query, "json");
  if (jsonRes.ok && jsonRes.status === 200) {
    try {
      const data = JSON.parse(jsonRes.body) as { results?: SearxResult[] };
      if (Array.isArray(data.results) && data.results.length > 0) {
        return data.results.slice(0, 12);
      }
    } catch {
      /* fall through to HTML */
    }
  }

  const htmlRes = await searxFetch(base, query, "html");
  if (!htmlRes.ok || htmlRes.status !== 200) return [];
  return parseSearxHtmlResults(htmlRes.body);
}
