import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/verify-cron-secret";
import { purgeExpiredLaptopSpecsCache } from "@/lib/specs/cleanup-specs-cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!verifyCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { deleted } = await purgeExpiredLaptopSpecsCache();
  return NextResponse.json({ ok: true, deleted });
}
