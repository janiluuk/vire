import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";

export default async function AdminUsbOrdersPage() {
  await requireAdmin();
  const a = getAdminMessages().admin;
  const rows = await prisma.usbOrder.findMany({
    orderBy: { createdAt: "desc" },
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
      <h1 className="mt-6 text-3xl font-bold">{a.usbOrders}</h1>
      <p className="mt-2 text-lg text-fog">{a.usbOrdersIntro}</p>

      {rows.length === 0 ? (
        <EmptyState
          className="mt-10"
          title={a.usbOrdersEmptyTitle}
          description={a.usbOrdersEmptyDescription}
        />
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-edge bg-card">
          <table className="min-w-full text-left text-lg">
            <thead className="border-b border-edge bg-canvas">
              <tr>
                <th className="px-4 py-3 font-semibold">{a.usbColId}</th>
                <th className="px-4 py-3 font-semibold">{a.usbColDate}</th>
                <th className="px-4 py-3 font-semibold">{a.usbColCustomer}</th>
                <th className="px-4 py-3 font-semibold">{a.usbColEmail}</th>
                <th className="px-4 py-3 font-semibold">{a.usbColAddress}</th>
                <th className="px-4 py-3 font-semibold">{a.usbColStatus}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-b border-edge hover:bg-canvas">
                  <td className="px-4 py-3 font-mono text-sm">
                    <Link
                      href={`/admin/usb-orders/${o.id}`}
                      className="text-vire-green underline"
                    >
                      {o.id.slice(0, 12)}…
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {o.createdAt.toLocaleString("fi-FI")}
                  </td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3">{o.customerEmail}</td>
                  <td className="max-w-[14rem] truncate px-4 py-3 text-sm" title={o.address}>
                    {o.address}
                  </td>
                  <td className="px-4 py-3">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
