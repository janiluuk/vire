/**
 * Server-only: SearXNG JSON + optional local LLM to summarize laptop specs.
 * Configure via SPECS_* env vars (see .env.example).
 */

export type LaptopSpecsInsight = {
  summary: string | null;
  specUrl: string | null;
};

type SearxResult = { title?: string; url?: string; content?: string };

const cache = new Map<string, { exp: number; value: LaptopSpecsInsight }>();
const CACHE_MS = 1000 * 60 * 60 * 6;

function cacheKey(make: string, model: string) {
  return `${make.trim().toLowerCase()}|${model.trim().toLowerCase()}`;
}

function pickSpecUrlFromResults(results: SearxResult[]): string | null {
  const preferred =
    /notebookcheck\.net|laptopmedia\.com|psref\.lenovo\.com|support\.hp\.com|dell\.com\/support|asus\.com|acer\.com|fcc\.id/i;
  for (const r of results) {
    const u = r.url;
    if (u && preferred.test(u)) return u;
  }
  for (const r of results) {
    const u = r.url;
    if (u && /^https?:\/\//i.test(u)) return u;
  }
  return null;
}

function searchOnlyInsight(
  results: SearxResult[],
  query: string,
): LaptopSpecsInsight {
  const specUrl = pickSpecUrlFromResults(results);
  const parts = results
    .slice(0, 4)
    .map((r) => {
      const t = (r.title ?? "").trim();
      const c = (r.content ?? "").trim().slice(0, 280);
      if (!t && !c) return "";
      return [t, c].filter(Boolean).join(" — ");
    })
    .filter(Boolean);
  const summary =
    parts.length > 0
      ? `Haulla “${query}” löytyi muun muassa:\n\n${parts.join("\n\n")}`
      : null;
  return { summary, specUrl };
}

/** @internal exported for unit tests */
export function extractJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : trimmed;
  try {
    const o = JSON.parse(candidate) as Record<string, unknown>;
    return o && typeof o === "object" ? o : null;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    try {
      const o = JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
      return o && typeof o === "object" ? o : null;
    } catch {
      return null;
    }
  }
}

/** @internal exported for unit tests */
export function parseAiInsight(o: Record<string, unknown> | null): LaptopSpecsInsight {
  if (!o) return { summary: null, specUrl: null };
  const summary = typeof o.summary === "string" ? o.summary.trim() || null : null;
  const specUrl = typeof o.specPageUrl === "string" ? o.specPageUrl.trim() || null : null;
  if (specUrl && !/^https?:\/\//i.test(specUrl)) {
    return { summary, specUrl: null };
  }
  return { summary, specUrl };
}

async function searxSearch(query: string): Promise<SearxResult[]> {
  const base = process.env.SPECS_SEARXNG_BASE_URL?.replace(/\/$/, "");
  if (!base) return [];
  const u = new URL(`${base}/search`);
  u.searchParams.set("q", query);
  u.searchParams.set("format", "json");
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 12_000);
  try {
    const res = await fetch(u.toString(), {
      headers: { Accept: "application/json" },
      signal: ac.signal,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: SearxResult[] };
    return Array.isArray(data.results) ? data.results.slice(0, 10) : [];
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

async function callOpenAiCompatible(
  base: string,
  model: string,
  userPayload: string,
): Promise<string | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 45_000);
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const key = process.env.SPECS_AI_API_KEY;
    if (key) headers.Authorization = `Bearer ${key}`;

    const res = await fetch(`${base}/v1/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You help summarize laptop hardware from web search snippets. Reply with ONLY a JSON object: {\"summary\":\"...\",\"specPageUrl\":\"https://...\" or null}. Field summary: 2–5 short sentences in Finnish. Field specPageUrl: the single best URL from the provided results for detailed specs/reviews (prefer notebookcheck, laptopmedia, manufacturer support/spec), or null if unsure.",
          },
          { role: "user", content: userPayload },
        ],
      }),
      signal: ac.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content;
    return typeof text === "string" ? text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function callOllamaChat(
  base: string,
  model: string,
  userPayload: string,
): Promise<string | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 45_000);
  try {
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              'Reply with ONLY JSON: {"summary":"...","specPageUrl":"https://..." or null}. summary in Finnish (2–5 short sentences). specPageUrl = best spec page from results.',
          },
          { role: "user", content: userPayload },
        ],
      }),
      signal: ac.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { message?: { content?: string } };
    const text = data.message?.content;
    return typeof text === "string" ? text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function runLlm(
  query: string,
  results: SearxResult[],
): Promise<LaptopSpecsInsight | null> {
  const base = process.env.SPECS_AI_BASE_URL?.replace(/\/$/, "");
  if (!base) return null;

  const model = process.env.SPECS_AI_MODEL?.trim() || "llama3";
  const kind = (process.env.SPECS_AI_KIND ?? "auto").toLowerCase();

  const payload = JSON.stringify({
    query,
    results: results.map((r) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      content: (r.content ?? "").slice(0, 600),
    })),
  });

  let raw: string | null = null;
  if (kind === "ollama") {
    raw = await callOllamaChat(base, model, payload);
  } else if (kind === "openai") {
    raw = await callOpenAiCompatible(base, model, payload);
  } else {
    raw = await callOpenAiCompatible(base, model, payload);
    if (!raw) raw = await callOllamaChat(base, model, payload);
  }

  if (!raw) return null;
  return parseAiInsight(extractJsonObject(raw));
}

/**
 * Fetches web results via SearXNG, optionally refines with a local OpenAI-compatible or Ollama API.
 */
export async function resolveLaptopSpecs(
  make: string,
  model: string,
): Promise<LaptopSpecsInsight> {
  const m = make.trim();
  const mo = model.trim();
  if (!m || !mo) return { summary: null, specUrl: null };

  if (process.env.SPECS_LOOKUP_ENABLED === "false") {
    return { summary: null, specUrl: null };
  }

  const key = cacheKey(m, mo);
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.value;

  const query = `${m} ${mo} laptop specifications review`;
  const results = await searxSearch(query);
  if (results.length === 0) {
    const empty = { summary: null, specUrl: null };
    cache.set(key, { exp: Date.now() + CACHE_MS, value: empty });
    return empty;
  }

  let insight: LaptopSpecsInsight = searchOnlyInsight(results, query);

  try {
    const ai = await runLlm(query, results);
    if (ai) {
      insight = {
        summary: ai.summary ?? insight.summary,
        specUrl: ai.specUrl ?? insight.specUrl,
      };
    }
  } catch {
    /* keep search-only */
  }

  cache.set(key, { exp: Date.now() + CACHE_MS, value: insight });
  return insight;
}

export function withSpecsTimeout<T>(
  p: Promise<T>,
  ms: number,
): Promise<T | null> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      () => {
        clearTimeout(t);
        resolve(null);
      },
    );
  });
}
