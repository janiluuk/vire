import { prisma } from "@/lib/db/prisma";
import {
  hasStructuredSpecs,
  type LaptopStructuredSpecs,
} from "@/lib/specs/laptop-specs-structured";
import { manufacturerCandidates } from "@/lib/specs/laptop-reference-lookup";

/**
 * Upsert a retail-style reference row from AI/web discovery so repeat lookups
 * get structured CPU/RAM/storage without another web round-trip.
 */
export async function persistWebReferenceSpec(
  make: string,
  model: string,
  specs: LaptopStructuredSpecs,
): Promise<void> {
  if (!hasStructuredSpecs(specs)) return;

  const mo = model.trim();
  if (mo.length < 2) return;

  const brands = make.trim() ? manufacturerCandidates(make) : [];
  const manufacturer = (brands[0] ?? make.trim()) || "Unknown";

  const existing = await prisma.laptopReferenceSpec.findFirst({
    where: {
      modelName: { equals: mo, mode: "insensitive" },
      ...(manufacturer !== "Unknown"
        ? { manufacturer: { equals: manufacturer, mode: "insensitive" } }
        : {}),
    },
  });

  const data = {
    manufacturer: existing?.manufacturer ?? manufacturer,
    modelName: existing?.modelName ?? mo,
    cpu: existing?.cpu ?? specs.cpu,
    ram: existing?.ram ?? specs.ram,
    storage: existing?.storage ?? specs.storage,
    gpu: existing?.gpu ?? specs.gpu,
    screenSize: existing?.screenSize ?? specs.display,
    weight: existing?.weight ?? specs.weight,
  };

  if (existing) {
    await prisma.laptopReferenceSpec.update({
      where: { id: existing.id },
      data,
    });
    return;
  }

  await prisma.laptopReferenceSpec.create({
    data: {
      ...data,
      category: "Laptop (web discovery)",
    },
  });
}
