import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { checkCompatibility } from "@/lib/specs/compatibility";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";
import { rateLimitUnavailableResponse } from "@/lib/http/rate-limit-production";

const bodySchema = z.object({
  make: z.string(),
  model: z.string(),
  ramGb: z.number().optional().nullable(),
  diskType: z.enum(["hdd", "ssd", "unknown"]).optional().nullable(),
  /** Reserved for Sparkki Checker / other clients; defaults to `web`. */
  source: z.enum(["web", "app"]).optional(),
});

export async function POST(req: Request) {
  const blocked = rateLimitUnavailableResponse(req.headers);
  if (blocked) return blocked;

  const ip = getClientIpFromHeaders(req.headers);
  if (
    !(await checkRateLimit(`compatibility:${ip}`, { windowMs: 60_000, max: 60 }))
  ) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }
  const { make, model, ramGb, diskType, source } = parsed.data;

  const row = await prisma.computerModel.findUnique({
    where: {
      make_model: {
        make: make.trim(),
        model: model.trim(),
      },
    },
  });

  const dbVerdict =
    row && row.compatible != null
      ? { compatible: row.compatible, verdict: row.verdict }
      : null;

  const result = checkCompatibility(
    make,
    model,
    ramGb,
    diskType ?? "unknown",
    dbVerdict,
  );

  const src = source === "app" ? "app" : "web";
  try {
    await prisma.compatibilityCheck.create({
      data: {
        source: src,
        make: make.trim().slice(0, 200),
        model: model.trim().slice(0, 200),
        ramGb: ramGb ?? null,
        diskType: diskType ?? null,
        status: result.status,
        reasons: result.reasons,
        speedGainEstimate: result.speedGainEstimate,
      },
    });
  } catch (err) {
    console.error("[api/compatibility] failed to persist CompatibilityCheck", err);
  }

  return NextResponse.json(result);
}
