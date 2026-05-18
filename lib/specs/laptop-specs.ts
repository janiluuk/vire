/**
 * Server-only: SearXNG + optional LLM agent for laptop specs.
 * Results persist in `LaptopSpecsInternetCache` and optionally `LaptopReferenceSpec`.
 */
import {
  readLaptopSpecsInternetCache,
  writeLaptopSpecsInternetCache,
} from "@/lib/specs/laptop-specs-cache";
import {
  EMPTY_STRUCTURED_SPECS,
  hasStructuredSpecs,
  mergeStructuredSpecs,
  parseStructuredSpecs,
  type LaptopStructuredSpecs,
} from "@/lib/specs/laptop-specs-structured";
import { persistWebReferenceSpec } from "@/lib/specs/persist-web-reference";
import { searxSearch, type SearxResult } from "@/lib/specs/searx-client";
import {
  getSpecsAiConfig,
  getSpecsSearxngBaseUrl,
  isSpecsLookupEnabled,
} from "@/lib/specs/specs-env";

export type { LaptopStructuredSpecs } from "@/lib/specs/laptop-specs-structured";
export { EMPTY_STRUCTURED_SPECS } from "@/lib/specs/laptop-specs-structured";

export type LaptopSpecsInsight = {
  summary: string | null;
  specUrl: string | null;
  /** Retail-style reference specs from imported dataset (not manufacturer-official). */
  referenceSummary?: string | null;
  /** CPU, RAM, storage, etc. from web agent when available. */
  specs: LaptopStructuredSpecs;
};

const cache = new Map<string, { exp: number; value: LaptopSpecsInsight }>();
const CACHE_MS = 1000 * 60 * 60 * 6;

const LLM_SYSTEM = `You extract laptop hardware specifications from web search snippets.
Reply with ONLY one JSON object (no markdown outside the object):
{
  "summary": "2-4 short sentences in Finnish describing the model for a customer",
  "specPageUrl": "https://best-spec-or-review-url from the results, or null",
  "cpu": "processor model string or null",
  "ram": "installed or max RAM as human text e.g. 8 GB or null",
  "storage": "default storage e.g. 500 GB HDD or 256 GB SSD or null",
  "gpu": "graphics chip or null",
  "display": "screen size/resolution or null",
  "weight": "weight or null",
  "maxRamGb": number or null,
  "ssdSlot": "upgrade slot note e.g. 2.5 inch SATA, M.2 or null",
  "yearFrom": number or null,
  "yearTo": number or null
}
Use null for unknown fields. Prefer facts clearly stated in the snippets.`;

function cacheKey(make: string, model: string, locale: string) {
  const mk = make.trim().toLowerCase();
  const md = model.trim().toLowerCase();
  return `${mk || "_"}|${md || "_"}|${locale}`;
}

function pickSpecUrlFromResults(results: SearxResult[]): string | null {
  const preferred =
    /notebookcheck\.net|laptopmedia\.com|psref\.lenovo\.com|support\.hp\.com|dell\.com\/support|asus\.com|acer\.com|fcc\.id|laptoping\.com/i;
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
  return { summary, specUrl, specs: { ...EMPTY_STRUCTURED_SPECS } };
}

/** @internal exported for unit tests */
export function extractJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim().replace(/^\uFEFF/, "");
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1]!.trim() : trimmed;
  try {
    const o = JSON.parse(candidate) as Record<string, unknown>;
    return o && typeof o === "object" ? o : null;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    try {
      const o = JSON.parse(candidate.slice(start, end + 1)) as Record<
        string,
        unknown
      >;
      return o && typeof o === "object" ? o : null;
    } catch {
      return null;
    }
  }
}

function pickFirstString(
  o: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string") {
      const t = v.trim();
      if (t.length > 0) return t;
    }
  }
  return null;
}

/** @internal exported for unit tests */
export function parseAiInsight(o: Record<string, unknown> | null): LaptopSpecsInsight {
  if (!o) {
    return { summary: null, specUrl: null, specs: { ...EMPTY_STRUCTURED_SPECS } };
  }
  const summary = pickFirstString(o, [
    "summary",
    "yhteenveto",
    "text",
    "description",
  ]);
  let specUrl = pickFirstString(o, [
    "specPageUrl",
    "specUrl",
    "spec_page_url",
    "url",
    "link",
    "sourceUrl",
    "source_url",
  ]);
  if (specUrl && !/^https?:\/\//i.test(specUrl)) {
    specUrl = null;
  }
  const specs = parseStructuredSpecs(o);
  return { summary, specUrl, specs };
}

