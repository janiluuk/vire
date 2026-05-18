import {
  normalizeReferenceSkuKey,
  referenceRowRichness,
  toReferenceJsonRow,
  type ReferenceLaptopJsonRow,
  type ReferenceLaptopSource,
} from "@/lib/specs/reference-laptop-row";

export type MergedReferenceRow = ReferenceLaptopJsonRow & {
  _source?: ReferenceLaptopSource;
};

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

function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]!);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]!);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

/** 37Degrees / Mainak `laptops.csv` and `reference-laptops.json` column names. */
export function rowsFrom37DegreesCsv(csv: string): ReferenceLaptopJsonRow[] {
  return parseCsv(csv)
    .map((row) =>
      toReferenceJsonRow({
        manufacturer: row["Manufacturer"] ?? "",
        modelName: row["Model Name"] ?? "",
        category: row["Category"],
        screenSize: row["Screen Size"],
        screen: row["Screen"],
        cpu: row["CPU"],
        ram: row["RAM"],
        storage: (row["Storage"] ?? row[" Storage"] ?? "").trim(),
        gpu: row["GPU"],
        operatingSystem: row["Operating System"],
        osVersion: row["Operating System Version"],
        priceEuros: row["Price (Euros)"] ?? row["Price"],
        weight: row["Weight"],
      }),
    )
    .filter((r) => r.Manufacturer && r["Model Name"]);
}

export function rowsFrom37DegreesJson(
  rows: Record<string, string>[],
): ReferenceLaptopJsonRow[] {
  return rows
    .map((row) =>
      toReferenceJsonRow({
        manufacturer: row["Manufacturer"] ?? "",
        modelName: row["Model Name"] ?? "",
        category: row["Category"],
        screenSize: row["Screen Size"],
        screen: row["Screen"],
        cpu: row["CPU"],
        ram: row["RAM"],
        storage: row["Storage"],
        gpu: row["GPU"],
        operatingSystem: row["Operating System"],
        osVersion: row["Operating System Version"],
        weight: row["Weight"],
        priceEuros: row["Price (Euros)"],
      }),
    )
    .filter((r) => r.Manufacturer && r["Model Name"]);
}

/** sohaibdevv/laptop-prices-assignment — 2025–2026 retail SKUs. */
export function rowsFromModernCsv(csv: string): ReferenceLaptopJsonRow[] {
  return parseCsv(csv)
    .map((row) => {
      const brand = (row["Brand"] ?? row["Company"] ?? "").trim();
      const model = (row["Model"] ?? row["Product"] ?? "").trim();
      const ramGb = (row["RAM_GB"] ?? row["Ram"] ?? "").trim();
      const storageGb = (row["Storage_GB"] ?? row["Memory"] ?? "").trim();
      const storage =
        storageGb && !/gb|tb|ssd|hdd/i.test(storageGb)
          ? `${storageGb} GB SSD`
          : storageGb;
      return toReferenceJsonRow({
        manufacturer: brand,
        modelName: model,
        category: row["Category"] ?? row["TypeName"] ?? "Notebook",
        cpu: row["CPU"] ?? "",
        ram: ramGb ? (/gb/i.test(ramGb) ? ramGb : `${ramGb} GB`) : "",
        storage,
        gpu: row["GPU"] ?? "",
        priceEuros: row["Price_USD"] ?? row["Price_euros"] ?? "",
      });
    })
    .filter((r) => r.Manufacturer && r["Model Name"]);
}

/**
 * Merges source rows; dedupes identical SKUs (make+model+CPU+RAM+storage).
 * Different configurations of the same model name are kept.
 */
export function mergeReferenceLaptopRows(
  batches: { source: ReferenceLaptopSource; rows: ReferenceLaptopJsonRow[] }[],
): ReferenceLaptopJsonRow[] {
  const map = new Map<string, MergedReferenceRow>();

  for (const { source, rows } of batches) {
    for (const row of rows) {
      const key = normalizeReferenceSkuKey(row);
      const existing = map.get(key);
      if (!existing || referenceRowRichness(row) > referenceRowRichness(existing)) {
        map.set(key, { ...row, _source: source });
      }
    }
  }

  return Array.from(map.values())
    .map((entry) => {
      const row = { ...entry };
      delete row._source;
      return row;
    })
    .sort((a, b) => {
      const ma = a.Manufacturer.localeCompare(b.Manufacturer);
      if (ma !== 0) return ma;
      return a["Model Name"].localeCompare(b["Model Name"]);
    });
}
