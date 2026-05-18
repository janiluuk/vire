/**
 * Import data/reference-laptops.json into LaptopReferenceSpec.
 * Run: npx tsx scripts/import-laptop-reference.ts [--only-if-empty]
 */
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  importLaptopReferenceSpecs,
  parseReferenceLaptopsJsonFile,
} from "@/lib/specs/import-laptop-reference";

const prisma = new PrismaClient();
const onlyIfEmpty = process.argv.includes("--only-if-empty");
const jsonPath = path.join(process.cwd(), "data/reference-laptops.json");

async function main() {
  const rows = parseReferenceLaptopsJsonFile(jsonPath);
  const result = await importLaptopReferenceSpecs(prisma, rows, {
    replace: !onlyIfEmpty,
    skipIfPopulated: onlyIfEmpty,
  });
  if (result.skipped) {
    console.log("LaptopReferenceSpec already populated; skipped (--only-if-empty).");
  } else {
    console.log(`Imported ${result.imported} LaptopReferenceSpec rows.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
