import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";
import { POST as checkoutPost } from "@/app/api/checkout/route";
import { POST as supportPost } from "@/app/api/public/support-contact/route";

describe("API route handlers", () => {
  it("GET /api/health returns JSON ok", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.service).toBe("vire");
  });

  it("POST /api/checkout returns 503 without Stripe when body is valid", async () => {
    const res = await checkoutPost(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "203.0.113.50",
        },
        body: JSON.stringify({
          tier: "SSD_BASIC",
          supportTier: "FULL",
          deliveryMethod: "HOME_PICKUP",
          customerName: "Test",
          customerEmail: "test@example.com",
          locale: "fi",
        }),
      }),
    );
    expect(res.status).toBe(503);
  });

  it("POST /api/public/support-contact returns 503 when SUPPORT_NOTIFY_EMAIL unset", async () => {
    const prev = process.env.SUPPORT_NOTIFY_EMAIL;
    try {
      delete process.env.SUPPORT_NOTIFY_EMAIL;
      const res = await supportPost(
        new Request("http://localhost/api/public/support-contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "203.0.113.51",
          },
          body: JSON.stringify({
            name: "A",
            email: "a@example.com",
            message: "Hello support",
            locale: "en",
          }),
        }),
      );
      expect(res.status).toBe(503);
    } finally {
      if (prev !== undefined) process.env.SUPPORT_NOTIFY_EMAIL = prev;
      else delete process.env.SUPPORT_NOTIFY_EMAIL;
    }
  });
});
