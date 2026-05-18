import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/verify-cron-secret";
import { runCareLifecycleEmails } from "@/lib/orders/care-lifecycle";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!verifyCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = await runCareLifecycleEmails();
  return NextResponse.json({ ok: true, results });
}
