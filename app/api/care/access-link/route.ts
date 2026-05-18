import { NextResponse } from "next/server";
import { z } from "zod";
import { CareStatus } from "@prisma/client";
import { careDashboardUrl } from "@/lib/care/care-access-token";
import { prisma } from "@/lib/db/prisma";
import { sendCareAccessLinkEmail } from "@/lib/email/email";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";
import { rateLimitUnavailableResponse } from "@/lib/http/rate-limit-production";

const bodySchema = z.object({
  email: z.string().email().max(320),
  locale: z.enum(["fi", "en"]).optional(),
});

export async function POST(req: Request) {
  const blocked = rateLimitUnavailableResponse(req.headers);
  if (blocked) return blocked;

  const ip = getClientIpFromHeaders(req.headers);
  if (
    !(await checkRateLimit(`care-access:${ip}`, {
      windowMs: 60_000,
      max: 6,
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

  const email = parsed.data.email.trim().toLowerCase();
  const loc = parsed.data.locale === "en" ? "en" : "fi";

  const sub = await prisma.careSubscription.findUnique({
    where: { customerEmail: email },
  });

  // Always return ok to avoid email enumeration; only send when subscriber exists.
  if (
    sub &&
    (sub.status === CareStatus.ACTIVE || sub.status === CareStatus.PAUSED)
  ) {
    const url = careDashboardUrl(loc, email);
    if (url) {
      await sendCareAccessLinkEmail({
        to: email,
        customerName: sub.customerName,
        locale: sub.locale,
        dashboardUrl: url,
      });
    }
  }

  return NextResponse.json({ ok: true } as const);
}
