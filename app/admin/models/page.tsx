import Link from "next/link";
import { ModelCheckStatus } from "@prisma/client";
import { createComputerModel } from "@/app/admin/models/actions";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import fiMessages from "@/messages/fi.json";

const a = fiMessages.admin;

function formatYears(yearFrom: number | null, yearTo: number | null) {
  if (yearFrom != null && yearTo != null) return `${yearFrom}–${yearTo}`;
  if (yearFrom != null) return String(yearFrom);
  if (yearTo != null) return String(yearTo);
  return "—";
}

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

export default async function AdminModelsPage({
  searchParams,
}: {
  searchParams?: { status?: string; error?: string };
}) {
  await requireAdmin();

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
      <Link href="/admin" className="text-verso-green underline">
        ← {a.dashboard}
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">{a.models}</h1>
      <p className="mt-2 text-lg text-gray-700">{a.modelsIntro}</p>

      {errMsg ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-gray-900">
          {errMsg}
        </p>
      ) : null}

      <section className="verso-card mt-8 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900">{a.modelsAddTitle}</h2>
        <form action={createComputerModel} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label htmlFor="m-make" className="mb-2 block font-semibold">
              {a.modelsFieldMake}
            </label>
            <input
              id="m-make"
              name="make"
              required
              className="min-h-tap w-full rounded-lg border border-gray-300 px-4 text-lg"
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
              className="min-h-tap w-full rounded-lg border border-gray-300 px-4 text-lg"
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
              className="min-h-tap w-full rounded-lg border border-gray-300 px-4 text-lg"
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
              className="min-h-tap w-full rounded-lg border border-gray-300 px-4 text-lg"
            />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="min-h-tap rounded-xl bg-verso-green px-6 py-3 font-semibold text-white hover:bg-[#178f68]"
            >
              {a.modelsAddSubmit}
            </button>
          </div>
        </form>
      </section>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={a.modelsFilterLabel}>
        <Link
          href="/admin/models"
          className={`min-h-tap rounded-lg px-4 py-2 font-semibold ring-1 ring-gray-200 ${
            !statusParam ? "bg-verso-green text-white ring-verso-green" : "bg-white hover:bg-gray-50"
          }`}
        >
          {a.filterAll}
        </Link>
        {(["UNCHECKED", "IN_REVIEW", "APPROVED", "REJECTED"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/models?status=${s}`}
            className={`min-h-tap rounded-lg px-4 py-2 font-semibold ring-1 ring-gray-200 ${
              statusParam === s ? "bg-verso-green text-white ring-verso-green" : "bg-white hover:bg-gray-50"
            }`}
          >
            {statusLabel(s)}
          </Link>
        ))}
      </div>

      <div className="verso-card mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-lg">
          <thead className="border-b border-gray-200 bg-gray-50">
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
                <td colSpan={5} className="px-4 py-8 text-center text-gray-600">
                  {a.modelsEmpty}
                </td>
              </tr>
            ) : (
              models.map((m) => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <Link href={`/admin/models/${m.id}`} className="font-medium text-verso-green underline">
                      {m.make}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/models/${m.id}`} className="text-gray-900 underline">
                      {m.model}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{formatYears(m.yearFrom, m.yearTo)}</td>
                  <td className="px-4 py-3">{statusLabel(m.status)}</td>
                  <td className="px-4 py-3 text-gray-600">
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
