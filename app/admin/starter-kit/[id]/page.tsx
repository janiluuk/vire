import Link from "next/link";
import { notFound } from "next/navigation";
import { updateStarterKitOrder } from "@/app/admin/starter-kit/actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";

type Props = {
  params: { id: string };
  searchParams?: { saved?: string };
};

export default async function AdminStarterKitDetailPage({
  params,
  searchParams,
}: Props) {
  await requireAdmin();
  const a = getAdminMessages().admin;
  const order = await prisma.starterKitOrder.findUnique({ where: { id: params.id } });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin/starter-kit" className="text-sparkki-green underline">
        {a.starterKitDetailBack}
      </Link>
      <h1 className="mt-6 text-3xl font-bold">
        {a.starterKitDetailTitle} · {order.id.slice(0, 8)}…
      </h1>

      {searchParams?.saved === "1" ? (
        <p className="mt-4 rounded-lg border border-g/30 bg-g/10 px-4 py-3 text-ink">
          {a.starterKitSaved}
        </p>
      ) : null}

      <dl className="mt-8 grid gap-4 text-lg">
        <div>
          <dt className="font-semibold text-fog">{a.fieldId}</dt>
          <dd className="font-mono text-ink">{order.id}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.starterKitColDate}</dt>
          <dd>{order.createdAt.toLocaleString("fi-FI")}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.starterKitColStatus}</dt>
          <dd>{order.status}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.starterKitColCustomer}</dt>
          <dd>{order.customerName}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.starterKitColEmail}</dt>
          <dd>{order.customerEmail}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.starterKitColAddress}</dt>
          <dd className="whitespace-pre-wrap">{order.address}</dd>
        </div>
        {order.shippedAt ? (
          <div>
            <dt className="font-semibold text-fog">{a.starterKitShippedAt}</dt>
            <dd>{order.shippedAt.toLocaleString("fi-FI")}</dd>
          </div>
        ) : null}
        {order.trackingNumber ? (
          <div>
            <dt className="font-semibold text-fog">{a.starterKitTracking}</dt>
            <dd className="font-mono">{order.trackingNumber}</dd>
          </div>
        ) : null}
      </dl>

      <form action={updateStarterKitOrder} className="sparkki-card mt-8 space-y-4 p-6">
        <input type="hidden" name="id" value={order.id} />
        <div>
          <label htmlFor="kit-status" className="mb-2 block font-semibold">
            {a.starterKitColStatus}
          </label>
          <select
            id="kit-status"
            name="status"
            defaultValue={order.status}
            className="min-h-tap w-full max-w-xs rounded-lg border border-em px-4 text-lg"
          >
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="shipped">shipped</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <div>
          <label htmlFor="kit-tracking" className="mb-2 block font-semibold">
            {a.starterKitTracking}
          </label>
          <input
            id="kit-tracking"
            name="trackingNumber"
            defaultValue={order.trackingNumber ?? ""}
            className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
          />
        </div>
        <label className="flex items-center gap-2 text-lg">
          <input type="checkbox" name="markShipped" value="1" />
          {a.starterKitMarkShipped}
        </label>
        <button
          type="submit"
          className="min-h-tap rounded-xl bg-sparkki-green px-6 py-3 font-semibold text-canvas"
        >
          {a.starterKitSave}
        </button>
      </form>
    </div>
  );
}
