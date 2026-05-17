import type { DeliveryMethod, HddRemovalOption } from "@prisma/client";
import { SupportTier } from "@prisma/client";
import type { AppBundleId } from "@/lib/billing/app-bundles";
import { appBundlesAddonCents } from "@/lib/billing/app-bundles";
import { PORTABLE_VM_ADDON_CENTS } from "@/lib/billing/portable-vm";
import {
  deliveryAddonCents,
  hddRemovalAddonCents,
  serviceCheckoutTotalCents,
  serviceOrderTotalCents,
} from "@/lib/billing/pricing";

type Tier = "INSTALL_ONLY" | "SSD_BASIC" | "SSD_RAM" | "FULL_SERVICE";

export type WizardLiveTotalLine = {
  id: string;
  cents: number;
};

export type WizardLiveTotal = {
  /** False when no tier is chosen yet. */
  show: boolean;
  /** Sum of selected line items (may be partial before delivery is chosen). */
  totalCents: number;
  /** Matches `serviceCheckoutTotalCents` when all required checkout fields are set. */
  complete: boolean;
  /** Authoritative checkout total when `complete`; otherwise null. */
  checkoutTotalCents: number | null;
  lines: WizardLiveTotalLine[];
};

export function computeWizardLiveTotal(params: {
  tier: Tier | null;
  delivery: DeliveryMethod | null;
  hddRemoval: HddRemovalOption;
  appBundles: readonly AppBundleId[];
  portableVmOn: boolean;
  portableVmReady: boolean;
}): WizardLiveTotal {
  const { tier, delivery, hddRemoval, appBundles, portableVmOn, portableVmReady } =
    params;

  if (!tier) {
    return {
      show: false,
      totalCents: 0,
      complete: false,
      checkoutTotalCents: null,
      lines: [],
    };
  }

  const lines: WizardLiveTotalLine[] = [
    {
      id: "tier",
      cents: serviceOrderTotalCents(tier, SupportTier.FULL),
    },
  ];

  if (delivery) {
    const deliveryCents = deliveryAddonCents(delivery);
    if (deliveryCents > 0) {
      lines.push({ id: "delivery", cents: deliveryCents });
    }
  }

  const hddCents = hddRemovalAddonCents(tier, hddRemoval);
  if (hddCents > 0) {
    lines.push({ id: "hdd", cents: hddCents });
  }

  const bundleCents = appBundlesAddonCents(appBundles);
  if (bundleCents > 0) {
    lines.push({ id: "bundles", cents: bundleCents });
  }

  if (portableVmOn && portableVmReady) {
    lines.push({ id: "portableVm", cents: PORTABLE_VM_ADDON_CENTS });
  }

  const totalCents = lines.reduce((sum, l) => sum + l.cents, 0);

  const portableVmOk = !portableVmOn || portableVmReady;
  const complete = delivery != null && portableVmOk;

  const checkoutTotalCents = complete
    ? serviceCheckoutTotalCents({
        tier,
        supportTier: SupportTier.FULL,
        migration: null,
        deliveryMethod: delivery,
        hddRemoval,
        appBundles,
        portableVm: portableVmOn && portableVmReady,
      })
    : null;

  return {
    show: true,
    totalCents: checkoutTotalCents ?? totalCents,
    complete,
    checkoutTotalCents,
    lines,
  };
}
