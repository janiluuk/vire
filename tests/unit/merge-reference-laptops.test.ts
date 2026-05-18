import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  mergeReferenceLaptopRows,
  rowsFrom37DegreesCsv,
  rowsFromModernCsv,
} from "@/lib/specs/merge-reference-laptops";
import { hasStrongLookupReference } from "@/lib/specs/reference-laptop-strong";
import { toReferenceJsonRow } from "@/lib/specs/reference-laptop-row";

describe("merge-reference-laptops", () => {
  it("keeps multiple SKUs for the same model name", () => {
    const rows = [
      toReferenceJsonRow({
        manufacturer: "Dell",
        modelName: "XPS 13",
        cpu: "Intel i5",
        ram: "8GB",
        storage: "256GB SSD",
      }),
      toReferenceJsonRow({
        manufacturer: "Dell",
        modelName: "XPS 13",
        cpu: "Intel i7",
        ram: "16GB",
        storage: "512GB SSD",
      }),
    ];
    const merged = mergeReferenceLaptopRows([{ source: "37degrees", rows }]);
    expect(merged).toHaveLength(2);
  });

  it("dedupes identical SKU rows across sources", () => {
    const row = toReferenceJsonRow({
      manufacturer: "Lenovo",
      modelName: "ThinkPad T450",
      cpu: "Intel i5",
      ram: "8GB",
      storage: "500GB HDD",
    });
    const merged = mergeReferenceLaptopRows([
      { source: "37degrees", rows: [row] },
      { source: "modern-2025", rows: [{ ...row }] },
    ]);
    expect(merged).toHaveLength(1);
  });

  it("builds a catalog larger than unique model names only", () => {
    const csvPath = path.join(
      process.cwd(),
      "data/sources/laptops-37degrees.csv",
    );
    const csv = readFileSync(csvPath, "utf-8");
    const base = rowsFrom37DegreesCsv(csv);
    const merged = mergeReferenceLaptopRows([
      { source: "37degrees", rows: base },
      {
        source: "modern-2025",
        rows: rowsFromModernCsv(
          readFileSync(
            path.join(process.cwd(), "data/sources/laptops-modern-2025.csv"),
            "utf-8",
          ),
        ),
      },
    ]);
    const uniqueModels = new Set(
      merged.map((r) => `${r.Manufacturer}|${r["Model Name"]}`),
    );
    expect(base.length).toBeGreaterThan(1000);
    expect(merged.length).toBeGreaterThan(uniqueModels.size);
  });
});

describe("reference-laptop-strong", () => {
  it("requires cpu and ram or storage", () => {
    expect(
      hasStrongLookupReference({
        cpu: "Intel i5",
        ram: "8GB",
        storage: null,
        gpu: null,
        display: null,
        weight: null,
        summary: "x",
      }),
    ).toBe(true);
    expect(
      hasStrongLookupReference({
        cpu: null,
        ram: "8GB",
        storage: "256GB SSD",
        gpu: null,
        display: null,
        weight: null,
        summary: "x",
      }),
    ).toBe(false);
  });
});
