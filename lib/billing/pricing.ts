import type {
  DeliveryMethod,
  HddRemovalOption,
  ServiceTier,
  SupportTier,
} from "@prisma/client";

/** Default EUR prices in cents when Stripe Price IDs are not set. */
export const TIER_BASE_CENTS: Record<
  Exclude<ServiceTier, "B2B">,
  number
> = {
  SSD_BASIC: 79_00,
  SSD_RAM: 119_00,
  FULL_SERVICE: 189_00,
};

const SUPPORT_ADJUST_CENTS: Record<SupportTier, number> = {
  FULL: 0,
  EMAIL: -15_00,
  DISCORD_ONLY: -25_00,
};

export function serviceOrderTotalCents(
  tier: ServiceTier,
  supportTier: SupportTier,
): number {
  if (tier === "B2B") {
    throw new Error("b2b_requires_quote");
  }
  const base = TIER_BASE_CENTS[tier];
  const adj = SUPPORT_ADJUST_CENTS[supportTier];
  return Math.max(base + adj, Math.floor(base * 0.7));
}

/** Optional file migration add-on (FEATURES.md #1), EUR cents. */
export const DATA_MIGRATION_STANDARD_CENTS = 35_00;
export const DATA_MIGRATION_LARGE_CENTS = 50_00;

/** Postitus (DROP_OFF) — EUR cents. */
export const DELIVERY_POST_CENTS = 15_00;

/** HDD removal by Vire — EUR cents (waived when tier already includes it). */
export const HDD_REMOVAL_VIRE_CENTS = 20_00;

export function deliveryAddonCents(method: DeliveryMethod): number {
  return method === "DROP_OFF" ? DELIVERY_POST_CENTS : 0;
}

export function hddRemovalAddonCents(
  tier: Exclude<ServiceTier, "B2B">,
  option: HddRemovalOption,
): number {
  if (option !== "VIRE_REMOVES") return 0;
  if (tier === "FULL_SERVICE") return 0;
  return HDD_REMOVAL_VIRE_CENTS;
}

export function dataMigrationAddonCents(
  size: "standard" | "large",
): number {
  return size === "large" ? DATA_MIGRATION_LARGE_CENTS : DATA_MIGRATION_STANDARD_CENTS;
}

export function serviceOrderTotalWithMigrationCents(
  tier: ServiceTier,
  supportTier: SupportTier,
  migration: { size: "standard" | "large" } | null,
): number {
  const base = serviceOrderTotalCents(tier, supportTier);
  if (!migration) return base;
  return base + dataMigrationAddonCents(migration.size);
}

/** Full service checkout total including delivery + HDD removal rules. */
export function serviceCheckoutTotalCents(params: {
  tier: Exclude<ServiceTier, "B2B">;
  supportTier: SupportTier;
  migration: { size: "standard" | "large" } | null;
  deliveryMethod: DeliveryMethod;
  hddRemoval: HddRemovalOption;
}): number {
  let total = serviceOrderTotalWithMigrationCents(
    params.tier,
    params.supportTier,
    params.migration,
  );
  total += deliveryAddonCents(params.deliveryMethod);
  total += hddRemovalAddonCents(params.tier, params.hddRemoval);
  return total;
}

export const USB_ORDER_CENTS = 990;

const TIER_ENV_KEYS: Record<Exclude<ServiceTier, "B2B">, string> = {
  SSD_BASIC: "STRIPE_PRICE_SSD_BASIC",
  SSD_RAM: "STRIPE_PRICE_SSD_RAM",
  FULL_SERVICE: "STRIPE_PRICE_FULL_SERVICE",
};

export function getStripePriceIdForTier(
  tier: Exclude<ServiceTier, "B2B">,
): string | undefined {
  const key = TIER_ENV_KEYS[tier];
  const v = process.env[key];
  return v && v.length > 0 ? v : undefined;
}

export function getUsbStripePriceId(): string | undefined {
  const v = process.env.STRIPE_PRICE_USB_STICK;
  return v && v.length > 0 ? v : undefined;
}
