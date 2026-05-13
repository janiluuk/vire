import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestId, logApiEvent } from "@/lib/logging/log";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";
import { getCareMonthlyStripePriceId } from "@/lib/billing/care";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";
import { getSiteUrl } from "@/lib/site/site-url";
import {
  hasUsableCustomerContact,
  parseCustomerContact,
} from "@/lib/contact/parse-customer-contact";

const checkoutSchema = z
  .object({
    customerContact: z.string().trim().min(5).max(320),
    customerName: z.string().trim().max(120).optional().default(""),
    locale: z.enum(["fi", "en"]),
    orderId: z.string().trim().max(64).optional().nullable(),
  })
  .superRefine((val, ctx) => {
    const p = parseCustomerContact(val.customerContact);
    if (!hasUsableCustomerContact(p) || p.email == null || !p.email.includes("@")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customerContact"],
        message: "invalid_contact",
      });
    }
  });

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    logApiEvent(requestId, "care_checkout.invalid_json", {});
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    logApiEvent(requestId, "care_checkout.validation_error", {
      issues: parsed.error.issues.length,
    });
    return NextResponse.json(
      { error: "validation_error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  if (
    !(await checkRateLimit(`care_checkout:${getClientIpFromHeaders(req.headers)}`, {
      windowMs: 60_000,
      max: 15,
    }))
  ) {
    logApiEvent(requestId, "care_checkout.rate_limited", {});
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!stripeConfigured() || !getStripe()) {
    logApiEvent(requestId, "care_checkout.stripe_not_configured", {});
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const priceId = getCareMonthlyStripePriceId();
  if (!priceId) {
    logApiEvent(requestId, "care_checkout.no_price_id", {});
    return NextResponse.json({ error: "care_not_configured" }, { status: 503 });
  }

  const stripe = getStripe()!;
  const parsedContact = parseCustomerContact(data.customerContact);
  const email = parsedContact.email!.toLowerCase();
  const baseUrl = getSiteUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/${data.locale}/care/kiitos?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${data.locale}/care`,
      metadata: {
        kind: "care",
        customerName: data.customerName.trim(),
        locale: data.locale,
        orderId: data.orderId?.trim() ?? "",
      },
    });

    if (!session.url) {
      logApiEvent(requestId, "care_checkout.no_url", {});
      return NextResponse.json({ error: "stripe_no_checkout_url" }, { status: 502 });
    }

    logApiEvent(requestId, "care_checkout.session_created", { locale: data.locale });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    logApiEvent(requestId, "care_checkout.stripe_error", {
      message: e instanceof Error ? e.message : "unknown",
    });
    return NextResponse.json({ error: "stripe_error" }, { status: 502 });
  }
}
