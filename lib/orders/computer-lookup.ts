import { prisma } from "@/lib/db/prisma";
import {
  mergeReferenceFromWebInsight,
  webSpecsFromInsight,
} from "@/lib/orders/merge-web-specs";
import { checkCompatibility } from "@/lib/specs/compatibility";
import {
  coerceLaptopMakeModelForLookup,
  findLaptopReferenceRow,
  formatReferenceSummary,
  manufacturerCandidates,
  normalizeSpecToken,
  referenceRowIsStrong,
  structuredSpecsFromReferenceRow,
} from "@/lib/specs/laptop-reference-lookup";
import { hasStrongLookupReference } from "@/lib/specs/reference-laptop-strong";
import {
  resolveLaptopSpecs,
  withSpecsTimeout,
} from "@/lib/specs/laptop-specs";
import type { LaptopStructuredSpecs } from "@/lib/specs/laptop-specs-structured";
import {
  getSpecsSearxngBaseUrl,
  isSpecsLookupEnabled,
} from "@/lib/specs/specs-env";

const WEB_SPECS_LOOKUP_MS = 28_000;

export type ComputerLookupMatch = {
  id: string;
  make: string;
  model: string;
  yearFrom: number | null;
  yearTo: number | null;
  compatible: boolean | null;
  verdict: string | null;
  ssdSlot: string | null;
  maxRamGb: number | null;
  status: string;
};

export type ComputerLookupReference = {
  cpu: string | null;
  ram: string | null;
  storage: string | null;
  gpu: string | null;
  display: string | null;
  weight: string | null;
  summary: string | null;
};

export type ComputerLookupCompatibility = {
  status: string;
  reasons: string[];
  speedGainEstimate: string;
};

export type ComputerLookupWebSpecs = {
  summary: string | null;
  specUrl: string | null;
  specs: LaptopStructuredSpecs;
};

export type ComputerLookupResult = {
  coerced: { make: string; model: string };
  matches: ComputerLookupMatch[];
  reference: ComputerLookupReference | null;
  yearOptions: number[];
  needsYearChoice: boolean;
  compatibility: ComputerLookupCompatibility | null;
  /** Optional SearXNG/LLM hints when `includeWebSpecs` is requested and configured. */
  webSpecs?: ComputerLookupWebSpecs | null;
  /** Structured fields from web agent (also merged into `reference` where empty). */
  discovered?: LaptopStructuredSpecs | null;
};

