import type { ServiceTier } from "@prisma/client";

export type ServicePricingTierId = Exclude<ServiceTier, "B2B">;

export type ServicePricingTierConfig = {
  tier: ServicePricingTierId;
  nameKey:
    | "tierInstallOnly"
    | "tierBasic"
    | "tierRam"
    | "tierFull";
  descKey:
    | "tierInstallOnlyDesc"
    | "tierBasicDesc"
    | "tierRamDesc"
    | "tierFullDesc";
  featured: boolean;
  /** Keys under `home` namespace for HDD footnote on card. */
  noteKey?: "tierNoteBasic" | "tierNoteRam" | "tierNoteFull";
};

export const SERVICE_PRICING_TIERS: ServicePricingTierConfig[] = [
  {
    tier: "INSTALL_ONLY",
    nameKey: "tierInstallOnly",
    descKey: "tierInstallOnlyDesc",
    featured: false,
  },
  {
    tier: "SSD_BASIC",
    nameKey: "tierBasic",
    descKey: "tierBasicDesc",
    featured: true,
    noteKey: "tierNoteBasic",
  },
  {
    tier: "SSD_RAM",
    nameKey: "tierRam",
    descKey: "tierRamDesc",
    featured: false,
    noteKey: "tierNoteRam",
  },
  {
    tier: "FULL_SERVICE",
    nameKey: "tierFull",
    descKey: "tierFullDesc",
    featured: false,
    noteKey: "tierNoteFull",
  },
];
