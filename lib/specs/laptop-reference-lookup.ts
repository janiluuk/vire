import { prisma } from "@/lib/db/prisma";
import { hasStrongReferenceFromFields } from "@/lib/specs/reference-laptop-strong";
import type { LaptopStructuredSpecs } from "@/lib/specs/laptop-specs-structured";
import type { LaptopReferenceSpec } from "@prisma/client";

/** Normalize brand / model for substring matching. */
export function normalizeSpecToken(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[–—-]/g, "-")
    .toLowerCase();
}

/** Product lines / families → OEM used for DB + web search when the brand was omitted. */
const PRODUCT_LINE_TO_MAKE: { re: RegExp; make: string }[] = [
  { re: /^thinkpad(\s+|$)/i, make: "Lenovo" },
  { re: /^ideapad(\s+|$)/i, make: "Lenovo" },
  { re: /^legion(\s+|$)/i, make: "Lenovo" },
  { re: /^yoga(\s+|$)/i, make: "Lenovo" },
  { re: /^macbook(\s+|$)/i, make: "Apple" },
  { re: /^imac(\s+|$)/i, make: "Apple" },
  { re: /^mac\s+mini(\s+|$)/i, make: "Apple" },
  { re: /^mac\s+studio(\s+|$)/i, make: "Apple" },
  { re: /^surface(\s+|$)/i, make: "Microsoft" },
  { re: /^pavilion(\s+|$)/i, make: "HP" },
  { re: /^envy(\s+|$)/i, make: "HP" },
  { re: /^spectre(\s+|$)/i, make: "HP" },
  { re: /^elitebook(\s+|$)/i, make: "HP" },
  { re: /^probook(\s+|$)/i, make: "HP" },
  { re: /^omen(\s+|$)/i, make: "HP" },
  { re: /^inspiron(\s+|$)/i, make: "Dell" },
  { re: /^latitude(\s+|$)/i, make: "Dell" },
  { re: /^xps(\s+|$)/i, make: "Dell" },
  { re: /^precision(\s+|$)/i, make: "Dell" },
  { re: /^alienware(\s+|$)/i, make: "Dell" },
  { re: /^vivobook(\s+|$)/i, make: "Asus" },
  { re: /^zenbook(\s+|$)/i, make: "Asus" },
  { re: /^rog(\s+|$)/i, make: "Asus" },
  { re: /^tuf(\s+|$)/i, make: "Asus" },
  { re: /^swift(\s+|$)/i, make: "Acer" },
  { re: /^aspire(\s+|$)/i, make: "Acer" },
  { re: /^predator(\s+|$)/i, make: "Acer" },
  { re: /^nitro(\s+|$)/i, make: "Acer" },
  { re: /^spin(\s+|$)/i, make: "Acer" },
  { re: /^galaxy\s+book/i, make: "Samsung" },
];

/** Leading OEM names when the full name is stored in one field (longer patterns first). */
const LEADING_BRAND_PREFIXES: { re: RegExp; canonical: string }[] = [
  { re: /^hewlett\s+packard(\s+|$)/i, canonical: "HP" },
  { re: /^hewlett-packard(\s+|$)/i, canonical: "HP" },
  { re: /^microsoft(\s+|$)/i, canonical: "Microsoft" },
  { re: /^samsung(\s+|$)/i, canonical: "Samsung" },
  { re: /^lenovo(\s+|$)/i, canonical: "Lenovo" },
  { re: /^toshiba(\s+|$)/i, canonical: "Toshiba" },
  { re: /^fujitsu(\s+|$)/i, canonical: "Fujitsu" },
  { re: /^panasonic(\s+|$)/i, canonical: "Panasonic" },
  { re: /^framework(\s+|$)/i, canonical: "Framework" },
  { re: /^gigabyte(\s+|$)/i, canonical: "Gigabyte" },
  { re: /^huawei(\s+|$)/i, canonical: "Huawei" },
  { re: /^honor(\s+|$)/i, canonical: "Honor" },
  { re: /^xiaomi(\s+|$)/i, canonical: "Xiaomi" },
  { re: /^razer(\s+|$)/i, canonical: "Razer" },
  { re: /^google(\s+|$)/i, canonical: "Google" },
  { re: /^apple(\s+|$)/i, canonical: "Apple" },
  { re: /^acer(\s+|$)/i, canonical: "Acer" },
  { re: /^asus(\s+|$)/i, canonical: "Asus" },
  { re: /^dell(\s+|$)/i, canonical: "Dell" },
  { re: /^hp(\s+|$)/i, canonical: "HP" },
  { re: /^msi(\s+|$)/i, canonical: "MSI" },
  { re: /^lg(\s+|$)/i, canonical: "LG" },
  { re: /^sony(\s+|$)/i, canonical: "Sony" },
  { re: /^vaio(\s+|$)/i, canonical: "Vaio" },
];

