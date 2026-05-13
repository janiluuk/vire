import { NextResponse } from "next/server";
import { z } from "zod";
import { coerceLaptopMakeModelForLookup } from "@/lib/specs/laptop-reference-lookup";
import { resolveLaptopSpecs } from "@/lib/specs/laptop-specs";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";

const bodySchema = z
  .object({
    make: z.string().trim().max(120),
    model: z.string().trim().max(120),
    locale: z.enum(["fi", "en"]).optional(),
  })
  .refine((d) => d.make.length > 0 || d.model.length > 0, {
    message: "make_or_model_required",
  });

export async function POST(req: Request) {
  const ip = getClientIpFromHeaders(req.headers);
  if (
    !(await checkRateLimit(`laptop-specs:${ip}`, { windowMs: 60_000, max: 20 }))
  ) {
    return NextResponse.json(
      { ok: false, code: "rate_limited" } as const,
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

  const { make, model, locale } = parsed.data;
  const specIn = coerceLaptopMakeModelForLookup(make, model);
  if (!specIn) {
    return NextResponse.json({ ok: false, code: "invalid_input" } as const, {
      status: 400,
    });
  }
  try {
    const insight = await resolveLaptopSpecs(specIn.make, specIn.model, {
      locale: locale === "en" ? "en" : "fi",
    });
    return NextResponse.json({ ok: true, ...insight } as const);
  } catch {
    return NextResponse.json(
      { ok: false, code: "upstream_error" } as const,
      { status: 502 },
    );
  }
}
