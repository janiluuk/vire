/**
 * Merge open reference datasets into data/reference-laptops.json.
 * Run: npx tsx scripts/build-reference-laptops.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  mergeReferenceLaptopRows,
  rowsFrom37DegreesCsv,
  rowsFromModernCsv,
} from "@/lib/specs/merge-reference-laptops";

const root = process.cwd();
const sourcesDir = path.join(root, "data/sources");

function readSource(name: string): string {
  return readFileSync(path.join(sourcesDir, name), "utf-8");
}

const merged = mergeReferenceLaptopRows([
  {
    source: "37degrees",
    rows: rowsFrom37DegreesCsv(readSource("laptops-37degrees.csv")),
  },
  {
    source: "modern-2025",
    rows: rowsFromModernCsv(readSource("laptops-modern-2025.csv")),
  },
  {
    source: "office-desktop",
    rows: rowsFrom37DegreesCsv(readSource("office-desktops.csv")),
  },
]);

const outPath = path.join(root, "data/reference-laptops.json");
writeFileSync(outPath, `${JSON.stringify(merged, null, 0)}\n`, "utf-8");

const byMfr = new Map<string, number>();
for (const r of merged) {
  byMfr.set(r.Manufacturer, (byMfr.get(r.Manufacturer) ?? 0) + 1);
}
console.log(`Wrote ${merged.length} rows → ${outPath}`);
console.log(
  "Top manufacturers:",
  [...byMfr.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12),
);
