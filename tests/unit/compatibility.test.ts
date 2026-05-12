import { describe, expect, it } from "vitest";
import { checkCompatibility } from "@/lib/specs/compatibility";

describe("checkCompatibility", () => {
  it("returns incompatible when DB says not compatible", () => {
    const r = checkCompatibility("Dell", "XPS", 8, "hdd", {
      compatible: false,
      verdict: "Ei NVMe-paikkaa",
    });
    expect(r.status).toBe("incompatible");
    expect(r.reasons[0]).toContain("NVMe");
  });

  it("returns compatible when DB approves", () => {
    const r = checkCompatibility("Lenovo", "T480", 16, "hdd", {
      compatible: true,
      verdict: "Sopii SSD-päivitykseen",
    });
    expect(r.status).toBe("compatible");
  });

  it("treats SSD disk as borderline speed gain", () => {
    const r = checkCompatibility("HP", "EliteBook", 8, "ssd", null);
    expect(r.status).toBe("borderline");
    expect(r.reasons).toContain("already_ssd");
  });

  it("flags missing make or model", () => {
    const r = checkCompatibility("", "x", null, null, null);
    expect(r.status).toBe("borderline");
    expect(r.reasons).toContain("missing_make_or_model");
  });
});
