import { prisma } from "@/lib/db/prisma";
import {
  coerceLaptopMakeModelForLookup,
  lookupLaptopReference,
} from "@/lib/specs/laptop-reference-lookup";
import { checkCompatibility } from "@/lib/specs/compatibility";

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
  const summary = await lookupLaptopReference(make, model, locale);
  if (!summary) return null;

  const row = await prisma.laptopReferenceSpec.findFirst({
    where: {
      OR: [
        {
          manufacturer: { equals: make, mode: "insensitive" },
          modelName: { contains: model, mode: "insensitive" },
        },
        { modelName: { contains: model, mode: "insensitive" } },
      ],
    },
  });
  if (!row) {
    return { cpu: null, ram: null, storage: null, gpu: null, display: null, weight: null, summary };
  }
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

export async function lookupComputerForWizard(
  description: string,
  locale: "fi" | "en",
  options?: { selectedYear?: number | null; selectedMatchId?: string | null },
): Promise<ComputerLookupResult | null> {
  const trimmed = description.trim();
  if (trimmed.length < 3) return null;

  const coerced = coerceLaptopMakeModelForLookup(null, trimmed);
  if (!coerced) return null;

  const { make, model } = coerced;
  const q = normalizeSearch(trimmed);

  const allModels = await prisma.computerModel.findMany({
    orderBy: [{ make: "asc" }, { model: "asc" }],
  });

  let matches = allModels.filter((m) => {
    const hay = normalizeSearch(`${m.make} ${m.model}`);
    if (make && model) {
      const mk = normalizeSearch(make);
      const md = normalizeSearch(model);
      return hay.includes(mk) && hay.includes(md);
    }
    return hay.includes(q) || q.includes(hay);
  });

  if (matches.length === 0 && make) {
    matches = allModels.filter((m) =>
      normalizeSearch(m.make).includes(normalizeSearch(make)),
    );
  }

  const mapped: ComputerLookupMatch[] = matches.map((m) => ({
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

  const yearOptions = yearOptionsFromMatches(mapped);
  const needsYearChoice =
    yearOptions.length > 1 &&
    (options?.selectedYear == null || options.selectedYear === undefined);

  let selected = options?.selectedMatchId
    ? mapped.find((m) => m.id === options.selectedMatchId) ?? null
    : null;

  if (!selected) {
    selected = pickPrimaryMatch(mapped, options?.selectedYear ?? null);
  }

  const refMake = selected?.make ?? make;
  const refModel = selected?.model ?? model;
  const reference = await loadReference(refMake, refModel, locale);

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
  };
}
