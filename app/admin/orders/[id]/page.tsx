import Link from "next/link";
import { notFound } from "next/navigation";
import { LaptopSpecsCard } from "@/components/laptop-specs/LaptopSpecsCard";
import { coerceLaptopMakeModelForLookup } from "@/lib/specs/laptop-reference-lookup";
import {
  resolveLaptopSpecs,
  withSpecsTimeout,
  type LaptopSpecsInsight,
} from "@/lib/specs/laptop-specs";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import {
  APP_BUNDLE_CONFIRM_LABEL,
  isAppBundleId,
} from "@/lib/billing/app-bundles";
import {
  PORTABLE_VM_HANDOFF_LABEL,
  isPortableVmHandoff,
} from "@/lib/billing/portable-vm";
import { getAdminLocale } from "@/lib/admin/get-admin-locale";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";
import {
  sendOrderDone,
  updateDataMigrationNotes,
  updateOrderNotes,
  updateOrderStatus,
} from "../actions";

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
] as const;

type Props = {
  params: { id: string };
  searchParams: { email?: string };
};

function auditMetaCell(value: unknown): string {
  if (value == null) return "—";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatOrderAppBundles(ids: string[]): string {
  if (!ids.length) return "—";
  return ids
    .map((id) =>
      isAppBundleId(id) ? APP_BUNDLE_CONFIRM_LABEL[id].fi : id,
    )
    .join(", ");
}

function formatPortableVm(order: {
  portableVmAddon: boolean;
  portableVmHandoff: string | null;
}): string {
  if (!order.portableVmAddon) return "—";
  const h = order.portableVmHandoff;
  if (h && isPortableVmHandoff(h)) return PORTABLE_VM_HANDOFF_LABEL[h].fi;
  return "—";
}

export default async function AdminOrderDetailPage({ params, searchParams }: Props) {
  await requireAdmin();
  const adminLocale = getAdminLocale();
  const a = getAdminMessages().admin;
  function statusLabel(s: string): string {
    const key = `status_${s}` as keyof typeof a;
    return (a[key] as string) ?? s;
  }

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) notFound();

  const audits = await prisma.adminAuditLog.findMany({
    where: { entity: "Order", entityId: order.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  const emailFlash = searchParams.email;

  const specIn = coerceLaptopMakeModelForLookup(
    order.computerMake,
    order.computerModel,
  );
  let adminSpecs: LaptopSpecsInsight | undefined;
  if (specIn && process.env.SPECS_LOOKUP_ENABLED !== "false") {
    adminSpecs =
      (await withSpecsTimeout(
        resolveLaptopSpecs(specIn.make, specIn.model, {
          locale: adminLocale === "en" ? "en" : "fi",
        }),
        14_000,
      )) ?? {
        summary: null,
        specUrl: null,
      };
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin/orders" className="text-sparkki-green underline">
        ← {a.orderBack}
      </Link>
      <h1 className="mt-6 flex flex-wrap items-center gap-3 text-3xl font-bold">
        <span>
          {a.orderDetailTitle} · {order.id.slice(0, 8)}…
        </span>
        {order.dataMigration ? (
          <span className="inline-flex items-center rounded-full bg-sparkki-amber/90 px-3 py-1 text-base font-semibold text-ink">
            {a.migrationBadge}
          </span>
        ) : null}
      </h1>

      {emailFlash === "sent" ? (
        <p className="mt-4 rounded-lg border border-g/40 bg-g/10 p-4 text-lg text-ink">
          {a.doneSent}
        </p>
      ) : null}
      {emailFlash === "failed" ? (
        <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-4 text-lg text-ink">
          {a.doneFailed}
        </p>
      ) : null}

      <dl className="mt-8 grid gap-4 text-lg">
        <div>
          <dt className="font-semibold text-fog">{a.fieldId}</dt>
          <dd className="font-mono text-ink">{order.id}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.fieldLocale}</dt>
          <dd>{order.locale === "en" ? "EN" : "FI"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.colStatus}</dt>
          <dd>{statusLabel(order.status)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.colTier}</dt>
          <dd>{order.tier}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.colSupport}</dt>
          <dd>{order.supportTier}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.colDelivery}</dt>
          <dd>{order.deliveryMethod}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.colHdd}</dt>
          <dd>{order.hddRemoval ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.colMigration}</dt>
          <dd>
            {order.dataMigration
              ? order.dataMigrationSize === "large"
                ? `${a.migrationSizeLabel}: ${a.migrationSizeLarge}`
                : order.dataMigrationSize === "standard"
                  ? `${a.migrationSizeLabel}: ${a.migrationSizeStandard}`
                  : "—"
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.colAppBundles}</dt>
          <dd>{formatOrderAppBundles(order.appBundleIds)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.colPortableVm}</dt>
          <dd>{formatPortableVm(order)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.colComputer}</dt>
          <dd>
            {[order.computerMake, order.computerModel].filter(Boolean).join(" ") ||
              order.notes ||
              "—"}
          </dd>
        </div>
        {adminSpecs !== undefined ? (
          <div className="col-span-full max-w-none">
            <LaptopSpecsCard
              insight={adminSpecs}
              labels={{
                title: a.specsTitle,
                referenceTitle: a.specsReferenceTitle,
                loading: a.specsLoading,
                empty: a.specsEmpty,
                link: a.specsLink,
              }}
            />
          </div>
        ) : null}
        <div>
          <dt className="font-semibold text-fog">{a.colCustomer}</dt>
          <dd>
            {[order.customerName, order.customerEmail]
              .filter((x): x is string => Boolean(x && x.trim()))
              .join(" · ") || "—"}
            {order.customerPhone ? ` · ${order.customerPhone}` : ""}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.colAddress}</dt>
          <dd className="whitespace-pre-wrap">{order.address ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.colPrice}</dt>
          <dd>
            {(order.priceEur / 100).toFixed(2)} {a.colEur}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.colStripe}</dt>
          <dd className="break-all font-mono text-sm">
            {order.stripeSessionId ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-fog">{a.colNotes}</dt>
          <dd className="whitespace-pre-wrap">{order.notes ?? "—"}</dd>
        </div>
        {order.dataMigration && order.dataMigrationNotes ? (
          <div>
            <dt className="font-semibold text-fog">{a.migrationNotesLabel}</dt>
            <dd className="whitespace-pre-wrap">{order.dataMigrationNotes}</dd>
          </div>
        ) : null}
      </dl>

      {order.portableVmAddon ? (
        <section
          aria-labelledby="portable-vm-ops"
          className="mt-10 rounded-xl border border-g/25 bg-g/[0.06] p-6"
        >
          <h2 id="portable-vm-ops" className="text-xl font-bold text-ink">
            {a.portableVmOpsTitle}
          </h2>
          <p className="mt-4 whitespace-pre-line text-base font-light leading-relaxed text-fog">
            {a.portableVmOpsChecklist}
          </p>
        </section>
      ) : null}

      <section className="mt-10 space-y-6 border-t border-edge pt-8">
        <form action={updateOrderStatus} className="space-y-3">
          <input type="hidden" name="orderId" value={order.id} />
          <label htmlFor="status" className="block font-semibold">
            {a.fieldStatus}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={order.status}
            className="min-h-tap w-full max-w-md rounded-lg border border-em px-4 text-lg"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="min-h-tap rounded-lg bg-sparkki-green px-5 py-2 font-semibold text-canvas"
          >
            {a.saveStatus}
          </button>
        </form>

        <form action={updateOrderNotes} className="space-y-3">
          <input type="hidden" name="orderId" value={order.id} />
          <label htmlFor="adminNotes" className="block font-semibold">
            {a.adminNotesLabel}
          </label>
          <textarea
            id="adminNotes"
            name="adminNotes"
            rows={5}
            defaultValue={order.adminNotes ?? ""}
            placeholder={a.adminNotesPlaceholder}
            className="w-full rounded-lg border border-em px-4 py-3 text-lg"
          />
          <button
            type="submit"
            className="min-h-tap rounded-lg border border-em px-5 py-2 font-semibold"
          >
            {a.saveNotes}
          </button>
        </form>

        {order.dataMigration ? (
          <form action={updateDataMigrationNotes} className="space-y-3">
            <input type="hidden" name="orderId" value={order.id} />
            <label htmlFor="dataMigrationNotes" className="block font-semibold">
              {a.migrationNotesLabel}
            </label>
            <textarea
              id="dataMigrationNotes"
              name="dataMigrationNotes"
              rows={4}
              maxLength={4000}
              defaultValue={order.dataMigrationNotes ?? ""}
              placeholder={a.migrationNotesPlaceholder}
              className="w-full rounded-lg border border-em px-4 py-3 text-lg"
            />
            <button
              type="submit"
              className="min-h-tap rounded-lg border border-sparkki-amber bg-sparkki-amber/15 px-5 py-2 font-semibold text-ink"
            >
              {a.saveMigrationNotes}
            </button>
          </form>
        ) : null}

        <form action={sendOrderDone}>
          <input type="hidden" name="orderId" value={order.id} />
          <button
            type="submit"
            className="min-h-tap rounded-lg bg-sparkki-amber px-5 py-2 font-semibold text-ink"
          >
            {a.sendDone}
          </button>
        </form>
      </section>

      <section className="mt-12 border-t border-edge pt-8" aria-labelledby="order-audit-title">
        <h2 id="order-audit-title" className="text-xl font-bold text-ink">
          {a.orderAuditTitle}
        </h2>
        {audits.length === 0 ? (
          <p className="mt-4 text-lg text-fog">{a.orderAuditEmpty}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-base">
              <thead>
                <tr className="border-b border-edge text-fog">
                  <th className="py-2 pr-4 font-semibold">{a.orderAuditTime}</th>
                  <th className="py-2 pr-4 font-semibold">{a.orderAuditActor}</th>
                  <th className="py-2 pr-4 font-semibold">{a.orderAuditAction}</th>
                  <th className="py-2 font-semibold">{a.orderAuditMeta}</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((row) => (
                  <tr key={row.id} className="border-b border-edge/60 align-top">
                    <td className="py-2 pr-4 font-mono text-sm text-ink whitespace-nowrap">
                      {new Intl.DateTimeFormat("fi-FI", {
                        dateStyle: "short",
                        timeStyle: "medium",
                      }).format(row.createdAt)}
                    </td>
                    <td className="py-2 pr-4 text-ink">{row.actorEmail}</td>
                    <td className="py-2 pr-4 font-mono text-sm text-ink">
                      {row.action}
                    </td>
                    <td className="py-2 font-mono text-xs text-fog break-all">
                      {auditMetaCell(row.metadata)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
