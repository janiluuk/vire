import { describe, expect, it } from "vitest";
import { isOrderWizardRoute } from "@/lib/site/order-wizard-path";

describe("isOrderWizardRoute", () => {
  it("matches order wizard paths", () => {
    expect(isOrderWizardRoute("/tilaa")).toBe(true);
    expect(isOrderWizardRoute("/tilaa/")).toBe(true);
    expect(isOrderWizardRoute("/fi/tilaa")).toBe(true);
    expect(isOrderWizardRoute("/en/tilaa")).toBe(true);
  });

  it("rejects other routes", () => {
    expect(isOrderWizardRoute("/")).toBe(false);
    expect(isOrderWizardRoute("/palvelu")).toBe(false);
    expect(isOrderWizardRoute(null)).toBe(false);
  });
});
