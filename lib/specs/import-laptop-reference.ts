import { readFileSync } from "node:fs";
import type { PrismaClient } from "@prisma/client";
import {
  rowsFrom37DegreesJson,
  type ReferenceLaptopJsonRow,
} from "@/lib/specs/merge-reference-laptops";

export type ImportLaptopReferenceOptions = {
  /** Replace all rows (default). Set false to only insert when table is empty. */
  replace?: boolean;
  /** Skip import when table already has rows and replace is false. */
  skipIfPopulated?: boolean;
};

function toDbRow(row: ReferenceLaptopJsonRow) {
  return {
    manufacturer: row.Manufacturer.trim(),
    modelName: row["Model Name"].trim(),
    category: row.Category?.trim() || null,
    screenSize: row["Screen Size"]?.trim() || null,
    screenDetail: row.Screen?.trim() || null,
    cpu: row.CPU?.trim() || null,
    ram: row.RAM?.trim() || null,
    storage: row.Storage?.trim() || null,
    gpu: row.GPU?.trim() || null,
    operatingSystem: row["Operating System"]?.trim() || null,
    osVersion: row["Operating System Version"]?.trim() || null,
    weight: row.Weight?.trim() || null,
    priceEuros: row["Price (Euros)"]?.trim() || null,
  };
}

export function parseReferenceLaptopsJsonFile(
  jsonPath: string,
): ReferenceLaptopJsonRow[] {
  const raw = JSON.parse(readFileSync(jsonPath, "utf-8")) as Record<string, string>[];
  return rowsFrom37DegreesJson(raw);
}

export async function importLaptopReferenceSpecs(
  prisma: PrismaClient,
  rows: ReferenceLaptopJsonRow[],
  options: ImportLaptopReferenceOptions = {},
): Promise<{ imported: number; skipped: boolean }> {
  const replace = options.replace ?? true;
  const skipIfPopulated = options.skipIfPopulated ?? !replace;

  const existing = await prisma.laptopReferenceSpec.count();
  if (skipIfPopulated && existing > 0) {
    return { imported: 0, skipped: true };
  }

  const data = rows
    .map(toDbRow)
    .filter((r) => r.manufacturer.length > 0 && r.modelName.length > 0);

  if (replace && existing > 0) {
    await prisma.laptopReferenceSpec.deleteMany({});
  }

  const batchSize = 200;
  for (let i = 0; i < data.length; i += batchSize) {
    const chunk = data.slice(i, i + batchSize);
    if (chunk.length === 0) continue;
    await prisma.laptopReferenceSpec.createMany({ data: chunk });
  }

  return { imported: data.length, skipped: false };
}