async function callOpenAiCompatible(
  base: string,
  model: string,
  userPayload: string,
): Promise<string | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 50_000);
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
        temperature: 0.15,
        messages: [
          { role: "system", content: LLM_SYSTEM },
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
  const timer = setTimeout(() => ac.abort(), 50_000);
  try {
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          { role: "system", content: LLM_SYSTEM },
          { role: "user", content: userPayload },
        ],
      }),
      signal: ac.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      message?: { content?: string };
      choices?: { message?: { content?: string } }[];
    };
    const text =
      typeof data.message?.content === "string"
        ? data.message.content
        : typeof data.choices?.[0]?.message?.content === "string"
          ? data.choices[0]!.message!.content
          : null;
    return text ?? null;
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
  const { base, model, kind } = getSpecsAiConfig();
  if (!base) return null;

  const payload = JSON.stringify({
    query,
    results: results.map((r) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      content: (r.content ?? "").slice(0, 700),
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
 * Fetches web results via SearXNG, optionally refines with LLM, persists to DB.
 */
export async function resolveLaptopSpecs(
  make: string,
  model: string,
  options?: { locale?: "fi" | "en" },
): Promise<LaptopSpecsInsight> {
  const m = make.trim();
  const mo = model.trim();
  const empty: LaptopSpecsInsight = {
    summary: null,
    specUrl: null,
    specs: { ...EMPTY_STRUCTURED_SPECS },
  };
  if (!m && !mo) return empty;

  if (!isSpecsLookupEnabled()) return empty;

  const locale = options?.locale === "en" ? "en" : "fi";

  const key = cacheKey(m, mo, locale);
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.value;

  let referenceSummary: string | null = null;
  let catalogInsight: LaptopSpecsInsight | null = null;
  try {
    const {
      findLaptopReferenceRow,
      lookupLaptopReference,
      referenceRowIsStrong,
      structuredSpecsFromReferenceRow,
    } = await import("@/lib/specs/laptop-reference-lookup");
    referenceSummary = await lookupLaptopReference(m, mo, locale);
    const refRow = await findLaptopReferenceRow(m, mo);
    if (refRow && referenceRowIsStrong(refRow)) {
      catalogInsight = {
        summary: referenceSummary,
        specUrl: null,
        referenceSummary,
        specs: structuredSpecsFromReferenceRow(refRow),
      };
    }
  } catch {
    referenceSummary = null;
    catalogInsight = null;
  }

  const attachReference = (insight: LaptopSpecsInsight): LaptopSpecsInsight => ({
    ...insight,
    referenceSummary,
  });

  if (catalogInsight) {
    cache.set(key, { exp: Date.now() + CACHE_MS, value: catalogInsight });
    return catalogInsight;
  }

  try {
    const dbCached = await readLaptopSpecsInternetCache(m, mo, locale);
    if (dbCached) {
      const merged = attachReference(dbCached);
      cache.set(key, { exp: Date.now() + CACHE_MS, value: merged });
      return merged;
    }
  } catch {
    /* continue to live lookup */
  }

  const searxBase = getSpecsSearxngBaseUrl();
  if (!searxBase) {
    const noWeb = attachReference({ ...empty, referenceSummary });
    cache.set(key, { exp: Date.now() + CACHE_MS, value: noWeb });
    return noWeb;
  }

  const query =
    `${[m, mo].filter(Boolean).join(" ")} laptop specifications CPU RAM storage`.trim();
  const results = await searxSearch(searxBase, query);
  if (results.length === 0) {
    const none = attachReference({ ...empty, referenceSummary });
    cache.set(key, { exp: Date.now() + CACHE_MS, value: none });
    try {
      await writeLaptopSpecsInternetCache(m, mo, locale, none, {
        searxResultCount: 0,
        usedLlm: false,
      });
    } catch {
      /* non-fatal */
    }
    return none;
  }

  let insight: LaptopSpecsInsight = {
    ...searchOnlyInsight(results, query),
    referenceSummary,
  };

  let usedLlm = false;
  try {
    const ai = await runLlm(query, results);
    if (ai) {
      usedLlm = true;
      insight = {
        summary: ai.summary ?? insight.summary,
        specUrl: ai.specUrl ?? insight.specUrl,
        specs: mergeStructuredSpecs(insight.specs, ai.specs),
        referenceSummary,
      };
    }
  } catch {
    /* keep search-only */
  }

  if (hasStructuredSpecs(insight.specs)) {
    try {
      await persistWebReferenceSpec(m, mo, insight.specs);
    } catch {
      /* non-fatal */
    }
  }

  cache.set(key, { exp: Date.now() + CACHE_MS, value: insight });
  try {
    await writeLaptopSpecsInternetCache(m, mo, locale, insight, {
      searxResultCount: results.length,
      usedLlm,
    });
  } catch {
    /* non-fatal */
  }
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
