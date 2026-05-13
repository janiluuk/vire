import { describe, expect, it } from "vitest";
import type { Order, UsbOrder } from "@prisma/client";
import { toPublicServiceOrder, toPublicUsbOrder } from "@/lib/orders/public-order";

const baseOrder = {
  id: "clorder1234567890",
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  updatedAt: new Date("2026-01-02T12:00:00.000Z"),
  status: "CONFIRMED" as const,
  tier: "SSD_BASIC" as const,
  supportTier: "EMAIL" as const,
  deliveryMethod: "SELF" as const,
  computerMake: "Lenovo",
  computerModel: "T450",
  customerName: "Test User",
  customerEmail: "test@example.com",
  customerPhone: null,
  hddRemoval: "SPARKKI_REMOVES" as const,
  address: null,
  preferredDate: null,
  notes: null,
  stripeSessionId: null,
  priceEur: 19900,
  adminNotes: "secret",
  completedAt: null,
  locale: "fi",
  dataMigration: false,
  dataMigrationSize: null,
  dataMigrationNotes: null,
  appBundleIds: [],
  portableVmAddon: false,
  portableVmHandoff: null,
} satisfies Order;

const baseUsb = {
  id: "clusb12345678901234",
  createdAt: new Date("2026-03-01T08:00:00.000Z"),
  status: "pending",
  customerName: "Usb User",
  customerEmail: "usb@example.com",
  address: "Line 1\nFI-00100 Helsinki",
  stripeSessionId: null,
  locale: "fi",
} satisfies UsbOrder;

describe("public order DTOs", () => {
  it("strips admin fields from service order", () => {
    const dto = toPublicServiceOrder(baseOrder);
    expect(dto).not.toHaveProperty("adminNotes");
    expect(dto).not.toHaveProperty("stripeSessionId");
    expect(dto.kind).toBe("service");
    expect(dto.customerEmail).toBe("test@example.com");
    expect(dto).not.toHaveProperty("stripeSessionId");
    expect(dto.kind).toBe("service");
    expect(dto.priceEur).toBe(19900);
    expect(dto.createdAt).toMatch(/^\d{4}-/);
    expect(dto.appBundleIds).toEqual([]);
  });

  it("includes app bundle ids on the public DTO", () => {
    const dto = toPublicServiceOrder({
      ...baseOrder,
      appBundleIds: ["local_ai", "media_creator"],
    });
    expect(dto.appBundleIds).toEqual(["local_ai", "media_creator"]);
  });

  it("includes portable VM fields on the public DTO", () => {
    const dto = toPublicServiceOrder({
      ...baseOrder,
      portableVmAddon: true,
      portableVmHandoff: "CUSTOMER_STORAGE",
    });
    expect(dto.portableVmAddon).toBe(true);
    expect(dto.portableVmHandoff).toBe("CUSTOMER_STORAGE");
  });

  it("maps USB order", () => {
    const dto = toPublicUsbOrder(baseUsb);
    expect(dto.kind).toBe("usb");
    expect(dto.address).toContain("Helsinki");
  });
});
