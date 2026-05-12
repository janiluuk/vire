import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function recordAdminAudit(input: {
  actorEmail: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  await prisma.adminAuditLog.create({
    data: {
      actorEmail: input.actorEmail,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      metadata:
        input.metadata === null || input.metadata === undefined
          ? undefined
          : (input.metadata as Prisma.InputJsonValue),
    },
  });
}
