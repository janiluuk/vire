import { getStripe } from "@/lib/billing/stripe";

export type ThankYouView =
  | { ok: true; kind: "service"; orderId: string }
  | { ok: true; kind: "usb"; orderId: string }
  | { ok: true; kind: "starter_kit"; orderId: string }
  | { ok: false };

export async function thankYouFromSession(
  sessionId: string | undefined,
): Promise<ThankYouView> {
  if (!sessionId?.trim()) return { ok: false };
  const stripe = getStripe();
  if (!stripe) return { ok: false };

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return { ok: false };
    if (session.metadata?.kind === "service" && session.metadata.orderId) {
      return {
        ok: true,
        kind: "service",
        orderId: session.metadata.orderId,
      };
    }
    if (session.metadata?.kind === "usb" && session.metadata.usbOrderId) {
      return {
        ok: true,
        kind: "usb",
        orderId: session.metadata.usbOrderId,
      };
    }
    if (
      session.metadata?.kind === "starter_kit" &&
      session.metadata.starterKitOrderId
    ) {
      return {
        ok: true,
        kind: "starter_kit",
        orderId: session.metadata.starterKitOrderId,
      };
    }
  } catch {
    return { ok: false };
  }
  return { ok: false };
}
