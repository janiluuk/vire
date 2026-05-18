import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";
import { analyzeLaptopPhoto, isPhotoVisionEnabled } from "@/lib/specs/laptop-photo-vision";
import { validatePhotoPayload } from "@/lib/specs/validate-photo";

const bodySchema = z.object({
  imageBase64: z.string().min(32).max(4_000_000),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  locale: z.enum(["fi", "en"]).optional(),
});

export async function POST(req: Request) {
  const ip = getClientIpFromHeaders(req.headers);
  if (
    !(await checkRateLimit(`computer-photo:${ip}`, {
      windowMs: 60_000,
      max: 8,
    }))
  ) {
    return NextResponse.json({ ok: false, code: "rate_limited" } as const, {
      status: 429,
    });
  }

  if (!isPhotoVisionEnabled()) {
    return NextResponse.json({ ok: false, code: "not_configured" } as const, {
      status: 503,
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

  const { imageBase64, mimeType, locale } = parsed.data;
  const validated = validatePhotoPayload(imageBase64, mimeType);
  if (!validated.ok) {
    return NextResponse.json(
      { ok: false, code: validated.code } as const,
      { status: 400 },
    );
  }

  const loc = locale === "en" ? "en" : "fi";
  try {
    const hint = await analyzeLaptopPhoto(imageBase64, loc);
    if (!hint) {
      return NextResponse.json({ ok: false, code: "vision_failed" } as const, {
        status: 502,
      });
    }
    return NextResponse.json({ ok: true, hint } as const);
  } catch {
    return NextResponse.json(
      { ok: false, code: "upstream_error" } as const,
      { status: 502 },
    );
  }
}
