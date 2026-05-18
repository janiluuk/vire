import type { ModelCheckStatus, Prisma } from "@prisma/client";

export const MODELS_PAGE_SIZE = 50;

export function parseModelsListParams(searchParams?: {
  status?: string;
  q?: string;
  page?: string;
}): {
  where: Prisma.ComputerModelWhereInput;
  page: number;
  q: string;
} {
  const q = searchParams?.q?.trim() ?? "";
  const statusParam = searchParams?.status;
  const pageRaw = Number.parseInt(searchParams?.page ?? "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const where: Prisma.ComputerModelWhereInput = {};

  if (
    statusParam &&
    ["UNCHECKED", "IN_REVIEW", "APPROVED", "REJECTED"].includes(statusParam)
  ) {
    where.status = statusParam as ModelCheckStatus;
  }

  if (q.length > 0) {
    where.OR = [
      { make: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
      { slug: { contains: q.toLowerCase().replace(/\s+/g, "-"), mode: "insensitive" } },
    ];
  }

  return { where, page, q };
}