/**
 * Builds make + model for spec lookup when checkout stored a full device name in one field
 * or only a model line (e.g. "ThinkPad T450").
 */
export function coerceLaptopMakeModelForLookup(
  computerMake: string | null | undefined,
  computerModel: string | null | undefined,
): { make: string; model: string } | null {
  const a = computerMake?.trim() ?? "";
  const b = computerModel?.trim() ?? "";
  if (!a && !b) return null;

  if (a && b) {
    return { make: a, model: b };
  }

  const combined = (a || b).replace(/\s+/g, " ").trim();
  if (combined.length < 2) return null;

  for (const { re, canonical } of LEADING_BRAND_PREFIXES) {
    const m = combined.match(re);
    if (!m || m.index !== 0) continue;
    const rest = combined.slice(m[0].length).trim();
    if (rest.length > 0) {
      return { make: canonical, model: rest };
    }
    return { make: canonical, model: combined };
  }

  for (const { re, make } of PRODUCT_LINE_TO_MAKE) {
    const m = combined.match(re);
    if (m) {
      const idx = m.index ?? 0;
      const after = combined.slice(idx + m[0].length).trim();
      const modelPart = after.length > 0 ? after : combined;
      return { make, model: modelPart };
    }
  }

  const sp = combined.indexOf(" ");
  if (sp > 0) {
    const first = combined.slice(0, sp).trim();
    const rest = combined.slice(sp + 1).trim();
    if (first.length >= 2 && rest.length >= 1) {
      return { make: first, model: rest };
    }
  }

  return { make: "", model: combined };
}

/** Expand user-entered make to likely CSV manufacturer labels. */
export function manufacturerCandidates(make: string): string[] {
  const raw = make.trim();
  const m = normalizeSpecToken(raw);
  const out = new Set<string>();
  if (raw) out.add(raw);
  if (m.includes("thinkpad") || m === "tp") out.add("Lenovo");
  if (m === "hewlett-packard" || m === "hewlett packard" || m === "hewlettpackard")
    out.add("HP");
  if (m === "mac" || m === "macbook" || m === "apple") out.add("Apple");
  if (m === "asus") out.add("Asus");
  if (m === "acer") out.add("Acer");
  if (m === "dell") out.add("Dell");
  if (m === "hp") out.add("HP");
  if (m === "lenovo") out.add("Lenovo");
  if (m === "msi") out.add("MSI");
  if (m === "toshiba") out.add("Toshiba");
  if (m === "samsung") out.add("Samsung");
  if (m === "microsoft") out.add("Microsoft");
  if (m === "fujitsu") out.add("Fujitsu");
  return Array.from(out);
}

function formatFiReference(r: LaptopReferenceSpec): string {
  const lines: string[] = [
    "Alla viitetiedot julkisesta mallistosta (ei välttämättä sama kuin koneesi).",
  ];
  if (r.cpu) lines.push(`• Suoritin: ${r.cpu}`);
  if (r.ram) lines.push(`• Muisti: ${r.ram}`);
  if (r.storage) lines.push(`• Tallennus: ${r.storage}`);
  if (r.gpu) lines.push(`• Näytönohjain: ${r.gpu}`);
  if (r.screenSize || r.screenDetail) {
    lines.push(
      `• Näyttö: ${[r.screenSize, r.screenDetail].filter(Boolean).join(" — ")}`,
    );
  }
  if (r.weight) lines.push(`• Paino: ${r.weight}`);
  if (r.category) lines.push(`• Luokka: ${r.category}`);
  if (r.operatingSystem) {
    lines.push(
      `• OS (listauksessa): ${r.operatingSystem}${r.osVersion ? ` ${r.osVersion}` : ""}`,
    );
  }
  return lines.join("\n");
}

