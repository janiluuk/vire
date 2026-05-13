import type { ServiceTier, SupportTier } from "@prisma/client";
import {
  DELIVERY_POST_CENTS,
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

function deliveryShipStripeProduct(
  receiptLocale: "fi" | "en",
): { name: string; description: string } {
  if (receiptLocale === "en") {
    return {
      name: "Vire — Shipping (return parcel)",
      description: "Postal round trip within Finland",
    };
  }
  return {
    name: "Vire — Postitus (paluu lähetys)",
    description: "Postituksen lisä maksu, koko Suomi",
  };
}

function hddRemovalStripeProduct(
  receiptLocale: "fi" | "en",
): { name: string; description: string } {
  if (receiptLocale === "en") {
    return {
      name: "Vire — HDD removal",
      description: "We remove the old hard drive as part of prep",
    };
  }
  return {
    name: "Vire — HDD-poisto",
    description: "Kiintolevyn irrotus valmistelussa",
  };
}

export function buildServiceLineItems(
  tier: Exclude<ServiceTier, "B2B">,
  supportTier: SupportTier,
  migration: { size: "standard" | "large" } | null = null,
  receiptLocale: "fi" | "en" = "fi",
  extras?: {
    postShip?: boolean;
    hddVireCents?: number;
  },
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

  const postCents = extras?.postShip ? DELIVERY_POST_CENTS : 0;
  const postMeta = deliveryShipStripeProduct(receiptLocale);
  const postItem: CheckoutLineItem = {
    quantity: 1,
    price_data: {
      currency: "eur",
      unit_amount: postCents,
      product_data: { name: postMeta.name, description: postMeta.description },
    },
  };

  const hddCents =
    typeof extras?.hddVireCents === "number" ? extras.hddVireCents : 0;
  const hddMeta = hddRemovalStripeProduct(receiptLocale);
  const hddItem: CheckoutLineItem = {
    quantity: 1,
    price_data: {
      currency: "eur",
      unit_amount: hddCents,
      product_data: { name: hddMeta.name, description: hddMeta.description },
    },
  };

  if (priceId) {
    const items: CheckoutLineItem[] = [{ price: priceId, quantity: 1 }];
    if (migration) items.push(migrationItem);
    if (postCents > 0) items.push(postItem);
    if (hddCents > 0) items.push(hddItem);
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
  if (postCents > 0) items.push(postItem);
  if (hddCents > 0) items.push(hddItem);
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
