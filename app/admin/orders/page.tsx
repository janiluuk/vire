import Link from "next/link";
import { OrderStatus, Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";
import { EmptyState } from "@/components/ui/EmptyState";

const PAGE_SIZE = 25;

const STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
];

type SortKey = "createdAt" | "priceEur" | "status" | "customerName" | "tier";

const SORT_KEYS: SortKey[] = [
  "createdAt",
  "priceEur",
  "status",
  "customerName",
  "tier",
];

function isOrderStatus(s: string | undefined): s is OrderStatus {
  return !!s && STATUSES.includes(s as OrderStatus);
}

function parseSortKey(s: string | undefined): SortKey {
  return SORT_KEYS.includes(s as SortKey) ? (s as SortKey) : "createdAt";
}

function parseSortDir(s: string | undefined): "asc" | "desc" {
  return s === "asc" ? "asc" : "desc";
}

function defaultDirForField(field: SortKey): "asc" | "desc" {
  if (field === "customerName") return "asc";
  return "desc";
}

function nextSort(
  field: SortKey,
  currentField: SortKey,
  currentDir: "asc" | "desc",
): { sort: SortKey; dir: "asc" | "desc" } {
  if (currentField === field) {
    return { sort: field, dir: currentDir === "desc" ? "asc" : "desc" };
  }
  return { sort: field, dir: defaultDirForField(field) };
}

