import { describe, expect, it } from "vitest";
import { serviceOrderTotalCents, USB_ORDER_CENTS } from "@/lib/billing/pricing";

describe("serviceOrderTotalCents", () => {
  it("computes SSD_BASIC with FULL support", () => {
    expect(serviceOrderTotalCents("SSD_BASIC", "FULL")).toBe(79_00);
  });

  it("applies support discount for EMAIL", () => {
    expect(serviceOrderTotalCents("SSD_BASIC", "EMAIL")).toBe(64_00);
  });

  it("throws for B2B", () => {
    expect(() => serviceOrderTotalCents("B2B", "FULL")).toThrow(
      "b2b_requires_quote",
    );
  });
});

describe("USB_ORDER_CENTS", () => {
  it("is 990 cents", () => {
    expect(USB_ORDER_CENTS).toBe(990);
  });
});
