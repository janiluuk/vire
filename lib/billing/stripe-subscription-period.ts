import type Stripe from "stripe";

/**
 * stripe-node v22 moved subscription linkage to `invoice.parent.subscription_details`;
 * webhook payloads may still include top-level `subscription`.
 */
export function invoiceLinkedSubscription(
  invoice: Stripe.Invoice,
): string | Stripe.Subscription | null {
  const legacy = (
    invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    }
  ).subscription;
  if (legacy) return legacy;

  const { parent } = invoice;
  if (
    parent &&
    parent.type === "subscription_details" &&
    parent.subscription_details
  ) {
    return parent.subscription_details.subscription;
  }
  return null;
}

/** stripe-node v22 typings omit `current_period_end` on `Subscription`, but the API still returns it. */
export function subscriptionCurrentPeriodEnd(sub: Stripe.Subscription): number {
  const end = (sub as Stripe.Subscription & { current_period_end?: number })
    .current_period_end;
  if (typeof end !== "number") {
    throw new Error("Stripe subscription missing current_period_end");
  }
  return end;
}
