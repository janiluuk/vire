import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import fiMessages from "@/messages/fi.json";

const a = fiMessages.admin;

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [openOrders, ordersToday, todayRevenue, modelsUnchecked] = await Promise.all([
    prisma.order.count({
      where: { status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] } },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
      _sum: { priceEur: true },
    }),
    prisma.computerModel.count({ where: { status: "UNCHECKED" } }),
  ]);

  const revenueEur = todayRevenue._sum.priceEur ?? 0;
  const revenueStr = (revenueEur / 100).toLocaleString("fi-FI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{a.dashboard}</h1>
          <p className="mt-2 text-lg text-gray-700">
            {a.welcome}, {session.user.email}
          </p>
        </div>
        <Link
          href="/api/auth/signout?callbackUrl=/admin/login"
          className="min-h-tap rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100"
        >
          {a.logout}
        </Link>
      </header>

      <p className="mt-8 text-lg text-gray-800">{a.statsIntro}</p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li className="verso-card rounded-2xl p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">{a.statOpenOrders}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{openOrders}</p>
          <p className="mt-1 text-sm text-gray-600">{a.statOpenOrdersHint}</p>
        </li>
        <li className="verso-card rounded-2xl p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">{a.statTodayOrders}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{ordersToday}</p>
        </li>
        <li className="verso-card rounded-2xl p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">{a.statTodayRevenue}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {revenueStr} {a.statEur}
          </p>
        </li>
        <li className="verso-card rounded-2xl p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">{a.statModelsUnchecked}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{modelsUnchecked}</p>
        </li>
      </ul>

      <nav className="mt-10 flex flex-wrap gap-4" aria-label="Admin">
        <Link
          href="/admin/orders"
          className="min-h-tap rounded-xl bg-white px-5 py-3 font-semibold shadow ring-1 ring-gray-200 hover:ring-verso-green"
        >
          {a.orders}
        </Link>
        <Link
          href="/admin/models"
          className="min-h-tap rounded-xl bg-white px-5 py-3 font-semibold shadow ring-1 ring-gray-200 hover:ring-verso-green"
        >
          {a.models}
        </Link>
        <Link
          href="/admin/guides"
          className="min-h-tap rounded-xl bg-white px-5 py-3 font-semibold shadow ring-1 ring-gray-200 hover:ring-verso-green"
        >
          {a.guides}
        </Link>
      </nav>
    </div>
  );
}
