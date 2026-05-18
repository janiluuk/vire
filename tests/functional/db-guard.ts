import { prisma } from "@/lib/db/prisma";

/** Throws with a clear message when migrations were not applied. */
export async function requireMigratedDatabase(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1 FROM "Order" LIMIT 1`;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err);
    if (
      message.includes("does not exist") ||
      message.includes("P2021") ||
      message.includes("relation")
    ) {
      throw new Error(
        "Functional tests need a migrated database. Run: npx prisma migrate deploy",
      );
    }
    throw err;
  }
}
