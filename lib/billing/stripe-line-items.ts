import type { ServiceTier, SupportTier } from "@prisma/client";
import {
  APP_BUNDLE_CENTS,
  type AppBundleId,
} from "./app-bundles";
import {
  DELIVERY_POST_CENTS,
  PORTABLE_VM_ADDON_CENTS,
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

function portableVmStripeProduct(
  receiptLocale: "fi" | "en",
): { name: string; description: string } {
  if (receiptLocale === "en") {
    return {
      name: "Vire — Portable VM / disk image (pre-service)",
      description:
        "Capture of machine state before service. Format and medium as agreed; customer responsible for OS licensing in VM use.",
    };
  }
  return {
    name: "Vire — Siirrettävä VM / levykuva (ennen palvelua)",
    description:
      "Koneen tilan tallennus ennen huoltoa. Formaatti ja väline sovitaan; asiakas vastaa VM-käytön käyttöjärjestelmälisensseistä.",
  };
}

function appBundleStripeProduct(
  id: AppBundleId,
  receiptLocale: "fi" | "en",
): { name: string; description: string } {
  if (receiptLocale === "en") {
    switch (id) {
      case "local_ai":
        return {
          name: "Vire — App pack: Local AI",
          description: "LLM tools and local inference stack preinstall notes.",
        };
      case "media_creator":
        return {
          name: "Vire — App pack: Media creator",
          description: "Video, image, and audio creator tooling.",
        };
      case "music_production":
        return {
          name: "Vire — App pack: Music production",
          description: "DAW and plugin setup notes for Linux.",
        };
      case "dev_essentials":
        return {
          name: "Vire — App pack: Developer essentials",
          description: "Editors, runtimes, and dev utilities.",
        };
    }
  }
  switch (id) {
    case "local_ai":
      return {
        name: "Vire — Ohjelmistopaketti: paikallinen AI",
        description: "LLM-työkalut ja paikallinen inferenssipino; asennusohjeet.",
      };
    case "media_creator":
      return {
        name: "Vire — Ohjelmistopaketti: media",
        description: "Video-, kuva- ja äänityökalut.",
      };
    case "music_production":
      return {
        name: "Vire — Ohjelmistopaketti: musiikintuotanto",
        description: "DAW ja liitännäiset Linuxille; asennusohjeet.",
      };
    case "dev_essentials":
      return {
        name: "Vire — Ohjelmistopaketti: kehittäjä",
        description: "Editorit, ajoaikaympäristöt ja kehitystyökalut.",
      };
  }
}

export function buildServiceLineItems(
  tier: Exclude<ServiceTier, "B2B">,
  supportTier: SupportTier,
  migration: { size: "standard" | "large" } | null = null,
  receiptLocale: "fi" | "en" = "fi",
  extras?: {
    postShip?: boolean;
    hddVireCents?: number;
    appBundleIds?: AppBundleId[];
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

  const bundleIds = extras?.appBundleIds ?? [];
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
          name: `Vire — ${tier}`,
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
          name: "Vire — Linux-asennus-USB",
        },
      },
    },
  ];
}
