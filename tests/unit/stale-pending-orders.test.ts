import { describe, expect, it } from "vitest";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { cancelStalePendingOrders } from "@/lib/orders/stale-pending-orders";

describe("cancelStalePendingOrders", () => {
  it("cancels only old PENDING orders", async () => {
    const old = await prisma.order.create({
      data: {
        status: OrderStatus.PENDING,
        tier: "SSD_BASIC",
        supportTier: "FULL",
        deliveryMethod: "SELF",
        priceEur: 7900,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
    });
    const recent = await prisma.order.create({
      data: {
        status: OrderStatus.PENDING,
        tier: "SSD_BASIC",
        supportTier: "FULL",
        deliveryMethod: "SELF",
        priceEur: 7900,
      },
    });

    const { cancelled } = await cancelStalePendingOrders(24 * 60 * 60 * 1000);
    expect(cancelled).toBeGreaterThanOrEqual(1);

    const oldRow = await prisma.order.findUnique({ where: { id: old.id } });
    const recentRow = await prisma.order.findUnique({ where: { id: recent.id } });
    expect(oldRow?.status).toBe(OrderStatus.CANCELLED);
    expect(recentRow?.status).toBe(OrderStatus.PENDING);

    await prisma.order.deleteMany({ where: { id: { in: [old.id, recent.id] } } });
  });
});
