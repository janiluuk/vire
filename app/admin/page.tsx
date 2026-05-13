import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";

function startOfLocalDay(d: Date): Date {
  const x = new Date(d.getTime());
  x.setHours(0, 0, 0, 0);
  return x;
}

function dateKeyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  const a = getAdminMessages().admin;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayStart = startOfLocalDay(new Date());
  const rangeStart = new Date(todayStart);
  rangeStart.setDate(rangeStart.getDate() - 6);

  const dayKeys: string[] = [];
  const dayLabels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    dayKeys.push(dateKeyLocal(d));
    dayLabels.push(
      d.toLocaleDateString("fi-FI", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    );
  }

  const [
    openOrders,
    ordersToday,
    todayRevenue,
    modelsUnchecked,
    recentOrders,
    approvedModels,
    rejectedModels,
  ] = await Promise.all([
    prisma.order.count({
      where: { status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] } },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
      _sum: { priceEur: true },
    }),
    prisma.computerModel.count({ where: { status: "UNCHECKED" } }),
    prisma.order.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true, priceEur: true, status: true },
    }),
    prisma.computerModel.count({ where: { status: "APPROVED" } }),
    prisma.computerModel.count({ where: { status: "REJECTED" } }),
  ]);

  const perDay = new Map<string, { orders: number; revenueCents: number }>();
  for (const k of dayKeys) {
    perDay.set(k, { orders: 0, revenueCents: 0 });
  }
  for (const o of recentOrders) {
    const k = dateKeyLocal(o.createdAt);
    const row = perDay.get(k);
    if (!row) continue;
    row.orders += 1;
    if (o.status !== "CANCELLED") {
      row.revenueCents += o.priceEur ?? 0;
    }
  }

  let weekRevenueCents = 0;
  for (const k of dayKeys) {
    weekRevenueCents += perDay.get(k)!.revenueCents;
  }
  const weekRevenueStr = (weekRevenueCents / 100).toLocaleString("fi-FI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const maxDayOrders = Math.max(
    1,
    ...dayKeys.map((k) => perDay.get(k)!.orders),
  );

  const decidedModels = approvedModels + rejectedModels;
  const approvalPct =
    decidedModels === 0
      ? null
      : Math.round((100 * approvedModels) / decidedModels);

  const revenueEur = todayRevenue._sum.priceEur ?? 0;
  const revenueStr = (revenueEur / 100).toLocaleString("fi-FI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-edge pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">{a.dashboard}</h1>
          <p className="mt-2 text-lg text-fog">
            {a.welcome}, {session.user.email}
          </p>
        </div>
        <Link
          href="/api/auth/signout?callbackUrl=/admin/login"
          className="min-h-tap rounded-lg border border-em px-4 py-2 font-semibold hover:bg-sunken"
        >
          {a.logout}
        </Link>
      </header>

      <p className="mt-8 text-lg text-ink">{a.statsIntro}</p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li className="vire-card rounded-2xl p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-fog">{a.statOpenOrders}</p>
          <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">{openOrders}</p>
          <p className="mt-1 text-sm text-fog">{a.statOpenOrdersHint}</p>
        </li>
        <li className="vire-card rounded-2xl p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-fog">{a.statTodayOrders}</p>
          <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">{ordersToday}</p>
        </li>
        <li className="vire-card rounded-2xl p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-fog">{a.statTodayRevenue}</p>
          <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
            {revenueStr} {a.statEur}
          </p>
        </li>
        <li className="vire-card rounded-2xl p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-fog">{a.statModelsUnchecked}</p>
          <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">{modelsUnchecked}</p>
        </li>
      </ul>

      <ul className="mt-6 grid gap-4 lg:grid-cols-2">
        <li className="vire-card rounded-2xl p-5 lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-fog">{a.statWeekOrders}</p>
          <p className="mt-1 text-sm text-fog">{a.statWeekOrdersHint}</p>
          <div className="mt-6 flex h-44 gap-2 sm:gap-3" role="img" aria-label={a.statWeekOrdersHint}>
            {dayKeys.map((key, idx) => {
              const { orders } = perDay.get(key)!;
              const barMaxPx = 112;
              const hPx =
                orders === 0
                  ? 0
                  : Math.max(8, Math.round((orders / maxDayOrders) * barMaxPx));
              return (
                <div key={key} className="flex min-h-0 min-w-0 flex-1 flex-col justify-end gap-1">
                  <span className="text-center text-sm font-semibold text-ink">{orders}</span>
                  <div
                    className="w-full max-w-[3rem] self-center rounded-t-md bg-vire-green/80 sm:max-w-none"
                    style={{ height: hPx }}
                  />
                  <span
                    className="truncate text-center text-xs text-fog sm:text-sm"
                    title={key}
                  >
                    {dayLabels[idx]}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-fog">
            <span className="font-semibold">{a.statWeekRevenue}:</span> {weekRevenueStr} {a.statEur}
          </p>
        </li>
        <li className="vire-card rounded-2xl p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-fog">{a.statModelApproval}</p>
          {approvalPct === null ? (
            <p className="mt-3 text-lg text-fog">{a.statModelApprovalEmpty}</p>
          ) : (
            <>
              <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">{approvalPct}%</p>
              <p className="mt-2 text-sm text-fog">
                {approvedModels} / {decidedModels} — {a.statModelApprovalHint}
              </p>
            </>
          )}
        </li>
      </ul>

      <nav className="mt-10 flex flex-wrap gap-4" aria-label="Admin">
        <Link
          href="/admin/orders"
          className="min-h-tap rounded-xl border border-em bg-card px-5 py-3 font-semibold transition-colors duration-150 hover:border-g"
        >
          {a.orders}
        </Link>
        <Link
          href="/admin/usb-orders"
          className="min-h-tap rounded-xl border border-em bg-card px-5 py-3 font-semibold transition-colors duration-150 hover:border-g"
        >
          {a.usbOrders}
        </Link>
        <Link
          href="/admin/care"
          className="min-h-tap rounded-xl border border-em bg-card px-5 py-3 font-semibold transition-colors duration-150 hover:border-g"
        >
          {a.careSubscriptions}
        </Link>
        <Link
          href="/admin/models"
          className="min-h-tap rounded-xl border border-em bg-card px-5 py-3 font-semibold transition-colors duration-150 hover:border-g"
        >
          {a.models}
        </Link>
        <Link
          href="/admin/guides"
          className="min-h-tap rounded-xl border border-em bg-card px-5 py-3 font-semibold transition-colors duration-150 hover:border-g"
        >
          {a.guides}
        </Link>
        <Link
          href="/admin/ai-testing"
          className="min-h-tap rounded-xl border border-em bg-card px-5 py-3 font-semibold transition-colors duration-150 hover:border-g"
        >
          {a.aiTesting}
        </Link>
      </nav>
    </div>
  );
}
