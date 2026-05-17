/** Parse admin bulk-import CSV for `ComputerModel` rows. */

export type ComputerModelCsvRow = {
  make: string;
  model: string;
  yearFrom: number | null;
  yearTo: number | null;
  compatible: boolean | null;
  verdict: string | null;
  ssdSlot: string | null;
  maxRamGb: number | null;
};

export type ComputerModelCsvParseResult = {
  rows: ComputerModelCsvRow[];
  errors: { line: number; message: string }[];
};

const HEADER_ALIASES: Record<string, keyof ComputerModelCsvRow | "skip"> = {
  make: "make",
  manufacturer: "make",
  brand: "make",
  valmistaja: "make",
  model: "model",
  malli: "model",
  yearfrom: "yearFrom",
  year_from: "yearFrom",
  from: "yearFrom",
  vuodesta: "yearFrom",
  yearto: "yearTo",
  year_to: "yearTo",
  to: "yearTo",
  vuoteen: "yearTo",
  compatible: "compatible",
  yhteensopiva: "compatible",
  verdict: "verdict",
  arvio: "verdict",
  ssdslot: "ssdSlot",
  ssd_slot: "ssdSlot",
  maxramgb: "maxRamGb",
  max_ram: "maxRamGb",
  maxram: "maxRamGb",
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, "");
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

function parseBool(raw: string): boolean | null {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  if (["true", "1", "yes", "kyllä", "kyla"].includes(v)) return true;
  if (["false", "0", "no", "ei"].includes(v)) return false;
  return null;
}

function parseIntOrNull(raw: string): number | null {
  const v = raw.trim();
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

export function parseComputerModelCsv(text: string): ComputerModelCsvParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  const errors: { line: number; message: string }[] = [];
  const rows: ComputerModelCsvRow[] = [];

  if (lines.length === 0) {
    return { rows, errors: [{ line: 0, message: "empty" }] };
  }

  const headerCells = parseCsvLine(lines[0]!);
  const colMap: (keyof ComputerModelCsvRow | null)[] = headerCells.map((h) => {
    const key = HEADER_ALIASES[normalizeHeader(h)];
    if (!key || key === "skip") return null;
    return key;
  });

  const hasMake = colMap.includes("make");
  const hasModel = colMap.includes("model");
  if (!hasMake || !hasModel) {
    return {
      rows: [],
      errors: [
        {
          line: 1,
          message: "missing_headers",
        },
      ],
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const lineNo = i + 1;
    const cells = parseCsvLine(lines[i]!);
    const draft: ComputerModelCsvRow = {
      make: "",
      model: "",
      yearFrom: null,
      yearTo: null,
      compatible: null,
      verdict: null,
      ssdSlot: null,
      maxRamGb: null,
    };

    colMap.forEach((key, idx) => {
      if (!key) return;
      const raw = cells[idx] ?? "";
      switch (key) {
        case "make":
          draft.make = raw.trim();
          break;
        case "model":
          draft.model = raw.trim();
          break;
        case "yearFrom":
          draft.yearFrom = parseIntOrNull(raw);
          break;
        case "yearTo":
          draft.yearTo = parseIntOrNull(raw);
          break;
        case "compatible":
          draft.compatible = parseBool(raw);
          break;
        case "verdict":
          draft.verdict = raw.trim() || null;
          break;
        case "ssdSlot":
          draft.ssdSlot = raw.trim() || null;
          break;
        case "maxRamGb": {
          const n = parseIntOrNull(raw);
          draft.maxRamGb = n;
          break;
        }
      }
    });

    if (!draft.make || !draft.model) {
      errors.push({ line: lineNo, message: "missing_make_model" });
      continue;
    }
    if (
      (draft.yearFrom != null && draft.yearFrom < 1990) ||
      (draft.yearTo != null && draft.yearTo > 2035)
    ) {
      errors.push({ line: lineNo, message: "invalid_year" });
      continue;
    }
    rows.push(draft);
  }

  return { rows, errors };
}
