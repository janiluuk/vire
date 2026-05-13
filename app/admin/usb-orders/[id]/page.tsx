import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";

type Props = { params: { id: string } };

export default async function AdminUsbOrderDetailPage({ params }: Props) {
  await requireAdmin();
  const a = getAdminMessages().admin;
  const order = await prisma.usbOrder.findUnique({ where: { id: params.id } });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin/usb-orders" className="text-sparkki-green underline">
        {a.usbDetailBack}
      </Link>
      <h1 className="mt-6 text-3xl font-bold">
        {a.usbDetailTitle} · {order.id.slice(0, 8)}…
      </h1>

      <dl className="mt-8 grid gap-4 text-lg">
        <div>
          <dt className="font-semibold text-fog">{a.fieldId}</dt>
          <dd className="font-mono text-ink">{order.id}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.usbColDate}</dt>
          <dd>{order.createdAt.toLocaleString("fi-FI")}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.usbColStatus}</dt>
          <dd>{order.status}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.fieldLocale}</dt>
          <dd>{order.locale === "en" ? "EN" : "FI"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.usbColCustomer}</dt>
          <dd>{order.customerName}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.usbColEmail}</dt>
          <dd>{order.customerEmail}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.usbColAddress}</dt>
          <dd className="whitespace-pre-wrap">{order.address}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.colStripe}</dt>
          <dd className="break-all font-mono text-sm">
            {order.stripeSessionId ?? "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
