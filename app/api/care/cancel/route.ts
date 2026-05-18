import { NextResponse } from "next/server";
import { z } from "zod";
import { CareStatus } from "@prisma/client";
import { verifyCareAccessToken } from "@/lib/care/care-access-token";
import { getStripe } from "@/lib/billing/stripe";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";

const bodySchema = z.object({
  token: z.string().min(16).max(2000),
});

export async function POST(req: Request) {
  const ip = getClientIpFromHeaders(req.headers);
  if (
    !(await checkRateLimit(`care-cancel:${ip}`, {
      windowMs: 60_000,
      max: 10,
    }))
  ) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid_input" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: "invalid_input" }, { status: 400 });
  }

  const verified = verifyCareAccessToken(parsed.data.token);
  if (!verified) {
    return NextResponse.json({ ok: false, code: "invalid_token" }, { status: 401 });
  }

  const sub = await prisma.careSubscription.findUnique({
    where: { customerEmail: verified.email },
  });
  if (!sub || sub.status === CareStatus.CANCELLED) {
    return NextResponse.json({ ok: false, code: "no_subscription" }, { status: 404 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ ok: false, code: "stripe_not_configured" }, { status: 503 });
  }

  try {
    await stripe.subscriptions.update(sub.stripeSubId, {
      cancel_at_period_end: true,
    });
    return NextResponse.json({
      ok: true,
      currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
    } as const);
  } catch {
    return NextResponse.json({ ok: false, code: "stripe_error" }, { status: 502 });
  }
}
