import { NextResponse } from "next/server";
import { z } from "zod";
import { lookupComputerForWizard } from "@/lib/orders/computer-lookup";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";
import { resolveLaptopSpecs, withSpecsTimeout } from "@/lib/specs/laptop-specs";

const bodySchema = z.object({
  description: z.string().trim().min(3).max(2000),
  locale: z.enum(["fi", "en"]).optional(),
  selectedYear: z.number().int().min(1990).max(2030).optional().nullable(),
  selectedMatchId: z.string().trim().max(64).optional().nullable(),
  includeWebSpecs: z.boolean().optional(),
});

const WEB_SPECS_TIMEOUT_MS = 5_000;

export async function POST(req: Request) {
  const ip = getClientIpFromHeaders(req.headers);
  if (
    !(await checkRateLimit(`computer-lookup:${ip}`, {
      windowMs: 60_000,
      max: 40,
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

  const { description, locale, selectedYear, selectedMatchId, includeWebSpecs } =
    parsed.data;
  const loc = locale === "en" ? "en" : "fi";
  try {
    const result = await lookupComputerForWizard(description, loc, {
      selectedYear: selectedYear ?? null,
      selectedMatchId: selectedMatchId ?? null,
    });
    if (
      result &&
      includeWebSpecs &&
      process.env.SPECS_LOOKUP_ENABLED !== "false" &&
      process.env.SPECS_SEARXNG_BASE_URL?.trim()
    ) {
      const insight =
        (await withSpecsTimeout(
          resolveLaptopSpecs(result.coerced.make, result.coerced.model, {
            locale: loc,
          }),
          WEB_SPECS_TIMEOUT_MS,
        )) ?? null;
      if (insight && (insight.summary || insight.specUrl)) {
        result.webSpecs = {
          summary: insight.summary,
          specUrl: insight.specUrl,
        };
      }
    }
    return NextResponse.json({ ok: true, result } as const);
  } catch {
    return NextResponse.json(
      { ok: false, code: "upstream_error" } as const,
      { status: 502 },
    );
  }
}
