import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestId, logApiEvent } from "@/lib/logging/log";
import { prisma } from "@/lib/db/prisma";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";
import { buildStarterKitLineItems } from "@/lib/billing/stripe-line-items";
import {
  STARTER_KIT_ORDER_CENTS,
  getStarterKitStripePriceId,
} from "@/lib/billing/pricing";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";
import { getSiteUrl } from "@/lib/site/site-url";

const schema = z.object({
  customerName: z.string().min(1).max(200),
  customerEmail: z.string().email().max(320),
  address: z.string().min(1).max(500),
  locale: z.enum(["fi", "en"]),
});

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    logApiEvent(requestId, "checkout_starter_kit.invalid_json", {});
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  if (
    !(await checkRateLimit(
      `checkout-starter-kit:${getClientIpFromHeaders(req.headers)}`,
      { windowMs: 60_000, max: 25 },
    ))
  ) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!stripeConfigured() || !getStripe()) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const stripe = getStripe()!;
  const baseUrl = getSiteUrl();
  const loc = data.locale;

  const order = await prisma.starterKitOrder.create({
    data: {
      status: "pending",
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      address: data.address.trim(),
      locale: loc,
    },
  });

  const lineItems = buildStarterKitLineItems(
    STARTER_KIT_ORDER_CENTS,
    getStarterKitStripePriceId(),
    loc,
  );

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customerEmail,
      line_items: lineItems,
      success_url: `${baseUrl}/${loc}/itse/kiitos?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${loc}/itse`,
      metadata: {
        kind: "starter_kit",
        starterKitOrderId: order.id,
      },
    });

    await prisma.starterKitOrder.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    if (!session.url) {
      await prisma.starterKitOrder.delete({ where: { id: order.id } });
      return NextResponse.json({ error: "stripe_no_checkout_url" }, { status: 502 });
    }

    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (e) {
    await prisma.starterKitOrder.delete({ where: { id: order.id } }).catch(() => {});
    logApiEvent(requestId, "checkout_starter_kit.stripe_error", {
      message: e instanceof Error ? e.message : "unknown",
    });
    return NextResponse.json({ error: "stripe_error" }, { status: 502 });
  }
}
