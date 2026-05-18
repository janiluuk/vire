import { prisma } from "@/lib/db/prisma";

/** Remove expired laptop spec cache rows (and optional stale empty entries). */
export async function purgeExpiredLaptopSpecsCache(now = new Date()): Promise<{
  deleted: number;
}> {
  const result = await prisma.laptopSpecsInternetCache.deleteMany({
    where: { expiresAt: { lt: now } },
  });
  return { deleted: result.count };
}
