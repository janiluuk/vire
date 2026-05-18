/** Canonical retail-style row for `data/reference-laptops.json` / `LaptopReferenceSpec`. */

export type ReferenceLaptopJsonRow = {
  Manufacturer: string;
  "Model Name": string;
  Category: string;
  "Screen Size": string;
  Screen: string;
  CPU: string;
  RAM: string;
  Storage: string;
  GPU: string;
  "Operating System": string;
  "Operating System Version": string;
  Weight: string;
  "Price (Euros)": string;
};

export type ReferenceLaptopSource =
  | "37degrees"
  | "modern-2025"
  | "office-desktop";

export function normalizeReferenceKey(manufacturer: string, modelName: string): string {
  return `${manufacturer.trim().toLowerCase()}|${modelName.trim().toLowerCase()}`;
}

/** Uniqueness for catalog rows — same model with different CPU/RAM stays separate. */
export function normalizeReferenceSkuKey(row: ReferenceLaptopJsonRow): string {
  const parts = [
    row.Manufacturer,
    row["Model Name"],
    row.CPU,
    row.RAM,
    row.Storage,
  ].map((p) => p.trim().toLowerCase());
  return parts.join("|");
}

export function referenceRowRichness(row: ReferenceLaptopJsonRow): number {
  let score = 0;
  if (row.CPU?.trim()) score += 3;
  if (row.RAM?.trim()) score += 2;
  if (row.Storage?.trim()) score += 2;
  if (row.GPU?.trim()) score += 1;
  if (row.Screen?.trim() || row["Screen Size"]?.trim()) score += 1;
  if (row.Weight?.trim()) score += 1;
  return score;
}

export function toReferenceJsonRow(p: {
  manufacturer: string;
  modelName: string;
  category?: string;
  screenSize?: string;
  screen?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  operatingSystem?: string;
  osVersion?: string;
  weight?: string;
  priceEuros?: string;
}): ReferenceLaptopJsonRow {
  return {
    Manufacturer: p.manufacturer.trim(),
    "Model Name": p.modelName.trim(),
    Category: p.category?.trim() ?? "",
    "Screen Size": p.screenSize?.trim() ?? "",
    Screen: p.screen?.trim() ?? "",
    CPU: p.cpu?.trim() ?? "",
    RAM: p.ram?.trim() ?? "",
    Storage: p.storage?.trim() ?? "",
    GPU: p.gpu?.trim() ?? "",
    "Operating System": p.operatingSystem?.trim() ?? "",
    "Operating System Version": p.osVersion?.trim() ?? "",
    Weight: p.weight?.trim() ?? "",
    "Price (Euros)": p.priceEuros?.trim() ?? "",
  };
}
