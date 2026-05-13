import Link from "next/link";
import { ModelCheckStatus } from "@prisma/client";
import { createComputerModel } from "@/app/admin/models/actions";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";

function formatYears(yearFrom: number | null, yearTo: number | null) {
  if (yearFrom != null && yearTo != null) return `${yearFrom}–${yearTo}`;
  if (yearFrom != null) return String(yearFrom);
  if (yearTo != null) return String(yearTo);
  return "—";
}

export default async function AdminModelsPage({
  searchParams,
}: {
  searchParams?: { status?: string; error?: string };
}) {
  await requireAdmin();
  const a = getAdminMessages().admin;

  function statusLabel(s: ModelCheckStatus) {
    switch (s) {
      case "UNCHECKED":
        return a.modelStatus_UNCHECKED;
      case "IN_REVIEW":
        return a.modelStatus_IN_REVIEW;
      case "APPROVED":
        return a.modelStatus_APPROVED;
      case "REJECTED":
        return a.modelStatus_REJECTED;
      default:
        return s;
    }
  }

  const statusParam = searchParams?.status;
  const where =
    statusParam &&
    ["UNCHECKED", "IN_REVIEW", "APPROVED", "REJECTED"].includes(statusParam)
      ? { status: statusParam as ModelCheckStatus }
      : {};

  const models = await prisma.computerModel.findMany({
    where,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  const err = searchParams?.error;
  const errMsg =
    err === "missing"
      ? a.modelsErrorMissing
      : err === "year"
        ? a.modelsErrorYear
        : err === "duplicate"
          ? a.modelsErrorDuplicate
          : err === "id"
            ? a.modelsErrorId
            : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/admin" className="text-sparkki-green underline">
        ← {a.dashboard}
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-ink">{a.models}</h1>
      <p className="mt-2 text-lg text-fog">{a.modelsIntro}</p>

      {errMsg ? (
        <p className="mt-4 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-ink">
          {errMsg}
        </p>
      ) : null}

      <section className="sparkki-card mt-8 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-ink">{a.modelsAddTitle}</h2>
        <form action={createComputerModel} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label htmlFor="m-make" className="mb-2 block font-semibold">
              {a.modelsFieldMake}
            </label>
            <input
              id="m-make"
              name="make"
              required
              className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="m-model" className="mb-2 block font-semibold">
              {a.modelsFieldModel}
            </label>
            <input
              id="m-model"
              name="model"
              required
              className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
            />
          </div>
          <div>
            <label htmlFor="m-yf" className="mb-2 block font-semibold">
              {a.modelsFieldYearFrom}
            </label>
            <input
              id="m-yf"
              name="yearFrom"
              type="number"
              inputMode="numeric"
              className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
            />
          </div>
          <div>
            <label htmlFor="m-yt" className="mb-2 block font-semibold">
              {a.modelsFieldYearTo}
            </label>
            <input
              id="m-yt"
              name="yearTo"
              type="number"
              inputMode="numeric"
              className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
            />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="min-h-tap rounded-xl bg-sparkki-green px-6 py-3 font-semibold text-canvas hover:opacity-[0.85]"
            >
              {a.modelsAddSubmit}
            </button>
          </div>
        </form>
      </section>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={a.modelsFilterLabel}>
        <Link
          href="/admin/models"
          className={`min-h-tap rounded-lg border border-em px-4 py-2 font-semibold ${
            !statusParam ? "border-g bg-sparkki-green text-canvas" : "bg-card hover:bg-canvas"
          }`}
        >
          {a.filterAll}
        </Link>
        {(["UNCHECKED", "IN_REVIEW", "APPROVED", "REJECTED"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/models?status=${s}`}
            className={`min-h-tap rounded-lg border border-em px-4 py-2 font-semibold ${
              statusParam === s ? "border-g bg-sparkki-green text-canvas" : "bg-card hover:bg-canvas"
            }`}
          >
            {statusLabel(s)}
          </Link>
        ))}
      </div>

      <div className="sparkki-card mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-lg">
          <thead className="border-b border-edge bg-canvas">
            <tr>
              <th className="px-4 py-3 font-semibold">{a.modelsColMake}</th>
              <th className="px-4 py-3 font-semibold">{a.modelsColModel}</th>
              <th className="px-4 py-3 font-semibold">{a.modelsColYears}</th>
              <th className="px-4 py-3 font-semibold">{a.modelsColStatus}</th>
              <th className="px-4 py-3 font-semibold">{a.modelsColUpdated}</th>
            </tr>
          </thead>
          <tbody>
            {models.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-fog">
                  {a.modelsEmpty}
                </td>
              </tr>
            ) : (
              models.map((m) => (
                <tr key={m.id} className="border-b border-edge hover:bg-canvas/80">
                  <td className="px-4 py-3">
                    <Link href={`/admin/models/${m.id}`} className="font-medium text-sparkki-green underline">
                      {m.make}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/models/${m.id}`} className="text-ink underline">
                      {m.model}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink">{formatYears(m.yearFrom, m.yearTo)}</td>
                  <td className="px-4 py-3">{statusLabel(m.status)}</td>
                  <td className="px-4 py-3 text-fog">
                    {m.updatedAt.toLocaleDateString("fi-FI")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
