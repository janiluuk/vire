import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkCompatibility } from "@/lib/compatibility";

const bodySchema = z.object({
  make: z.string(),
  model: z.string(),
  ramGb: z.number().optional().nullable(),
  diskType: z.enum(["hdd", "ssd", "unknown"]).optional().nullable(),
});

export async function POST(req: Request) {
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
  const { make, model, ramGb, diskType } = parsed.data;

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

  return NextResponse.json(result);
}
