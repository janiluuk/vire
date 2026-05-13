import Stripe from "stripe";
import { getRequestId, logApiEvent } from "@/lib/logging/log";
import { prisma } from "@/lib/db/prisma";
import { getStripe } from "@/lib/billing/stripe";
import { sendOrderConfirmedEmail, sendUsbConfirmedEmail } from "@/lib/email/email";
import {
  notifyCarePaymentFailed,
  refreshCareSubscriptionFromInvoice,
  syncCareSubscriptionFromStripeSubscription,
  upsertCareSubscriptionFromCheckoutSession,
} from "@/lib/billing/care-webhook";

function isPrismaUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "P2002"
  );
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const kind = session.metadata?.kind;

  if (kind === "care") {
    await upsertCareSubscriptionFromCheckoutSession(session);
    return;
  }

  if (kind === "service" && session.metadata?.orderId) {
    const orderId = session.metadata.orderId;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (
      order &&
      order.stripeSessionId === session.id &&
      order.status === "PENDING"
    ) {
      const paidCents =
        typeof session.amount_total === "number"
          ? session.amount_total
          : order.priceEur;
      const emailFromSession = session.customer_details?.email?.trim();
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
          priceEur: paidCents,
          customerEmail:
            emailFromSession?.toLowerCase() ?? order.customerEmail,
        },
      });
      const toEmail = emailFromSession ?? order.customerEmail;
      if (toEmail) {
        await sendOrderConfirmedEmail({
          to: toEmail,
          orderId: order.id,
          customerName: order.customerName ?? "",
          locale: order.locale,
          dataMigration: order.dataMigration,
          dataMigrationSize:
            order.dataMigrationSize === "standard" ||
            order.dataMigrationSize === "large"
              ? order.dataMigrationSize
              : null,
          appBundleIds: order.appBundleIds,
          portableVmAddon: order.portableVmAddon,
          portableVmHandoff: order.portableVmHandoff,
        });
      }
    }
  }

  if (kind === "usb" && session.metadata?.usbOrderId) {
    const usbId = session.metadata.usbOrderId;
    const usb = await prisma.usbOrder.findUnique({ where: { id: usbId } });
    if (
      usb &&
      usb.stripeSessionId === session.id &&
      usb.status === "pending"
    ) {
      await prisma.usbOrder.update({
        where: { id: usbId },
        data: { status: "paid" },
      });
      await sendUsbConfirmedEmail({
        to: usb.customerEmail,
        orderId: usb.id,
        customerName: usb.customerName,
        locale: usb.locale,
      });
    }
  }
}

const HANDLED_STRIPE_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);

async function dispatchStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      break;
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncCareSubscriptionFromStripeSubscription(
        event.data.object as Stripe.Subscription,
      );
      break;
    case "invoice.paid":
      await refreshCareSubscriptionFromInvoice(
        event.data.object as Stripe.Invoice,
      );
      break;
    case "invoice.payment_failed":
      await notifyCarePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    default:
      break;
  }
}

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    logApiEvent(requestId, "stripe_webhook.not_configured", {});
    return new Response(JSON.stringify({ error: "not_configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    logApiEvent(requestId, "stripe_webhook.missing_signature", {});
    return new Response(JSON.stringify({ error: "missing_signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const buf = Buffer.from(await req.arrayBuffer());
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, secret);
  } catch {
    logApiEvent(requestId, "stripe_webhook.invalid_signature", {});
    return new Response(JSON.stringify({ error: "invalid_signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  logApiEvent(requestId, "stripe_webhook.event", {
    type: event.type,
    id: event.id,
  });

  if (!HANDLED_STRIPE_EVENTS.has(event.type)) {
    return new Response(JSON.stringify({ received: true, ignored: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await prisma.stripeProcessedEvent.create({ data: { id: event.id } });
  } catch (e: unknown) {
    if (isPrismaUniqueViolation(e)) {
      logApiEvent(requestId, "stripe_webhook.deduped", { eventId: event.id });
      return new Response(JSON.stringify({ received: true, deduped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw e;
  }

  try {
    await dispatchStripeEvent(event);
    logApiEvent(requestId, "stripe_webhook.handler_ok", {
      eventId: event.id,
      type: event.type,
    });
  } catch (e) {
    logApiEvent(requestId, "stripe_webhook.handler_error", {
      eventId: event.id,
      message: e instanceof Error ? e.message : "unknown",
    });
    await prisma.stripeProcessedEvent
      .delete({ where: { id: event.id } })
      .catch(() => {});
    return new Response(JSON.stringify({ error: "handler_failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
