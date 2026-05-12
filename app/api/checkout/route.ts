import { NextResponse } from "next/server";
import { getStripe, stripeConfigured } from "@/lib/stripe";

/** Service order checkout — full Stripe + Prisma order create in phase 2. */
export async function POST() {
  if (!stripeConfigured() || !getStripe()) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }
  return NextResponse.json(
    { error: "not_implemented_use_phase_2" },
    { status: 501 },
  );
}