function formatEnReference(r: LaptopReferenceSpec): string {
  const lines: string[] = [
    "Reference data from a public retail-style dataset (may not match your exact SKU).",
  ];
  if (r.cpu) lines.push(`• CPU: ${r.cpu}`);
  if (r.ram) lines.push(`• RAM: ${r.ram}`);
  if (r.storage) lines.push(`• Storage: ${r.storage}`);
  if (r.gpu) lines.push(`• GPU: ${r.gpu}`);
  if (r.screenSize || r.screenDetail) {
    lines.push(
      `• Display: ${[r.screenSize, r.screenDetail].filter(Boolean).join(" — ")}`,
    );
  }
  if (r.weight) lines.push(`• Weight: ${r.weight}`);
  if (r.category) lines.push(`• Category: ${r.category}`);
  if (r.operatingSystem) {
    lines.push(
      `• OS (listing): ${r.operatingSystem}${r.osVersion ? ` ${r.osVersion}` : ""}`,
    );
  }
  return lines.join("\n");
}

export function formatReferenceSummary(
  r: LaptopReferenceSpec,
  locale: "fi" | "en",
): string {
  return locale === "en" ? formatEnReference(r) : formatFiReference(r);
}

function pickBestRow(
  rows: LaptopReferenceSpec[],
  model: string,
): LaptopReferenceSpec | null {
  if (rows.length === 0) return null;
  const mo = model.trim();
  const low = normalizeSpecToken(mo);
  const exact = rows.find(
    (r) => r.modelName.trim().toLowerCase() === mo.toLowerCase(),
  );
  if (exact) return exact;
  const contains = rows.find((r) =>
    normalizeSpecToken(r.modelName).includes(low),
  );
  if (contains) return contains;
  const rev = rows.find(
    (r) => low.includes(normalizeSpecToken(r.modelName)) && r.modelName.length > 3,
  );
  return rev ?? rows[0] ?? null;
}

export function structuredSpecsFromReferenceRow(
  row: LaptopReferenceSpec,
): LaptopStructuredSpecs {
  const display =
    [row.screenSize, row.screenDetail].filter(Boolean).join(" — ") || null;
  return {
    cpu: row.cpu,
    ram: row.ram,
    storage: row.storage,
    gpu: row.gpu,
    display,
    weight: row.weight,
    maxRamGb: null,
    ssdSlot: null,
    yearFrom: null,
    yearTo: null,
  };
}

/**
 * Best matching imported catalog row (retail-style dataset). Not a compatibility verdict.
 */
export async function findLaptopReferenceRow(
  make: string,
  model: string,
): Promise<LaptopReferenceSpec | null> {
  const mo = model.trim();
  if (!mo) return null;

  if (!make.trim()) {
    const rows = await prisma.laptopReferenceSpec.findMany({
      where: { modelName: { contains: mo, mode: "insensitive" } },
      take: 120,
    });
    return pickBestRow(rows, mo);
  }

  const brands = manufacturerCandidates(make);
  const or = brands.flatMap((man) => [
    {
      manufacturer: { equals: man, mode: "insensitive" as const },
      modelName: { equals: mo, mode: "insensitive" as const },
    },
    {
      manufacturer: { equals: man, mode: "insensitive" as const },
      modelName: { contains: mo, mode: "insensitive" as const },
    },
  ]);

  const rows = await prisma.laptopReferenceSpec.findMany({
    where: { OR: or },
    take: 80,
  });

  let best = pickBestRow(rows, mo);
  if (best) return best;

  for (const man of brands) {
    const narrow = await prisma.laptopReferenceSpec.findMany({
      where: { manufacturer: { equals: man, mode: "insensitive" } },
      take: 250,
    });
    best = pickBestRow(narrow, mo);
    if (best) return best;
  }

  return null;
}

/** True when the imported catalog row has CPU plus RAM or storage. */
export function referenceRowIsStrong(row: LaptopReferenceSpec | null): boolean {
  return hasStrongReferenceFromFields(row);
}

/**
 * Looks up a retail-style reference row (imported dataset). Not a compatibility verdict.
 */
export async function lookupLaptopReference(
  make: string,
  model: string,
  locale: "fi" | "en" = "fi",
): Promise<string | null> {
  const best = await findLaptopReferenceRow(make, model);
  return best ? formatReferenceSummary(best, locale) : null;
}
