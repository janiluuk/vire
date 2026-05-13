import type { TestInfo } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function skipAdminE2eIfNoDatabase(testInfo: TestInfo) {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    testInfo.skip(
      true,
      "Postgres not reachable. For admin E2E: docker compose up -d db && npx prisma migrate deploy && npx prisma db seed",
    );
  }
}

export async function disconnectPrismaE2e() {
  await prisma.$disconnect();
}
