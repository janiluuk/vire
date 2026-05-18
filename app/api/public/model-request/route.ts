import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";
import { rateLimitUnavailableResponse } from "@/lib/http/rate-limit-production";
import { computerModelSlugFields } from "@/lib/koneet/computer-model-db";
import { prisma } from "@/lib/db/prisma";
import {
  hasUsableCustomerContact,
  parseCustomerContact,
} from "@/lib/contact/parse-customer-contact";

const bodySchema = z.object({
  make: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(120),
  contact: z.string().trim().min(3).max(320),
  locale: z.enum(["fi", "en"]).optional(),
});

export async function POST(req: Request) {
  const blocked = rateLimitUnavailableResponse(req.headers);
  if (blocked) return blocked;

  const ip = getClientIpFromHeaders(req.headers);
  if (
    !(await checkRateLimit(`model-request:${ip}`, {
      windowMs: 60_000,
      max: 5,
    }))
  ) {
    return NextResponse.json({ ok: false, code: "rate_limited" } as const, {
      status: 429,
    });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid_input" } as const, {
      status: 400,
    });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: "invalid_input" } as const, {
      status: 400,
    });
  }

  const contact = parseCustomerContact(parsed.data.contact);
  if (!hasUsableCustomerContact(contact)) {
    return NextResponse.json({ ok: false, code: "invalid_input" } as const, {
      status: 400,
    });
  }

  const make = parsed.data.make;
  const model = parsed.data.model;
  const contactLine = contact.email ?? contact.phone ?? parsed.data.contact;

  try {
    const existing = await prisma.computerModel.findUnique({
      where: { make_model: { make, model } },
    });
    if (!existing) {
      await prisma.computerModel.create({
        data: {
          make,
          model,
          status: "UNCHECKED",
          notes: `Check request (${parsed.data.locale ?? "fi"}): ${contactLine}`,
          ...computerModelSlugFields(make, model),
        },
      });
    } else if (!existing.notes?.includes(contactLine)) {
      await prisma.computerModel.update({
        where: { id: existing.id },
        data: {
          notes: [existing.notes, `Request: ${contactLine}`].filter(Boolean).join("\n"),
        },
      });
    }
    return NextResponse.json({ ok: true } as const);
  } catch {
    return NextResponse.json({ ok: false, code: "server_error" } as const, {
      status: 500,
    });
  }
}