type Props = {
  searchParams: {
    status?: string;
    q?: string;
    page?: string;
    sort?: string;
    dir?: string;
  };
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireAdmin();
  const a = getAdminMessages().admin;

  function statusLabel(s: OrderStatus): string {
    const key = `status_${s}` as keyof typeof a;
    return (a[key] as string) ?? s;
  }

  const filter = isOrderStatus(searchParams.status)
    ? { status: searchParams.status }
    : {};

  const q = searchParams.q?.trim();
  const textOr: Prisma.OrderWhereInput[] | undefined =
    q && q.length > 0
      ? [
          { customerEmail: { contains: q, mode: "insensitive" } },
          { customerName: { contains: q, mode: "insensitive" } },
        ]
      : undefined;

  const where: Prisma.OrderWhereInput = {
    ...filter,
    ...(textOr ? { OR: textOr } : {}),
  };

  const pageRaw = Number.parseInt(searchParams.page ?? "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const sortField = parseSortKey(searchParams.sort);
  const sortDir = parseSortDir(searchParams.dir);
  const orderBy: Prisma.OrderOrderByWithRelationInput = {
    [sortField]: sortDir,
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const currentStatus = isOrderStatus(searchParams.status)
    ? searchParams.status
    : "";

  const filtersActive = Boolean((q && q.length > 0) || currentStatus);

  function makeHref(
    patch: Partial<{
      status: string;
      q: string;
      sort: SortKey;
      dir: "asc" | "desc";
      page: number;
    }>,
  ) {
    const sp = new URLSearchParams();
    const statusVal =
      patch.status !== undefined ? patch.status : currentStatus;
    if (statusVal) sp.set("status", statusVal);
    const qVal = patch.q !== undefined ? patch.q : (q ?? "");
    if (qVal) sp.set("q", qVal);
    const s = patch.sort ?? sortField;
    const d = patch.dir ?? sortDir;
    if (s !== "createdAt" || d !== "desc") {
      sp.set("sort", s);
      sp.set("dir", d);
    }
    const pVal = patch.page !== undefined ? patch.page : page;
    if (pVal > 1) sp.set("page", String(pVal));
    const qs = sp.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  }

  function sortHref(field: SortKey) {
    const { sort, dir } = nextSort(field, sortField, sortDir);
    return makeHref({ sort, dir, page: 1 });
  }

  function pageHref(p: number) {
    return makeHref({ page: p });
  }

  function thClass(active: boolean) {
    return active ? "text-vire-green" : "text-ink";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin" className="text-vire-green underline">
          ← {a.dashboard}
        </Link>
        <Link
          href="/admin/usb-orders"
          className="min-h-tap rounded-lg border border-em px-4 py-2 font-semibold text-ink hover:bg-sunken"
        >
          {a.usbOrders}
        </Link>
      </div>
      <h1 className="mt-6 text-3xl font-bold">{a.orders}</h1>
      <p className="mt-2 text-lg text-fog">{a.ordersIntro}</p>

      <form
        method="get"
        className="mt-6 flex max-w-2xl flex-wrap items-end gap-3"
        role="search"
      >
        {currentStatus ? (
          <input type="hidden" name="status" value={currentStatus} />
        ) : null}
        {sortField !== "createdAt" || sortDir !== "desc" ? (
          <>
            <input type="hidden" name="sort" value={sortField} />
            <input type="hidden" name="dir" value={sortDir} />
          </>
        ) : null}
        <div className="min-w-[12rem] flex-1">
          <label htmlFor="orders-q" className="mb-1 block text-sm font-semibold text-fog">
            {a.ordersSearchPlaceholder}
          </label>
          <input
            id="orders-q"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder={a.ordersSearchPlaceholder}
            className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
          />
        </div>
        <button
          type="submit"
          className="min-h-tap rounded-lg bg-vire-green px-5 py-2 font-semibold text-canvas"
        >
          {a.ordersSearch}
        </button>
        {q ? (
          <Link
            href={makeHref({ q: "", page: 1 })}
            className="min-h-tap text-lg font-semibold text-vire-green underline"
          >
            ×
          </Link>
        ) : null}
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={makeHref({ status: "", page: 1 })}
          className={`min-h-tap rounded-full px-4 py-2 font-semibold ${
            !searchParams.status
              ? "bg-vire-green text-canvas"
              : "bg-card ring-1 ring-em"
          }`}
        >
          {a.filterAll}
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={makeHref({ status: s, page: 1 })}
            className={`min-h-tap rounded-full px-4 py-2 font-semibold ${
              searchParams.status === s
                ? "bg-vire-green text-canvas"
                : "bg-card ring-1 ring-em"
            }`}
          >
            {statusLabel(s)}
          </Link>
        ))}
      </div>

      <p className="mt-4 text-sm text-fog">
        {a.ordersShowing
          .replace("{page}", String(page))
          .replace("{totalPages}", String(totalPages))
          .replace("{total}", String(total))}
      </p>

      {orders.length === 0 ? (
        <EmptyState
          className="mt-10"
          title={
            filtersActive ? a.ordersEmptyFilteredTitle : a.ordersEmptyTitle
          }
          description={
            filtersActive
              ? a.ordersEmptyFilteredDescription
              : a.ordersEmptyDescription
          }
        >
          {filtersActive ? (
            <Link
              href="/admin/orders"
              className="min-h-tap rounded-lg border border-em bg-card px-5 py-2.5 font-semibold text-ink hover:bg-sunken"
            >
              {a.ordersEmptyClearFilters}
            </Link>
          ) : null}
        </EmptyState>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-edge bg-card">
          <table className="min-w-full text-left text-lg">
            <thead className="border-b border-edge bg-canvas">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  <Link
                    href={sortHref("createdAt")}
                    className={`underline-offset-2 hover:underline ${thClass(sortField === "createdAt")}`}
                  >
                    {a.ordersSortDate}
                    {sortField === "createdAt" ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                  </Link>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <Link
                    href={sortHref("customerName")}
                    className={`underline-offset-2 hover:underline ${thClass(sortField === "customerName")}`}
                  >
                    {a.ordersSortCustomer}
                    {sortField === "customerName" ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                  </Link>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <Link
                    href={sortHref("tier")}
                    className={`underline-offset-2 hover:underline ${thClass(sortField === "tier")}`}
                  >
                    {a.ordersSortTier}
                    {sortField === "tier" ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                  </Link>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <Link
                    href={sortHref("status")}
                    className={`underline-offset-2 hover:underline ${thClass(sortField === "status")}`}
                  >
                    {a.ordersSortStatus}
                    {sortField === "status" ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                  </Link>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <Link
                    href={sortHref("priceEur")}
                    className={`underline-offset-2 hover:underline ${thClass(sortField === "priceEur")}`}
                  >
                    {a.ordersSortPrice}
                    {sortField === "priceEur" ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-edge hover:bg-canvas">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {o.createdAt.toLocaleString("fi-FI")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-medium text-vire-green underline"
                    >
                      {o.customerName ?? o.customerEmail ?? o.customerPhone ?? o.id.slice(0, 8)}
                    </Link>
                    <div className="text-sm text-fog">{o.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3">{o.tier}</td>
                  <td className="px-4 py-3">{statusLabel(o.status)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {(o.priceEur / 100).toFixed(2)} {a.colEur}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
          aria-label="Pagination"
        >
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="min-h-tap rounded-lg border border-em px-5 py-2 font-semibold hover:bg-sunken"
            >
              {a.ordersPagePrev}
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className="min-h-tap rounded-lg border border-em px-5 py-2 font-semibold hover:bg-sunken"
            >
              {a.ordersPageNext}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
