import { describe, expect, it, afterEach } from "vitest";
import Stripe from "stripe";
import { POST as stripeWebhookPost } from "@/app/api/webhooks/stripe/route";

function testWebhookSecret() {
  return `whsec_${Buffer.from("sparkki_test_webhook_secret_32b").toString("base64")}`;
}

describe("POST /api/webhooks/stripe", () => {
  const saved = {
    sk: process.env.STRIPE_SECRET_KEY,
    wh: process.env.STRIPE_WEBHOOK_SECRET,
  };

  afterEach(() => {
    if (saved.sk !== undefined) process.env.STRIPE_SECRET_KEY = saved.sk;
    else delete process.env.STRIPE_SECRET_KEY;
    if (saved.wh !== undefined) process.env.STRIPE_WEBHOOK_SECRET = saved.wh;
    else delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it("returns 503 when Stripe webhook is not configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const res = await stripeWebhookPost(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      }),
    );
    expect(res.status).toBe(503);
    const j = (await res.json()) as { error?: string };
    expect(j.error).toBe("not_configured");
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_12345678901234567890123456789012";
    process.env.STRIPE_WEBHOOK_SECRET = testWebhookSecret();
    const res = await stripeWebhookPost(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      }),
    );
    expect(res.status).toBe(400);
    const j = (await res.json()) as { error?: string };
    expect(j.error).toBe("missing_signature");
  });

  it("returns 400 when signature is invalid", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_12345678901234567890123456789012";
    process.env.STRIPE_WEBHOOK_SECRET = testWebhookSecret();
    const res = await stripeWebhookPost(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: {
          "stripe-signature": "t=1,v1=deadbeef",
          "Content-Type": "application/json",
        },
        body: "{}",
      }),
    );
    expect(res.status).toBe(400);
    const j = (await res.json()) as { error?: string };
    expect(j.error).toBe("invalid_signature");
  });

  it("returns 200 with ignored for unhandled event types (signature verified)", async () => {
    const secret = testWebhookSecret();
    process.env.STRIPE_SECRET_KEY = "sk_test_12345678901234567890123456789012";
    process.env.STRIPE_WEBHOOK_SECRET = secret;
    const payload = JSON.stringify({
      id: "evt_test_webhook_unhandled",
      object: "event",
      api_version: "2022-11-15",
      created: Math.floor(Date.now() / 1000),
      type: "customer.created",
      data: { object: { id: "cus_test", object: "customer" } },
      livemode: false,
      pending_webhooks: 0,
      request: null,
    });
    const stripeSignature = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret,
    });
    const res = await stripeWebhookPost(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: {
          "stripe-signature": stripeSignature,
          "Content-Type": "application/json",
        },
        body: payload,
      }),
    );
    expect(res.status).toBe(200);
    const j = (await res.json()) as { received?: boolean; ignored?: boolean };
    expect(j.received).toBe(true);
    expect(j.ignored).toBe(true);
  });
});
