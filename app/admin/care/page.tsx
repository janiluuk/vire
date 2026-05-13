import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";

export default async function AdminCareSubscriptionsPage() {
  await requireAdmin();
  const a = getAdminMessages().admin;
  const rows = await prisma.careSubscription.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin" className="text-vire-green underline">
          ← {a.dashboard}
        </Link>
        <Link
          href="/admin/orders"
          className="min-h-tap rounded-lg border border-em px-4 py-2 font-semibold text-ink hover:bg-sunken"
        >
          {a.orders}
        </Link>
      </div>
      <h1 className="mt-6 text-3xl font-bold">{a.careSubscriptions}</h1>
      <p className="mt-2 text-lg text-fog">{a.careSubscriptionsIntro}</p>

      {rows.length === 0 ? (
        <EmptyState
          className="mt-10"
          title={a.careSubscriptionsEmptyTitle}
          description={a.careSubscriptionsEmptyDescription}
        />
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-edge bg-card">
          <table className="min-w-full text-left text-lg">
            <thead className="border-b border-edge bg-canvas">
              <tr>
                <th className="px-4 py-3 font-semibold">{a.careColEmail}</th>
                <th className="px-4 py-3 font-semibold">{a.careColName}</th>
                <th className="px-4 py-3 font-semibold">{a.careColStatus}</th>
                <th className="px-4 py-3 font-semibold">{a.careColPeriodEnd}</th>
                <th className="px-4 py-3 font-semibold">{a.careColStripeSub}</th>
                <th className="px-4 py-3 font-semibold">{a.careColOrderId}</th>
                <th className="px-4 py-3 font-semibold">{a.careColLocale}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-edge hover:bg-canvas">
                  <td className="px-4 py-3">{r.customerEmail}</td>
                  <td className="px-4 py-3">{r.customerName}</td>
                  <td className="px-4 py-3">{r.status}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.currentPeriodEnd.toLocaleString("fi-FI")}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{r.stripeSubId}</td>
                  <td className="px-4 py-3 font-mono text-sm">{r.orderId ?? "—"}</td>
                  <td className="px-4 py-3">{r.locale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
