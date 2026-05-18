/** Server-side laptop spec lookup configuration (SearXNG + optional LLM). */

const DEFAULT_SEARXNG = "https://search.dudeisland.eu";

export function isSpecsLookupEnabled(): boolean {
  return process.env.SPECS_LOOKUP_ENABLED !== "false";
}

export function getSpecsSearxngBaseUrl(): string | null {
  const raw = process.env.SPECS_SEARXNG_BASE_URL?.trim();
  const base = (raw || DEFAULT_SEARXNG).replace(/\/$/, "");
  return base.length > 0 ? base : null;
}

export function getSpecsAiConfig(): {
  base: string | null;
  model: string;
  kind: "ollama" | "openai" | "auto";
} {
  const base = process.env.SPECS_AI_BASE_URL?.replace(/\/$/, "") ?? null;
  const model = process.env.SPECS_AI_MODEL?.trim() || "llama3";
  const kind = (process.env.SPECS_AI_KIND ?? "auto").toLowerCase();
  const normalized =
    kind === "ollama" || kind === "openai" ? kind : ("auto" as const);
  return { base, model, kind: normalized };
}
