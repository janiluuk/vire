import type { ServiceTier, SupportTier } from "@prisma/client";
import type { AppBundleId } from "./app-bundles";
import { APP_BUNDLE_CENTS } from "./app-bundles";
import {
  DELIVERY_POST_CENTS,
  dataMigrationAddonCents,
  getStripePriceIdForTier,
  serviceOrderTotalCents,
} from "./pricing";
import { PORTABLE_VM_ADDON_CENTS } from "./portable-vm";

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
      name: "Sparkki — Data transfer (Windows → Linux)",
      description:
        size === "large"
          ? "Large data volume (>100 GB estimated)"
          : "Files, photos, bookmarks, email settings",
    };
  }
  return {
    name: "Sparkki — Tiedonsiirto (Windows → Linux)",
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
      name: "Sparkki — Shipping (return parcel)",
      description: "Postal round trip within Finland",
    };
  }
  return {
    name: "Sparkki — Postitus (paluu lähetys)",
    description: "Postituksen lisä maksu, koko Suomi",
  };
}

function hddRemovalStripeProduct(
  receiptLocale: "fi" | "en",
): { name: string; description: string } {
  if (receiptLocale === "en") {
    return {
      name: "Sparkki — HDD removal",
      description: "We remove the old hard drive as part of prep",
    };
  }
  return {
    name: "Sparkki — HDD-poisto",
    description: "Kiintolevyn irrotus valmistelussa",
  };
}

function appBundleStripeProduct(
  id: AppBundleId,
  receiptLocale: "fi" | "en",
): { name: string; description: string } {
  const names: Record<AppBundleId, { fi: string; en: string }> = {
    local_ai: {
      fi: "Ohjelmapaketti — paikallinen AI (LLM ja työkalut)",
      en: "App pack — local AI (LLM & tools)",
    },
    media_creator: {
      fi: "Ohjelmapaketti — media ja editointi",
      en: "App pack — media creation",
    },
    music_production: {
      fi: "Ohjelmapaketti — musiikintuotanto",
      en: "App pack — music production",
    },
    developer_essentials: {
      fi: "Ohjelmapaketti — kehittäjän peruspino",
      en: "App pack — developer essentials",
    },
  };
  const desc =
    receiptLocale === "en"
      ? "Selected during checkout — we install and configure on the new system."
      : "Valittu tilauksessa — asennamme ja konfiguroimme uuteen järjestelmään.";
  const n = names[id];
  return {
    name: receiptLocale === "en" ? n.en : n.fi,
    description: desc,
  };
}

function portableVmStripeProduct(
  receiptLocale: "fi" | "en",
): { name: string; description: string } {
  if (receiptLocale === "en") {
    return {
      name: "Sparkki — Portable VM / disk image (pre-install capture)",
      description:
        "Create a virtual-machine or disk image of the system state before Linux install — format agreed in intake. Customer responsible for OS licensing in any VM.",
    };
  }
  return {
    name: "Sparkki — Kannettava virtuaalikone / levykuva (ennen asennusta)",
    description:
      "Virtuaalikoneen tai levykuvan laatiminen järjestelmän tilasta ennen Linux-asennusta — muoto sovitaan käynnistyksessä. Käyttöjärjestelmän lisensointi VM:ssä on asiakkaan vastuulla.",
  };
}

export function buildServiceLineItems(
  tier: Exclude<ServiceTier, "B2B">,
  supportTier: SupportTier,
  migration: { size: "standard" | "large" } | null = null,
  receiptLocale: "fi" | "en" = "fi",
  extras?: {
    postShip?: boolean;
    hddSparkkiCents?: number;
    appBundles?: readonly AppBundleId[];
    portableVm?: boolean;
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
    typeof extras?.hddSparkkiCents === "number" ? extras.hddSparkkiCents : 0;
  const hddMeta = hddRemovalStripeProduct(receiptLocale);
  const hddItem: CheckoutLineItem = {
    quantity: 1,
    price_data: {
      currency: "eur",
      unit_amount: hddCents,
      product_data: { name: hddMeta.name, description: hddMeta.description },
    },
  };

  const bundleIds = extras?.appBundles ?? [];
  const bundleItems: CheckoutLineItem[] = bundleIds.map((id) => {
    const meta = appBundleStripeProduct(id, receiptLocale);
    return {
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: APP_BUNDLE_CENTS[id],
        product_data: { name: meta.name, description: meta.description },
      },
    };
  });

  const vmCents = extras?.portableVm ? PORTABLE_VM_ADDON_CENTS : 0;
  const vmMeta = portableVmStripeProduct(receiptLocale);
  const vmItem: CheckoutLineItem = {
    quantity: 1,
    price_data: {
      currency: "eur",
      unit_amount: vmCents,
      product_data: { name: vmMeta.name, description: vmMeta.description },
    },
  };

  if (priceId) {
    const items: CheckoutLineItem[] = [{ price: priceId, quantity: 1 }];
    if (migration) items.push(migrationItem);
    if (postCents > 0) items.push(postItem);
    if (hddCents > 0) items.push(hddItem);
    items.push(...bundleItems);
    if (vmCents > 0) items.push(vmItem);
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
          name: `Sparkki — ${tier}`,
          description: "Tietokoneen uusiokäyttöpalvelu",
        },
      },
    },
  ];
  if (migration) items.push(migrationItem);
  if (postCents > 0) items.push(postItem);
  if (hddCents > 0) items.push(hddItem);
  items.push(...bundleItems);
  if (vmCents > 0) items.push(vmItem);
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
          name: "Sparkki — Linux-asennus-USB",
        },
      },
    },
  ];
}

export function buildStarterKitLineItems(
  amountCents: number,
  priceId?: string,
  receiptLocale: "fi" | "en" = "fi",
): CheckoutLineItem[] {
  if (priceId) {
    return [{ price: priceId, quantity: 1 }];
  }
  const name =
    receiptLocale === "en"
      ? "Sparkki Starter Kit"
      : "Sparkki Starter Kit";
  const description =
    receiptLocale === "en"
      ? "Bootable USB, laminated quick-start card, keyboard stickers — postage included (Finland)"
      : "Käynnistettävä USB, laminoitu pika-aloituskortti, näppäintarrat — postitus sisältyy (Suomi)";
  return [
    {
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: amountCents,
        product_data: { name, description },
      },
    },
  ];
}
