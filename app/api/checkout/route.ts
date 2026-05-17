import { NextResponse } from "next/server";
import { z } from "zod";
import type { ServiceTier } from "@prisma/client";
import {
  DeliveryMethod,
  HddRemovalOption,
  PortableVmHandoff,
  SupportTier,
} from "@prisma/client";
import { getRequestId, logApiEvent } from "@/lib/logging/log";
import { prisma } from "@/lib/db/prisma";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";
import { buildServiceLineItems } from "@/lib/billing/stripe-line-items";
import {
  hddRemovalAddonCents,
  serviceCheckoutTotalCents,
} from "@/lib/billing/pricing";
import {
  APP_BUNDLE_ZOD_ENUM,
  normalizeAppBundleIds,
} from "@/lib/billing/app-bundles";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";
import { getSiteUrl } from "@/lib/site/site-url";
import { lookupComputerForWizard } from "@/lib/orders/computer-lookup";
import {
  hasUsableCustomerContact,
  parseCustomerContact,
} from "@/lib/contact/parse-customer-contact";

const checkoutSchema = z
  .object({
    tier: z.enum(["INSTALL_ONLY", "SSD_BASIC", "SSD_RAM", "FULL_SERVICE"]),
    supportChoice: z.enum(["INCLUDED", "CARE_PLUS", "CARE_PRO"]).optional(),
    selectedYear: z.number().int().min(1990).max(2030).optional().nullable(),
    selectedMatchId: z.string().trim().max(64).optional().nullable(),
    deliveryMethod: z.nativeEnum(DeliveryMethod),
    hddRemoval: z.nativeEnum(HddRemovalOption),
    computerDescription: z.string().trim().min(1).max(2000),
    customerContact: z.string().trim().min(5).max(320),
    locale: z.enum(["fi", "en"]),
    dataMigration: z.boolean().optional(),
    dataMigrationSize: z.enum(["standard", "large"]).optional().nullable(),
    appBundleIds: z
      .array(z.enum(APP_BUNDLE_ZOD_ENUM))
      .max(APP_BUNDLE_ZOD_ENUM.length)
      .optional()
      .default([]),
    portableVmAddon: z.boolean().optional().default(false),
    portableVmHandoff: z.nativeEnum(PortableVmHandoff).optional().nullable(),
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
    if (val.portableVmAddon && !val.portableVmHandoff) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["portableVmHandoff"],
        message: "required_when_portable_vm",
      });
    }
    if (!val.portableVmAddon && val.portableVmHandoff) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["portableVmHandoff"],
        message: "unexpected_when_disabled",
      });
    }
    const p = parseCustomerContact(val.customerContact);
    if (!hasUsableCustomerContact(p)) {
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

  const wantsMigration = Boolean(data.dataMigration) && data.dataMigrationSize;
  const migration = wantsMigration
    ? { size: data.dataMigrationSize! }
    : null;
  const supportTier = SupportTier.FULL;
  const carePackageInterest =
    data.supportChoice === "CARE_PLUS"
      ? "PLUS"
      : data.supportChoice === "CARE_PRO"
        ? "PRO"
        : null;
  const appBundles = normalizeAppBundleIds(data.appBundleIds ?? []);
  const portableVmSelected =
    Boolean(data.portableVmAddon) && data.portableVmHandoff != null;
  const portableVmHandoff = portableVmSelected
    ? data.portableVmHandoff!
    : null;
  const priceEur = serviceCheckoutTotalCents({
    tier: data.tier,
    supportTier,
    migration,
    deliveryMethod: data.deliveryMethod,
    hddRemoval: data.hddRemoval,
    appBundles,
    portableVm: portableVmSelected,
  });

  const parsedContact = parseCustomerContact(data.customerContact);

  const lookup = await lookupComputerForWizard(
    data.computerDescription.trim(),
    data.locale,
    {
      selectedYear: data.selectedYear ?? null,
      selectedMatchId: data.selectedMatchId ?? null,
    },
  );

  const yearNote =
    data.selectedYear != null ? ` · vuosi: ${data.selectedYear}` : "";
  const careNote =
    carePackageInterest != null
      ? ` · Care-kiinnostus: ${carePackageInterest}`
      : "";

  const order = await prisma.order.create({
    data: {
      status: "PENDING",
      tier: data.tier as ServiceTier,
      supportTier,
      deliveryMethod: data.deliveryMethod,
      hddRemoval: data.hddRemoval,
      computerMake: lookup?.coerced.make || null,
      computerModel: lookup?.coerced.model || null,
      carePackageInterest,
      customerName: null,
      customerEmail: parsedContact.email,
      customerPhone: parsedContact.phone,
      address: null,
      preferredDate: null,
      notes: `${data.computerDescription.trim()}${yearNote}${careNote}`,
      priceEur,
      locale: data.locale,
      dataMigration: migration != null,
      dataMigrationSize: migration?.size ?? null,
      appBundleIds: appBundles,
      portableVmAddon: portableVmSelected,
      portableVmHandoff,
    },
  });

  const baseUrl = getSiteUrl();

  if (process.env.CHECKOUT_E2E_BYPASS === "true") {
    logApiEvent(requestId, "checkout.e2e_bypass", { orderId: order.id });
    return NextResponse.json({
      url: `${baseUrl}/${data.locale}/palvelu/kiitos?session_id=e2e_${order.id}`,
      orderId: order.id,
    });
  }

  if (!stripeConfigured() || !getStripe()) {
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
    logApiEvent(requestId, "checkout.stripe_not_configured", {});
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const stripe = getStripe()!;

  const hddCents = hddRemovalAddonCents(
    data.tier as Exclude<ServiceTier, "B2B">,
    data.hddRemoval,
  );

  const lineItems = buildServiceLineItems(
    data.tier as Exclude<ServiceTier, "B2B">,
    supportTier,
    migration,
    data.locale,
    {
      postShip: data.deliveryMethod === "DROP_OFF",
      hddSparkkiCents: hddCents,
      appBundles,
      portableVm: portableVmSelected,
    },
  );

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customerEmail ?? undefined,
      line_items: lineItems,
      success_url: `${baseUrl}/${data.locale}/palvelu/kiitos?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${data.locale}`,
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
