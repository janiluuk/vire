import { prisma } from "@/lib/db/prisma";
import { computerModelSlug } from "@/lib/site/computer-model-slug";

export function slugForComputerModel(make: string, model: string): string {
  return computerModelSlug(make, model);
}

/** Persist URL slug on create/update (unique per make+model). */
export function computerModelSlugFields(make: string, model: string) {
  return { slug: slugForComputerModel(make, model) };
}

export async function findComputerModelBySlug(slug: string) {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  const byColumn = await prisma.computerModel.findUnique({
    where: { slug: normalized },
  });
  if (byColumn) return byColumn;

  const candidates = await prisma.computerModel.findMany({
    where: {
      OR: [
        { make: { contains: normalized.split("-")[0] ?? "", mode: "insensitive" } },
      ],
    },
    take: 80,
    orderBy: [{ make: "asc" }, { model: "asc" }],
  });
  return (
    candidates.find((m) => computerModelSlug(m.make, m.model) === normalized) ??
    null
  );
}

export async function searchComputerModels(query: string, limit = 120) {
  const q = query.trim();
  if (!q) {
    return prisma.computerModel.findMany({
      orderBy: [{ make: "asc" }, { model: "asc" }],
      take: limit,
    });
  }
  return prisma.computerModel.findMany({
    where: {
      OR: [
        { make: { contains: q, mode: "insensitive" } },
        { model: { contains: q, mode: "insensitive" } },
        { slug: { contains: q.toLowerCase().replace(/\s+/g, "-"), mode: "insensitive" } },
      ],
    },
    orderBy: [{ make: "asc" }, { model: "asc" }],
    take: limit,
  });
}
