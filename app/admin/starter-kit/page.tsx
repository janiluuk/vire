import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";

export default async function AdminStarterKitPage() {
  await requireAdmin();
  const a = getAdminMessages().admin;
  const rows = await prisma.starterKitOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/admin" className="text-sparkki-green underline">
        ← {a.dashboard}
      </Link>
      <h1 className="mt-6 text-3xl font-bold">{a.starterKitOrders}</h1>
      <p className="mt-2 text-lg text-fog">{a.starterKitOrdersIntro}</p>

      {rows.length === 0 ? (
        <EmptyState
          className="mt-10"
          title={a.starterKitOrdersEmptyTitle}
          description={a.starterKitOrdersEmptyDescription}
        />
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-edge bg-card">
          <table className="min-w-full text-left text-lg">
            <thead className="border-b border-edge bg-canvas">
              <tr>
                <th className="px-4 py-3 font-semibold">{a.starterKitColDate}</th>
                <th className="px-4 py-3 font-semibold">{a.starterKitColCustomer}</th>
                <th className="px-4 py-3 font-semibold">{a.starterKitColEmail}</th>
                <th className="px-4 py-3 font-semibold">{a.starterKitColStatus}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-b border-edge hover:bg-canvas">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/starter-kit/${o.id}`}
                      className="text-sparkki-green underline"
                    >
                      {o.createdAt.toLocaleDateString("fi-FI")}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3">{o.customerEmail}</td>
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
