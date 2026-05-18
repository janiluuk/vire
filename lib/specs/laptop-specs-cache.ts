import { prisma } from "@/lib/db/prisma";
import type { LaptopSpecsInsight } from "@/lib/specs/laptop-specs";
import { EMPTY_STRUCTURED_SPECS } from "@/lib/specs/laptop-specs-structured";

export type SpecsCacheLocale = "fi" | "en";

export type SpecsCacheKey = {
  makeNorm: string;
  modelNorm: string;
  makeDisplay: string;
  modelDisplay: string;
};

const DEFAULT_HIT_TTL_DAYS = 30;
const DEFAULT_EMPTY_TTL_HOURS = 24;

function cacheTtlMs(hasUsefulWebContent: boolean): number {
  if (hasUsefulWebContent) {
    const days = Number(process.env.SPECS_CACHE_TTL_DAYS ?? DEFAULT_HIT_TTL_DAYS);
    const d = Number.isFinite(days) && days > 0 ? days : DEFAULT_HIT_TTL_DAYS;
    return d * 24 * 60 * 60 * 1000;
  }
  const hours = Number(
    process.env.SPECS_CACHE_EMPTY_TTL_HOURS ?? DEFAULT_EMPTY_TTL_HOURS,
  );
  const h = Number.isFinite(hours) && hours > 0 ? hours : DEFAULT_EMPTY_TTL_HOURS;
  return h * 60 * 60 * 1000;
}

/** @internal exported for unit tests */
export function normalizeSpecsCacheKey(
  make: string,
  model: string,
): SpecsCacheKey {
  const makeDisplay = make.trim();
  const modelDisplay = model.trim();
  const norm = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  return {
    makeNorm: norm(makeDisplay),
    modelNorm: norm(modelDisplay),
    makeDisplay,
    modelDisplay,
  };
}

function rowToInsight(
  row: {
    summary: string | null;
    specUrl: string | null;
    cpu: string | null;
    ram: string | null;
    storage: string | null;
    gpu: string | null;
    display: string | null;
    weight: string | null;
    maxRamGb: number | null;
    ssdSlot: string | null;
    yearFrom: number | null;
    yearTo: number | null;
  },
  referenceSummary: string | null | undefined,
): LaptopSpecsInsight {
  return {
    summary: row.summary,
    specUrl: row.specUrl,
    referenceSummary: referenceSummary ?? null,
    specs: {
      cpu: row.cpu,
      ram: row.ram,
      storage: row.storage,
      gpu: row.gpu,
      display: row.display,
      weight: row.weight,
      maxRamGb: row.maxRamGb,
      ssdSlot: row.ssdSlot,
      yearFrom: row.yearFrom,
      yearTo: row.yearTo,
    },
  };
}

function hasUsefulInsight(insight: Pick<LaptopSpecsInsight, "summary" | "specUrl" | "specs">): boolean {
  if (insight.summary?.trim() || insight.specUrl?.trim()) return true;
  const s = insight.specs;
  return Boolean(
    s.cpu ||
      s.ram ||
      s.storage ||
      s.gpu ||
      s.display ||
      s.weight ||
      s.maxRamGb != null ||
      s.ssdSlot,
  );
}

/**
 * Returns a cached web lookup when still valid. Does not include reference dataset text
 * (caller should merge `referenceSummary` from `lookupLaptopReference`).
 */
export async function readLaptopSpecsInternetCache(
  make: string,
  model: string,
  locale: SpecsCacheLocale,
): Promise<LaptopSpecsInsight | null> {
  const key = normalizeSpecsCacheKey(make, model);
  if (!key.makeNorm && !key.modelNorm) return null;

  const row = await prisma.laptopSpecsInternetCache.findUnique({
    where: {
      makeNorm_modelNorm_locale: {
        makeNorm: key.makeNorm,
        modelNorm: key.modelNorm,
        locale,
      },
    },
  });
  if (!row || row.expiresAt.getTime() <= Date.now()) return null;

  return rowToInsight(row, null);
}

export async function writeLaptopSpecsInternetCache(
  make: string,
  model: string,
  locale: SpecsCacheLocale,
  insight: LaptopSpecsInsight,
  meta: { searxResultCount: number; usedLlm: boolean },
): Promise<void> {
  const key = normalizeSpecsCacheKey(make, model);
  if (!key.makeNorm && !key.modelNorm) return;

  const specs = insight.specs ?? EMPTY_STRUCTURED_SPECS;
  const hasUseful = hasUsefulInsight({ ...insight, specs });
  const expiresAt = new Date(Date.now() + cacheTtlMs(hasUseful));

  const structured = {
    cpu: specs.cpu,
    ram: specs.ram,
    storage: specs.storage,
    gpu: specs.gpu,
    display: specs.display,
    weight: specs.weight,
    maxRamGb: specs.maxRamGb,
    ssdSlot: specs.ssdSlot,
    yearFrom: specs.yearFrom,
    yearTo: specs.yearTo,
  };

  await prisma.laptopSpecsInternetCache.upsert({
    where: {
      makeNorm_modelNorm_locale: {
        makeNorm: key.makeNorm,
        modelNorm: key.modelNorm,
        locale,
      },
    },
    create: {
      makeNorm: key.makeNorm,
      modelNorm: key.modelNorm,
      locale,
      makeDisplay: key.makeDisplay,
      modelDisplay: key.modelDisplay,
      summary: insight.summary,
      specUrl: insight.specUrl,
      ...structured,
      searxResultCount: meta.searxResultCount,
      usedLlm: meta.usedLlm,
      expiresAt,
    },
    update: {
      makeDisplay: key.makeDisplay,
      modelDisplay: key.modelDisplay,
      summary: insight.summary,
      specUrl: insight.specUrl,
      ...structured,
      searxResultCount: meta.searxResultCount,
      usedLlm: meta.usedLlm,
      expiresAt,
    },
  });
}
