import { NextResponse } from "next/server";
import { z } from "zod";
import type { ServiceTier } from "@prisma/client";
import { DeliveryMethod, SupportTier } from "@prisma/client";
import { getRequestId, logApiEvent } from "@/lib/logging/log";
import { prisma } from "@/lib/db/prisma";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";
import { buildServiceLineItems } from "@/lib/billing/stripe-line-items";
import { serviceOrderTotalWithMigrationCents } from "@/lib/billing/pricing";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";
import { getSiteUrl } from "@/lib/site/site-url";

const checkoutSchema = z
  .object({
    tier: z.enum(["SSD_BASIC", "SSD_RAM", "FULL_SERVICE"]),
    supportTier: z.nativeEnum(SupportTier),
    deliveryMethod: z.nativeEnum(DeliveryMethod),
    computerMake: z.string().max(200).optional().nullable(),
    computerModel: z.string().max(200).optional().nullable(),
    customerName: z.string().min(1).max(200),
    customerEmail: z.string().email().max(320),
    customerPhone: z.string().max(50).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    preferredDate: z.string().max(40).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    locale: z.enum(["fi", "en"]),
    dataMigration: z.boolean().optional(),
    dataMigrationSize: z.enum(["standard", "large"]).optional().nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.dataMigration && !val.dataMigrationSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dataMigrationSize"],
        message: "required_when_data_migration",
      });
    }
    if (!val.dataMigration && val.dataMigrationSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dataMigrationSize"],
        message: "unexpected_when_disabled",
      });
    }
  });

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    logApiEvent(requestId, "checkout.invalid_json", {});
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    logApiEvent(requestId, "checkout.validation_error", {
      issues: parsed.error.issues.length,
    });
    return NextResponse.json(
      { error: "validation_error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  if (
    !(await checkRateLimit(`checkout:${getClientIpFromHeaders(req.headers)}`, {
      windowMs: 60_000,
      max: 25,
    }))
  ) {
    logApiEvent(requestId, "checkout.rate_limited", {
      ip: getClientIpFromHeaders(req.headers),
    });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!stripeConfigured() || !getStripe()) {
    logApiEvent(requestId, "checkout.stripe_not_configured", {});
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const stripe = getStripe()!;

  const wantsMigration = Boolean(data.dataMigration) && data.dataMigrationSize;
  const migration = wantsMigration
    ? { size: data.dataMigrationSize! }
    : null;
  const priceEur = serviceOrderTotalWithMigrationCents(
    data.tier,
    data.supportTier,
    migration,
  );
  const preferredDate =
    data.preferredDate && data.preferredDate.length > 0
      ? new Date(data.preferredDate)
      : null;
  if (preferredDate && Number.isNaN(preferredDate.getTime())) {
    logApiEvent(requestId, "checkout.invalid_date", {});
    return NextResponse.json({ error: "invalid_date" }, { status: 400 });
  }

  const baseUrl = getSiteUrl();

  const order = await prisma.order.create({
    data: {
      status: "PENDING",
      tier: data.tier as ServiceTier,
      supportTier: data.supportTier,
      deliveryMethod: data.deliveryMethod,
      computerMake: data.computerMake?.trim() || null,
      computerModel: data.computerModel?.trim() || null,
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      customerPhone: data.customerPhone?.trim() || null,
      address: data.address?.trim() || null,
      preferredDate,
      notes: data.notes?.trim() || null,
      priceEur,
      locale: data.locale,
      dataMigration: migration != null,
      dataMigrationSize: migration?.size ?? null,
    },
  });

  const lineItems = buildServiceLineItems(
    data.tier as Exclude<ServiceTier, "B2B">,
    data.supportTier,
    migration,
    data.locale,
  );

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customerEmail,
      line_items: lineItems,
      success_url: `${baseUrl}/${data.locale}/palvelu/kiitos?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${data.locale}/palvelu`,
      metadata: {
        kind: "service",
        orderId: order.id,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    if (!session.url) {
      await prisma.order.delete({ where: { id: order.id } });
      logApiEvent(requestId, "checkout.stripe_no_checkout_url", {
        orderId: order.id,
      });
      return NextResponse.json(
        { error: "stripe_no_checkout_url" },
        { status: 502 },
      );
    }

    logApiEvent(requestId, "checkout.session_created", {
      orderId: order.id,
      locale: data.locale,
      tier: data.tier,
    });
    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (e) {
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
    logApiEvent(requestId, "checkout.stripe_error", {
      orderId: order.id,
      message: e instanceof Error ? e.message : "unknown",
    });
    return NextResponse.json({ error: "stripe_error" }, { status: 502 });
  }
}
