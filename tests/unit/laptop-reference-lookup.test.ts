import { describe, expect, it } from "vitest";
import {
  coerceLaptopMakeModelForLookup,
  formatReferenceSummary,
  manufacturerCandidates,
  normalizeSpecToken,
} from "@/lib/specs/laptop-reference-lookup";
import type { LaptopReferenceSpec } from "@prisma/client";

function ref(p: Partial<LaptopReferenceSpec>): LaptopReferenceSpec {
  return {
    id: "test-id",
    manufacturer: "TestCo",
    modelName: "TestBook",
    category: null,
    screenSize: null,
    screenDetail: null,
    cpu: null,
    ram: null,
    storage: null,
    gpu: null,
    operatingSystem: null,
    osVersion: null,
    weight: null,
    priceEuros: null,
    ...p,
  };
}

describe("laptop-reference-lookup", () => {
  it("normalizes tokens", () => {
    expect(normalizeSpecToken("  Foo–Bar  ")).toBe("foo-bar");
  });

  it("expands ThinkPad to Lenovo", () => {
    const c = manufacturerCandidates("ThinkPad");
    expect(c).toContain("Lenovo");
  });

  it("formats Finnish reference block", () => {
    const s = formatReferenceSummary(
      ref({
        manufacturer: "Dell",
        modelName: "XPS 13",
        cpu: "Intel i5",
        ram: "8GB",
        storage: "256GB SSD",
      }),
      "fi",
    );
    expect(s).toContain("Suoritin");
    expect(s).toContain("Intel i5");
    expect(s).toContain("8GB");
  });

  it("formats English reference block", () => {
    const s = formatReferenceSummary(
      ref({ cpu: "Intel i5", ram: "8GB" }),
      "en",
    );
    expect(s).toContain("CPU:");
    expect(s).toContain("Intel i5");
  });

  it("coerce: keeps separate make and model", () => {
    expect(coerceLaptopMakeModelForLookup("Lenovo", "T450")).toEqual({
      make: "Lenovo",
      model: "T450",
    });
  });

  it("coerce: splits full name in model field only", () => {
    expect(coerceLaptopMakeModelForLookup(null, "Lenovo ThinkPad T450")).toEqual({
      make: "Lenovo",
      model: "ThinkPad T450",
    });
  });

  it("coerce: infers Lenovo from ThinkPad line", () => {
    expect(coerceLaptopMakeModelForLookup("", "ThinkPad T450")).toEqual({
      make: "Lenovo",
      model: "T450",
    });
  });

  it("coerce: splits unknown two-word as make + model", () => {
    expect(coerceLaptopMakeModelForLookup(undefined, "Chuwi LapBook")).toEqual({
      make: "Chuwi",
      model: "LapBook",
    });
  });

  it("coerce: single token uses model-only lookup shape", () => {
    expect(coerceLaptopMakeModelForLookup(null, "XPS13")).toEqual({
      make: "",
      model: "XPS13",
    });
  });
});
