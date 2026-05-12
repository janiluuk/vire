import type { DeliveryMethod, Order, OrderStatus, ServiceTier, SupportTier } from "@prisma/client";
import type { UsbOrder } from "@prisma/client";

export type PublicServiceOrder = {
  kind: "service";
  id: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  tier: ServiceTier;
  supportTier: SupportTier;
  deliveryMethod: DeliveryMethod;
  computerMake: string | null;
  computerModel: string | null;
  customerName: string;
  customerPhone: string | null;
  address: string | null;
  preferredDate: string | null;
  notes: string | null;
  priceEur: number;
  dataMigration: boolean;
  dataMigrationSize: string | null;
};

export type PublicUsbOrder = {
  kind: "usb";
  id: string;
  createdAt: string;
  status: string;
  customerName: string;
  address: string;
};

function iso(d: Date) {
  return d.toISOString();
}

export function toPublicServiceOrder(order: Order): PublicServiceOrder {
  return {
    kind: "service",
    id: order.id,
    createdAt: iso(order.createdAt),
    updatedAt: iso(order.updatedAt),
    status: order.status,
    tier: order.tier,
    supportTier: order.supportTier,
    deliveryMethod: order.deliveryMethod,
    computerMake: order.computerMake,
    computerModel: order.computerModel,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    address: order.address,
    preferredDate: order.preferredDate ? iso(order.preferredDate) : null,
    notes: order.notes,
    priceEur: order.priceEur,
    dataMigration: order.dataMigration,
    dataMigrationSize: order.dataMigrationSize,
  };
}

export function toPublicUsbOrder(order: UsbOrder): PublicUsbOrder {
  return {
    kind: "usb",
    id: order.id,
    createdAt: iso(order.createdAt),
    status: order.status,
    customerName: order.customerName,
    address: order.address,
  };
}
