import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveLaptopSpecs } from "@/lib/specs/laptop-specs";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";

const bodySchema = z.object({
  make: z.string().trim().min(1).max(120),
  model: z.string().trim().min(1).max(120),
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

  const { make, model } = parsed.data;
  try {
    const insight = await resolveLaptopSpecs(make, model);
    return NextResponse.json({ ok: true, ...insight } as const);
  } catch {
    return NextResponse.json(
      { ok: false, code: "upstream_error" } as const,
      { status: 502 },
    );
  }
}
