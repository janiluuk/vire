import { describe, expect, it } from "vitest";
import {
  bootTimeLabel,
  buildKoneetDetailDescription,
  compatibilityBadgeKey,
  DEFAULT_BOOT_AFTER_SSD_SEC,
} from "@/lib/koneet/koneet-detail";

describe("koneet-detail helpers", () => {
  it("maps compatibility to badge keys", () => {
    expect(compatibilityBadgeKey(true)).toBe("compatYes");
    expect(compatibilityBadgeKey(false)).toBe("compatNo");
    expect(compatibilityBadgeKey(null)).toBe("compatUnknown");
  });

  it("formats boot time labels", () => {
    expect(bootTimeLabel(14, "fi")).toContain("14");
    expect(bootTimeLabel(null, "en")).toBeNull();
  });

  it("uses default boot seconds constant", () => {
    expect(DEFAULT_BOOT_AFTER_SSD_SEC).toBe(14);
  });

  it("builds SEO descriptions with specs", () => {
    const desc = buildKoneetDetailDescription(
      {
        make: "Lenovo",
        model: "T450",
        compatible: true,
        verdict: "Hyvä päivityskohde.",
        ssdSlot: "2.5\" SATA",
        recommendedSsd: "Samsung 870 EVO 500GB",
      },
      "fi",
    );
    expect(desc).toContain("Lenovo T450");
    expect(desc).toContain("Samsung 870 EVO");
  });
});
