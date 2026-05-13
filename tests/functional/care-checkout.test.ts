import { describe, expect, it } from "vitest";
import { POST as careCheckoutPost } from "@/app/api/care/checkout/route";

describe("POST /api/care/checkout", () => {
  it("returns 503 when STRIPE_PRICE_CARE_MONTHLY is unset (valid body)", async () => {
    const prevPrice = process.env.STRIPE_PRICE_CARE_MONTHLY;
    const prevSk = process.env.STRIPE_SECRET_KEY;
    try {
      delete process.env.STRIPE_PRICE_CARE_MONTHLY;
      process.env.STRIPE_SECRET_KEY = "sk_test_placeholder_for_route";
      const res = await careCheckoutPost(
        new Request("http://localhost/api/care/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "203.0.113.60",
          },
          body: JSON.stringify({
            customerContact: "care-test@example.com",
            customerName: "Test User",
            locale: "fi",
          }),
        }),
      );
      expect(res.status).toBe(503);
      const j = (await res.json()) as { error?: string };
      expect(j.error).toBe("care_not_configured");
    } finally {
      if (prevPrice !== undefined) process.env.STRIPE_PRICE_CARE_MONTHLY = prevPrice;
      else delete process.env.STRIPE_PRICE_CARE_MONTHLY;
      if (prevSk !== undefined) process.env.STRIPE_SECRET_KEY = prevSk;
      else delete process.env.STRIPE_SECRET_KEY;
    }
  });

  it("returns 400 for invalid contact", async () => {
    const res = await careCheckoutPost(
      new Request("http://localhost/api/care/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "203.0.113.61",
        },
        body: JSON.stringify({
          customerContact: "not-an-email",
          locale: "fi",
        }),
      }),
    );
    expect(res.status).toBe(400);
    const j = (await res.json()) as { error?: string };
    expect(j.error).toBe("validation_error");
  });
});
