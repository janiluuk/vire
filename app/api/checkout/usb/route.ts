import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestId, logApiEvent } from "@/lib/logging/log";
import { prisma } from "@/lib/db/prisma";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";
import { buildUsbLineItems } from "@/lib/billing/stripe-line-items";
import { USB_ORDER_CENTS, getUsbStripePriceId } from "@/lib/billing/pricing";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";
import { getSiteUrl } from "@/lib/site/site-url";

const usbSchema = z.object({
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
    logApiEvent(requestId, "checkout_usb.invalid_json", {});
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = usbSchema.safeParse(body);
  if (!parsed.success) {
    logApiEvent(requestId, "checkout_usb.validation_error", {
      issues: parsed.error.issues.length,
    });
    return NextResponse.json(
      { error: "validation_error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  if (
    !(await checkRateLimit(`checkout-usb:${getClientIpFromHeaders(req.headers)}`, {
      windowMs: 60_000,
      max: 25,
    }))
  ) {
    logApiEvent(requestId, "checkout_usb.rate_limited", {
      ip: getClientIpFromHeaders(req.headers),
    });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!stripeConfigured() || !getStripe()) {
    logApiEvent(requestId, "checkout_usb.stripe_not_configured", {});
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const stripe = getStripe()!;
  const baseUrl = getSiteUrl();

  const usb = await prisma.usbOrder.create({
    data: {
      status: "pending",
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      address: data.address.trim(),
      locale: data.locale,
    },
  });

  const lineItems = buildUsbLineItems(USB_ORDER_CENTS, getUsbStripePriceId());

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: usb.customerEmail,
      line_items: lineItems,
      success_url: `${baseUrl}/${data.locale}/itse/kiitos?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${data.locale}/itse`,
      metadata: {
        kind: "usb",
        usbOrderId: usb.id,
      },
    });

    await prisma.usbOrder.update({
      where: { id: usb.id },
      data: { stripeSessionId: session.id },
    });

    if (!session.url) {
      await prisma.usbOrder.delete({ where: { id: usb.id } });
      logApiEvent(requestId, "checkout_usb.stripe_no_checkout_url", {
        orderId: usb.id,
      });
      return NextResponse.json(
        { error: "stripe_no_checkout_url" },
        { status: 502 },
      );
    }

    logApiEvent(requestId, "checkout_usb.session_created", {
      orderId: usb.id,
      locale: data.locale,
    });
    return NextResponse.json({ url: session.url, orderId: usb.id });
  } catch (e) {
    await prisma.usbOrder.delete({ where: { id: usb.id } }).catch(() => {});
    logApiEvent(requestId, "checkout_usb.stripe_error", {
      orderId: usb.id,
      message: e instanceof Error ? e.message : "unknown",
    });
    return NextResponse.json({ error: "stripe_error" }, { status: 502 });
  }
}
