import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export async function cancelStalePendingOrders(
  maxAgeMs = DEFAULT_MAX_AGE_MS,
): Promise<{ cancelled: number }> {
  const cutoff = new Date(Date.now() - maxAgeMs);
  const result = await prisma.order.updateMany({
    where: {
      status: OrderStatus.PENDING,
      createdAt: { lt: cutoff },
    },
    data: {
      status: OrderStatus.CANCELLED,
    },
  });
  return { cancelled: result.count };
}
