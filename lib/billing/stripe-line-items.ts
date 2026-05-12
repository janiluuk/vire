import type { ServiceTier, SupportTier } from "@prisma/client";
import {
  dataMigrationAddonCents,
  getStripePriceIdForTier,
  serviceOrderTotalCents,
} from "./pricing";

export type CheckoutLineItem =
  | { price: string; quantity: number }
  | {
      quantity: number;
      price_data: {
        currency: "eur";
        unit_amount: number;
        product_data: {
          name: string;
          description?: string;
        };
      };
    };

function migrationStripeProduct(
  receiptLocale: "fi" | "en",
  size: "standard" | "large",
): { name: string; description: string } {
  if (receiptLocale === "en") {
    return {
      name: "Vire — Data transfer (Windows → Linux)",
      description:
        size === "large"
          ? "Large data volume (>100 GB estimated)"
          : "Files, photos, bookmarks, email settings",
    };
  }
  return {
    name: "Vire — Tiedonsiirto (Windows → Linux)",
    description:
      size === "large"
        ? "Suuri tietomäärä (>100 GB arvio)"
        : "Tiedostot, kuvat, kirjanmerkit, sähköpostiasetukset",
  };
}

export function buildServiceLineItems(
  tier: Exclude<ServiceTier, "B2B">,
  supportTier: SupportTier,
  migration: { size: "standard" | "large" } | null = null,
  receiptLocale: "fi" | "en" = "fi",
): CheckoutLineItem[] {
  const priceId = getStripePriceIdForTier(tier);
  const migrationCents = migration
    ? dataMigrationAddonCents(migration.size)
    : 0;

  const migrationProduct = migration
    ? migrationStripeProduct(receiptLocale, migration.size)
    : { name: "", description: "" };

  const migrationItem: CheckoutLineItem = {
    quantity: 1,
    price_data: {
      currency: "eur",
      unit_amount: migrationCents,
      product_data: {
        name: migrationProduct.name,
        description: migrationProduct.description,
      },
    },
  };

  if (priceId) {
    const items: CheckoutLineItem[] = [{ price: priceId, quantity: 1 }];
    if (migration) items.push(migrationItem);
    return items;
  }
  const amount = serviceOrderTotalCents(tier, supportTier);
  const items: CheckoutLineItem[] = [
    {
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: amount,
        product_data: {
          name: `Vire — ${tier}`,
          description: "Tietokoneen uusiokäyttöpalvelu",
        },
      },
    },
  ];
  if (migration) items.push(migrationItem);
  return items;
}

export function buildUsbLineItems(
  amountCents: number,
  priceId?: string,
): CheckoutLineItem[] {
  if (priceId) {
    return [{ price: priceId, quantity: 1 }];
  }
  return [
    {
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: amountCents,
        product_data: {
          name: "Vire — Linux-asennus-USB",
        },
      },
    },
  ];
}
