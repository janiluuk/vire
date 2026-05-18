/** Structured hardware fields extracted from web search + LLM. */

export type LaptopStructuredSpecs = {
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
};

export const EMPTY_STRUCTURED_SPECS: LaptopStructuredSpecs = {
  cpu: null,
  ram: null,
  storage: null,
  gpu: null,
  display: null,
  weight: null,
  maxRamGb: null,
  ssdSlot: null,
  yearFrom: null,
  yearTo: null,
};

function pickInt(o: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
    if (typeof v === "string") {
      const n = parseInt(v.replace(/[^\d]/g, ""), 10);
      if (Number.isFinite(n) && n > 0 && n < 512) return n;
    }
  }
  return null;
}

function pickString(o: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string") {
      const t = v.trim();
      if (t.length > 0 && t.toLowerCase() !== "null" && t !== "—") return t;
    }
  }
  return null;
}

/** @internal exported for unit tests */
export function parseStructuredSpecs(
  o: Record<string, unknown> | null,
): LaptopStructuredSpecs {
  if (!o) return { ...EMPTY_STRUCTURED_SPECS };
  return {
    cpu: pickString(o, ["cpu", "processor", "suoritin", "proc"]),
    ram: pickString(o, ["ram", "memory", "muisti"]),
    storage: pickString(o, [
      "storage",
      "disk",
      "hdd",
      "ssd",
      "tallennus",
      "storageHdd",
      "storageSsd",
    ]),
    gpu: pickString(o, ["gpu", "graphics", "gpuModel", "naytonohjain", "videoCard"]),
    display: pickString(o, ["display", "screen", "naytto", "screenSize"]),
    weight: pickString(o, ["weight", "paino"]),
    maxRamGb: pickInt(o, ["maxRamGb", "max_ram_gb", "maxRam", "maxMemoryGb"]),
    ssdSlot: pickString(o, ["ssdSlot", "ssd_slot", "storageSlot", "driveBay"]),
    yearFrom: pickInt(o, ["yearFrom", "year_from", "releaseYear", "year"]),
    yearTo: pickInt(o, ["yearTo", "year_to"]),
  };
}

export function hasStructuredSpecs(s: LaptopStructuredSpecs): boolean {
  return Boolean(
    s.cpu ||
      s.ram ||
      s.storage ||
      s.gpu ||
      s.display ||
      s.weight ||
      s.maxRamGb != null ||
      s.ssdSlot ||
      s.yearFrom != null,
  );
}

export function mergeStructuredSpecs(
  base: LaptopStructuredSpecs,
  overlay: LaptopStructuredSpecs,
): LaptopStructuredSpecs {
  return {
    cpu: base.cpu ?? overlay.cpu,
    ram: base.ram ?? overlay.ram,
    storage: base.storage ?? overlay.storage,
    gpu: base.gpu ?? overlay.gpu,
    display: base.display ?? overlay.display,
    weight: base.weight ?? overlay.weight,
    maxRamGb: base.maxRamGb ?? overlay.maxRamGb,
    ssdSlot: base.ssdSlot ?? overlay.ssdSlot,
    yearFrom: base.yearFrom ?? overlay.yearFrom,
    yearTo: base.yearTo ?? overlay.yearTo,
  };
}
