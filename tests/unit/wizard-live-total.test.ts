import { describe, expect, it } from "vitest";
import { HddRemovalOption } from "@prisma/client";
import { computeWizardLiveTotal } from "@/lib/wizard/wizard-live-total";
import { serviceCheckoutTotalCents } from "@/lib/billing/pricing";
import { SupportTier } from "@prisma/client";

describe("computeWizardLiveTotal", () => {
  it("shows tier-only partial total before delivery", () => {
    const live = computeWizardLiveTotal({
      tier: "INSTALL_ONLY",
      delivery: null,
      hddRemoval: HddRemovalOption.CUSTOMER_KEEPS,
      appBundles: [],
      portableVmOn: false,
      portableVmReady: false,
    });
    expect(live.show).toBe(true);
    expect(live.complete).toBe(false);
    expect(live.checkoutTotalCents).toBeNull();
    expect(live.totalCents).toBe(59_00);
  });

  it("matches checkout total when complete", () => {
    const live = computeWizardLiveTotal({
      tier: "SSD_BASIC",
      delivery: "DROP_OFF",
      hddRemoval: HddRemovalOption.CUSTOMER_KEEPS,
      appBundles: [],
      portableVmOn: false,
      portableVmReady: false,
    });
    const expected = serviceCheckoutTotalCents({
      tier: "SSD_BASIC",
      supportTier: SupportTier.FULL,
      migration: null,
      deliveryMethod: "DROP_OFF",
      hddRemoval: HddRemovalOption.CUSTOMER_KEEPS,
      appBundles: [],
      portableVm: false,
    });
    expect(live.complete).toBe(true);
    expect(live.checkoutTotalCents).toBe(expected);
    expect(live.totalCents).toBe(expected);
  });
});
