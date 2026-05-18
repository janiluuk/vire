import { NextResponse } from "next/server";
import { z } from "zod";
import { sendSupportContactEmail } from "@/lib/email/email";
import { getRequestId, logApiEvent } from "@/lib/logging/log";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";
import { rateLimitUnavailableResponse } from "@/lib/http/rate-limit-production";
import {
  hasUsableCustomerContact,
  parseCustomerContact,
} from "@/lib/contact/parse-customer-contact";

const bodySchema = z.object({
  contact: z.string().trim().min(3).max(320),
  message: z.string().trim().min(1).max(4000),
  locale: z.enum(["fi", "en"]),
});

export async function POST(req: Request) {
  const blocked = rateLimitUnavailableResponse(req.headers);
  if (blocked) return blocked;

  const requestId = getRequestId(req);
  const ip = getClientIpFromHeaders(req.headers);
  if (
    !(await checkRateLimit(`support-contact:${ip}`, {
      windowMs: 60_000,
      max: 8,
    }))
  ) {
    logApiEvent(requestId, "support_contact.rate_limited", { ip });
    return NextResponse.json({ ok: false, code: "rate_limited" } as const, {
      status: 429,
    });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    logApiEvent(requestId, "support_contact.invalid_json", {});
    return NextResponse.json({ ok: false, code: "invalid_input" } as const, {
      status: 400,
    });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    logApiEvent(requestId, "support_contact.validation_error", {});
    return NextResponse.json({ ok: false, code: "invalid_input" } as const, {
      status: 400,
    });
  }

  const contact = parseCustomerContact(parsed.data.contact);
  if (!hasUsableCustomerContact(contact)) {
    logApiEvent(requestId, "support_contact.validation_error", {});
    return NextResponse.json({ ok: false, code: "invalid_input" } as const, {
      status: 400,
    });
  }

  const notifyTo = process.env.SUPPORT_NOTIFY_EMAIL?.trim();
  if (!notifyTo) {
    logApiEvent(requestId, "support_contact.not_configured", {});
    return NextResponse.json({ ok: false, code: "not_configured" } as const, {
      status: 503,
    });
  }

  const { message, locale } = parsed.data;
  const result = await sendSupportContactEmail({
    notifyTo,
    message,
    contactRaw: parsed.data.contact.trim(),
    contactEmail: contact.email,
    contactPhone: contact.phone,
    locale,
  });

  if (!result.ok) {
    logApiEvent(requestId, "support_contact.send_failed", { locale });
    return NextResponse.json(
      { ok: false, code: "send_failed" } as const,
      { status: 502 },
    );
  }

  logApiEvent(requestId, "support_contact.sent", { locale });
  return NextResponse.json({ ok: true } as const);
}
