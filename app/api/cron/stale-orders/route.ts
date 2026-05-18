import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/verify-cron-secret";
import { cancelStalePendingOrders } from "@/lib/orders/stale-pending-orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!verifyCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const maxAgeHours = Number.parseInt(
    process.env.STALE_ORDER_MAX_AGE_HOURS ?? "24",
    10,
  );
  const maxAgeMs =
    (Number.isFinite(maxAgeHours) && maxAgeHours > 0 ? maxAgeHours : 24) *
    60 *
    60 *
    1000;

  const { cancelled } = await cancelStalePendingOrders(maxAgeMs);
  return NextResponse.json({ ok: true, cancelled, maxAgeHours });
}
