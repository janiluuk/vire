import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCareAccessToken } from "@/lib/care/care-access-token";
import { getStripe } from "@/lib/billing/stripe";
import { prisma } from "@/lib/db/prisma";
import { getSiteUrl } from "@/lib/site/site-url";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";

const bodySchema = z.object({
  token: z.string().min(16).max(2000),
  locale: z.enum(["fi", "en"]).optional(),
});

export async function POST(req: Request) {
  const ip = getClientIpFromHeaders(req.headers);
  if (
    !(await checkRateLimit(`care-portal:${ip}`, {
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
  if (!sub?.stripeCustomerId) {
    return NextResponse.json({ ok: false, code: "no_customer" }, { status: 404 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ ok: false, code: "stripe_not_configured" }, { status: 503 });
  }

  const loc = parsed.data.locale === "en" ? "en" : "fi";
  const base = getSiteUrl();
  const returnUrl = `${base}/${loc}/oma-sparkki?token=${encodeURIComponent(parsed.data.token)}`;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: returnUrl,
    });
    if (!session.url) {
      return NextResponse.json({ ok: false, code: "no_url" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, url: session.url } as const);
  } catch {
    return NextResponse.json({ ok: false, code: "stripe_error" }, { status: 502 });
  }
}
