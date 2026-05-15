import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  toPublicServiceOrder,
  toPublicUsbOrder,
} from "@/lib/orders/public-order";
import { coerceLaptopMakeModelForLookup } from "@/lib/specs/laptop-reference-lookup";
import { resolveLaptopSpecs, withSpecsTimeout } from "@/lib/specs/laptop-specs";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";

const bodySchema = z.object({
  orderId: z.string().min(8).max(40),
  email: z.string().trim().email().max(320),
});

export async function POST(req: Request) {
  const ip = getClientIpFromHeaders(req.headers);
  if (
    !(await checkRateLimit(`order-lookup:${ip}`, { windowMs: 60_000, max: 30 }))
  ) {
    return NextResponse.json(
      { ok: false, code: "not_found" } as const,
      { status: 429 },
    );
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

  const { orderId, email } = parsed.data;
  const emailNorm = email.toLowerCase();

  const service = await prisma.order.findFirst({
    where: {
      id: orderId,
      customerEmail: { equals: emailNorm, mode: "insensitive" },
    },
  });

  if (service) {
    const specIn = coerceLaptopMakeModelForLookup(
      service.computerMake,
      service.computerModel,
    );
    let laptopSpecs: Awaited<ReturnType<typeof resolveLaptopSpecs>> | undefined;
    if (specIn && process.env.SPECS_LOOKUP_ENABLED !== "false") {
      laptopSpecs =
        (await withSpecsTimeout(
          resolveLaptopSpecs(specIn.make, specIn.model, {
            locale: service.locale === "en" ? "en" : "fi",
          }),
          14_000,
        )) ?? {
          summary: null,
          specUrl: null,
        };
    }
    return NextResponse.json({
      ok: true,
      order: toPublicServiceOrder(service),
      ...(laptopSpecs !== undefined ? { laptopSpecs } : {}),
    });
  }

  const usb = await prisma.usbOrder.findFirst({
    where: {
      id: orderId,
      customerEmail: { equals: emailNorm, mode: "insensitive" },
    },
  });

  if (usb) {
    return NextResponse.json({
      ok: true,
      order: toPublicUsbOrder(usb),
    });
  }

  return NextResponse.json({ ok: false, code: "not_found" } as const, {
    status: 404,
  });
}
