import { DeliveryMethod, HddRemovalOption } from "@prisma/client";
import type { WizardSupportChoice, WizardTier } from "@/lib/wizard/wizard-types";

export type { WizardTier, WizardSupportChoice };

export function tierLabelKey(tier: WizardTier): string {
  switch (tier) {
    case "INSTALL_ONLY":
      return "tierInstallOnly";
    case "SSD_BASIC":
      return "tierBasic";
    case "SSD_RAM":
      return "tierRam";
    case "FULL_SERVICE":
      return "tierFull";
  }
}

export function deliveryLabelKey(method: DeliveryMethod): string {
  switch (method) {
    case "HOME_PICKUP":
      return "deliveryHome";
    case "DROP_OFF":
      return "deliveryPost";
    case "SELF":
      return "deliverySelf";
    default:
      return "deliveryHome";
  }
}

export function supportLabelKey(choice: WizardSupportChoice): string {
  switch (choice) {
    case "INCLUDED":
      return "supportIncludedTitle";
    case "CARE_PLUS":
      return "supportCarePlusTitle";
    case "CARE_PRO":
      return "supportCareProTitle";
  }
}

export function hddLabelKey(
  value: HddRemovalOption,
  tier: WizardTier | null,
): string {
  if (value === HddRemovalOption.SPARKKI_REMOVES) {
    return tier === "FULL_SERVICE" ? "hddSparkkiIncluded" : "hddSparkkiPaid";
  }
  if (value === HddRemovalOption.CUSTOMER_REMOVES) return "hddSelf";
  return "hddKeep";
}

/** Wizard step index for editing a summary section. */
export const WIZARD_STEP = {
  computer: 0,
  serviceDelivery: 1,
  supportAddons: 2,
  hdd: 3,
  contact: 4,
} as const;