function normalizeSearch(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function yearOptionsFromMatches(matches: ComputerLookupMatch[]): number[] {
  const years = new Set<number>();
  for (const m of matches) {
    if (m.yearFrom != null && m.yearTo != null) {
      for (let y = m.yearFrom; y <= m.yearTo; y++) years.add(y);
    } else if (m.yearFrom != null) {
      years.add(m.yearFrom);
    } else if (m.yearTo != null) {
      years.add(m.yearTo);
    }
  }
  return Array.from(years).sort((a, b) => b - a);
}

function filterMatchesByYear(
  matches: ComputerLookupMatch[],
  year: number,
): ComputerLookupMatch[] {
  return matches.filter((m) => {
    if (m.yearFrom == null && m.yearTo == null) return true;
    const from = m.yearFrom ?? m.yearTo ?? year;
    const to = m.yearTo ?? m.yearFrom ?? year;
    return year >= from && year <= to;
  });
}

function pickPrimaryMatch(
  matches: ComputerLookupMatch[],
  year?: number | null,
): ComputerLookupMatch | null {
  if (matches.length === 0) return null;
  const pool =
    year != null ? filterMatchesByYear(matches, year) : matches;
  if (pool.length === 1) return pool[0]!;
  if (pool.length > 1) return pool[0]!;
  return matches[0]!;
}

async function loadReference(
  make: string,
  model: string,
  locale: "fi" | "en",
): Promise<ComputerLookupReference | null> {
  const row = await findLaptopReferenceRow(make, model);
  if (!row) return null;
  const summary = formatReferenceSummary(row, locale);
  const display = [row.screenSize, row.screenDetail].filter(Boolean).join(" — ") || null;
  return {
    cpu: row.cpu,
    ram: row.ram,
    storage: row.storage,
    gpu: row.gpu,
    display,
    weight: row.weight,
    summary,
  };
}

async function searchComputerModels(
  coerced: { make: string; model: string },
  trimmed: string,
): Promise<ComputerLookupMatch[]> {
  const q = normalizeSearch(trimmed);
  const { make, model } = coerced;

  if (make && model) {
    const mk = normalizeSpecToken(make);
    const md = normalizeSpecToken(model);
    const brands = manufacturerCandidates(make);
    const rows = await prisma.computerModel.findMany({
      where: {
        OR: [
          ...brands.flatMap((b) => [
            {
              AND: [
                { make: { equals: b, mode: "insensitive" as const } },
                { model: { contains: model, mode: "insensitive" as const } },
              ],
            },
            {
              AND: [
                { make: { equals: b, mode: "insensitive" as const } },
                { model: { equals: model, mode: "insensitive" as const } },
              ],
            },
          ]),
          {
            model: { contains: trimmed, mode: "insensitive" as const },
          },
        ],
      },
      take: 40,
      orderBy: [{ make: "asc" }, { model: "asc" }],
    });
    const filtered = rows.filter((m) => {
      const hay = normalizeSearch(`${m.make} ${m.model}`);
      return hay.includes(mk) && hay.includes(md);
    });
    if (filtered.length > 0) {
      return filtered.map((m) => ({
        id: m.id,
        make: m.make,
        model: m.model,
        yearFrom: m.yearFrom,
        yearTo: m.yearTo,
        compatible: m.compatible,
        verdict: m.verdict,
        ssdSlot: m.ssdSlot,
        maxRamGb: m.maxRamGb,
        status: m.status,
      }));
    }
  }

  if (q.length >= 3) {
    const rows = await prisma.computerModel.findMany({
      where: {
        OR: [
          { model: { contains: trimmed, mode: "insensitive" } },
          { make: { contains: trimmed, mode: "insensitive" } },
        ],
      },
      take: 40,
      orderBy: [{ make: "asc" }, { model: "asc" }],
    });
    if (rows.length > 0) {
      return rows.map((m) => ({
        id: m.id,
        make: m.make,
        model: m.model,
        yearFrom: m.yearFrom,
        yearTo: m.yearTo,
        compatible: m.compatible,
        verdict: m.verdict,
        ssdSlot: m.ssdSlot,
        maxRamGb: m.maxRamGb,
        status: m.status,
      }));
    }
  }

  if (make) {
    const brands = manufacturerCandidates(make);
    const rows = await prisma.computerModel.findMany({
      where: {
        OR: brands.map((b) => ({
          make: { equals: b, mode: "insensitive" as const },
        })),
      },
      take: 20,
      orderBy: [{ make: "asc" }, { model: "asc" }],
    });
    return rows.map((m) => ({
      id: m.id,
      make: m.make,
      model: m.model,
      yearFrom: m.yearFrom,
      yearTo: m.yearTo,
      compatible: m.compatible,
      verdict: m.verdict,
      ssdSlot: m.ssdSlot,
      maxRamGb: m.maxRamGb,
      status: m.status,
    }));
  }

  return [];
}

function yearOptionsFromDiscovered(
  specs: LaptopStructuredSpecs | null | undefined,
): number[] {
  if (!specs?.yearFrom) return [];
  const from = specs.yearFrom;
  const to = specs.yearTo ?? specs.yearFrom;
  const years: number[] = [];
  for (let y = from; y <= to && y <= from + 8; y++) years.push(y);
  return years.sort((a, b) => b - a);
}

export async function lookupComputerForWizard(
  description: string,
  locale: "fi" | "en",
  options?: {
    selectedYear?: number | null;
    selectedMatchId?: string | null;
    includeWebSpecs?: boolean;
  },
): Promise<ComputerLookupResult | null> {
  const trimmed = description.trim();
  if (trimmed.length < 3) return null;

  const coerced = coerceLaptopMakeModelForLookup(null, trimmed);
  if (!coerced) return null;

  const { make, model } = coerced;
  const mapped = await searchComputerModels(coerced, trimmed);

  let selected = options?.selectedMatchId
    ? mapped.find((m) => m.id === options.selectedMatchId) ?? null
    : null;

  if (!selected) {
    selected = pickPrimaryMatch(mapped, options?.selectedYear ?? null);
  }

  const refMake = selected?.make ?? make;
  const refModel = selected?.model ?? model;
  let reference = await loadReference(refMake, refModel, locale);
  const refRow = await findLaptopReferenceRow(refMake, refModel);
  const catalogStrong = referenceRowIsStrong(refRow);

  let webSpecs: ComputerLookupWebSpecs | null = null;
  let discovered: LaptopStructuredSpecs | null = catalogStrong
    ? structuredSpecsFromReferenceRow(refRow!)
    : null;

  const shouldFetchWeb =
    options?.includeWebSpecs &&
    isSpecsLookupEnabled() &&
    getSpecsSearxngBaseUrl() &&
    !hasStrongLookupReference(reference);

  if (shouldFetchWeb) {
    const insight = await withSpecsTimeout(
      resolveLaptopSpecs(refMake, refModel, { locale }),
      WEB_SPECS_LOOKUP_MS,
    );
    if (insight) {
      reference = mergeReferenceFromWebInsight(reference, insight);
      webSpecs = webSpecsFromInsight(insight);
      discovered = insight.specs;
    }
  }

  let yearOptions = yearOptionsFromMatches(mapped);
  if (yearOptions.length === 0 && discovered) {
    yearOptions = yearOptionsFromDiscovered(discovered);
  }
  const needsYearChoice =
    yearOptions.length > 1 &&
    (options?.selectedYear == null || options.selectedYear === undefined);

  let compatibility: ComputerLookupCompatibility | null = null;
  if (selected) {
    const dbVerdict =
      selected.compatible != null
        ? { compatible: selected.compatible, verdict: selected.verdict }
        : null;
    const c = checkCompatibility(
      selected.make,
      selected.model,
      null,
      "unknown",
      dbVerdict,
    );
    compatibility = {
      status: c.status,
      reasons: c.reasons,
      speedGainEstimate: c.speedGainEstimate,
    };
  } else if (make || model) {
    const c = checkCompatibility(make, model, null, "unknown", null);
    compatibility = {
      status: c.status,
      reasons: c.reasons,
      /** No catalog row — do not show heuristic speed-up on public checker. */
      speedGainEstimate: "—",
    };
  }

  return {
    coerced: { make: refMake, model: refModel },
    matches: mapped,
    reference,
    yearOptions,
    needsYearChoice,
    compatibility,
    webSpecs,
    discovered,
  };
}
