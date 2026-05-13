import type Stripe from "stripe";
import { CareStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getStripe } from "@/lib/billing/stripe";
import {
  sendCarePaymentFailedEmail,
  sendCareSubscriptionWelcomeEmail,
} from "@/lib/email/email";
import {
  invoiceLinkedSubscription,
  subscriptionCurrentPeriodEnd,
} from "@/lib/billing/stripe-subscription-period";

function subscriptionId(
  sub: string | Stripe.Subscription | null | undefined,
): string | null {
  if (!sub) return null;
  return typeof sub === "string" ? sub : sub.id;
}

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): CareStatus {
  if (status === "canceled" || status === "unpaid") return CareStatus.CANCELLED;
  if (status === "paused" || status === "past_due") return CareStatus.PAUSED;
  return CareStatus.ACTIVE;
}

export async function upsertCareSubscriptionFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (session.metadata?.kind !== "care") return;
  const stripe = getStripe();
  if (!stripe) return;

  const subId = subscriptionId(session.subscription);
  if (!subId) return;

  const subscription = await stripe.subscriptions.retrieve(subId);
  const emailFromSession = session.customer_details?.email?.trim();
  if (!emailFromSession) return;
  const emailRaw = emailFromSession.toLowerCase();

  const name =
    session.metadata.customerName?.trim() ||
    session.customer_details?.name?.trim() ||
    emailRaw.split("@")[0] ||
    "Customer";
  const locale =
    session.metadata.locale === "en" ? "en" : "fi";
  const orderId = session.metadata.orderId?.trim() || null;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;

  const periodEnd = new Date(subscriptionCurrentPeriodEnd(subscription) * 1000);
  const stripeCust = customerId ?? "";

  const existing = await prisma.careSubscription.findUnique({
    where: { customerEmail: emailRaw },
  });

  if (existing) {
    await prisma.careSubscription.update({
      where: { id: existing.id },
      data: {
        customerName: name,
        orderId: orderId || existing.orderId,
        status: CareStatus.ACTIVE,
        stripeSubId: subId,
        stripeCustomerId: stripeCust || existing.stripeCustomerId,
        currentPeriodEnd: periodEnd,
        cancelledAt: null,
        locale,
      },
    });
  } else {
    await prisma.careSubscription.create({
      data: {
        customerEmail: emailRaw,
        customerName: name,
        orderId,
        status: CareStatus.ACTIVE,
        stripeSubId: subId,
        stripeCustomerId: stripeCust || null,
        currentPeriodEnd: periodEnd,
        locale,
      },
    });
  }

  await sendCareSubscriptionWelcomeEmail({
    to: emailRaw,
    customerName: name,
    locale,
  });
}

export async function syncCareSubscriptionFromStripeSubscription(
  sub: Stripe.Subscription,
): Promise<void> {
  const row = await prisma.careSubscription.findUnique({
    where: { stripeSubId: sub.id },
  });
  if (!row) return;

  const status = mapStripeSubscriptionStatus(sub.status);
  const periodEnd = new Date(subscriptionCurrentPeriodEnd(sub) * 1000);
  const cancelled =
    status === CareStatus.CANCELLED
      ? (row.cancelledAt ?? new Date())
      : null;

  await prisma.careSubscription.update({
    where: { id: row.id },
    data: {
      status,
      currentPeriodEnd: periodEnd,
      cancelledAt: cancelled,
    },
  });
}

export async function refreshCareSubscriptionFromInvoice(
  invoice: Stripe.Invoice,
): Promise<void> {
  const subId = subscriptionId(invoiceLinkedSubscription(invoice));
  if (!subId) return;

  const stripe = getStripe();
  if (!stripe) return;

  const row = await prisma.careSubscription.findUnique({
    where: { stripeSubId: subId },
  });
  if (!row) return;

  const sub = await stripe.subscriptions.retrieve(subId);
  await prisma.careSubscription.update({
    where: { id: row.id },
    data: {
      currentPeriodEnd: new Date(subscriptionCurrentPeriodEnd(sub) * 1000),
      status: mapStripeSubscriptionStatus(sub.status),
    },
  });
}

export async function notifyCarePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  const subId = subscriptionId(invoiceLinkedSubscription(invoice));
  if (!subId) return;
  const row = await prisma.careSubscription.findUnique({
    where: { stripeSubId: subId },
  });
  if (!row) return;
  await sendCarePaymentFailedEmail({
    to: row.customerEmail,
    customerName: row.customerName,
    locale: row.locale,
  });
}
