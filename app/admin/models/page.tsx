import Link from "next/link";
import { ModelCheckStatus } from "@prisma/client";
import {
  createComputerModel,
  importComputerModelsCsv,
} from "@/app/admin/models/actions";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";

function formatYears(yearFrom: number | null, yearTo: number | null) {
  if (yearFrom != null && yearTo != null) return `${yearFrom}–${yearTo}`;
  if (yearFrom != null) return String(yearFrom);
  if (yearTo != null) return String(yearTo);
  return "—";
}

function truncate(s: string | null, max: number): string {
  if (!s) return "—";
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export default async function AdminModelsPage({
  searchParams,
}: {
  searchParams?: {
    status?: string;
    error?: string;
    detail?: string;
    imported?: string;
    skipped?: string;
    parseErrors?: string;
  };
}) {
  await requireAdmin();
  const a = getAdminMessages().admin;
  const now = new Date();

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

  const [models, referenceCount, internetCacheCount, internetCacheRows] =
    await Promise.all([
      prisma.computerModel.findMany({
        where,
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      }),
      prisma.laptopReferenceSpec.count(),
      prisma.laptopSpecsInternetCache.count({
        where: { expiresAt: { gt: now } },
      }),
      prisma.laptopSpecsInternetCache.findMany({
        where: { expiresAt: { gt: now } },
        orderBy: { updatedAt: "desc" },
        take: 80,
      }),
    ]);

  const compatibilityTotal = await prisma.computerModel.count();

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
            : err === "csv_empty"
              ? a.modelsErrorCsvEmpty
              : err === "csv_parse"
                ? a.modelsErrorCsvParse
                : null;

  const imported = searchParams?.imported
    ? parseInt(searchParams.imported, 10)
    : null;
  const skipped = searchParams?.skipped
    ? parseInt(searchParams.skipped, 10)
    : null;
  const parseErrors = searchParams?.parseErrors
    ? parseInt(searchParams.parseErrors, 10)
    : null;
  const importOk =
    imported != null &&
    !Number.isNaN(imported) &&
    skipped != null &&
    !Number.isNaN(skipped);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
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

      {importOk ? (
        <p className="mt-4 rounded-lg border border-g/30 bg-g/10 px-4 py-3 text-ink">
          {a.modelsCsvSuccess
            .replace("{created}", String(imported))
            .replace("{skipped}", String(skipped))
            .replace("{parseErrors}", String(parseErrors ?? 0))}
        </p>
      ) : null}

      <section className="mt-8" aria-labelledby="models-catalog-title">
        <h2 id="models-catalog-title" className="text-xl font-bold text-ink">
          {a.modelsCatalogTitle}
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          <li className="sparkki-card rounded-2xl p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-fog">
              {a.modelsStatCompatibility}
            </p>
            <p className="mt-2 font-display text-3xl font-extrabold text-ink">
              {compatibilityTotal}
            </p>
            <p className="mt-1 text-sm text-fog">{a.modelsStatCompatibilityHint}</p>
          </li>
          <li className="sparkki-card rounded-2xl p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-fog">
              {a.modelsStatReference}
            </p>
            <p className="mt-2 font-display text-3xl font-extrabold text-ink">
              {referenceCount.toLocaleString("fi-FI")}
            </p>
            <p className="mt-1 text-sm text-fog">{a.modelsStatReferenceHint}</p>
          </li>
          <li className="sparkki-card rounded-2xl p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-fog">
              {a.modelsStatInternetCache}
            </p>
            <p className="mt-2 font-display text-3xl font-extrabold text-ink">
              {internetCacheCount}
            </p>
            <p className="mt-1 text-sm text-fog">{a.modelsStatInternetCacheHint}</p>
          </li>
        </ul>
      </section>

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

      <section className="sparkki-card mt-8 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-ink">{a.modelsCsvTitle}</h2>
        <p className="mt-2 text-lg text-fog">{a.modelsCsvIntro}</p>
        <form action={importComputerModelsCsv} className="mt-4 space-y-4">
          <textarea
            name="csv"
            rows={8}
            className="w-full rounded-lg border border-em bg-canvas px-4 py-3 font-mono text-sm text-ink"
            placeholder="make,model,yearFrom,yearTo&#10;Lenovo,ThinkPad T450,2015,2016"
            spellCheck={false}
          />
          <button
            type="submit"
            className="min-h-tap rounded-xl bg-sparkki-green px-6 py-3 font-semibold text-canvas hover:opacity-[0.85]"
          >
            {a.modelsCsvSubmit}
          </button>
        </form>
      </section>

      <section className="mt-10" aria-labelledby="compat-models-title">
        <h2 id="compat-models-title" className="text-xl font-bold text-ink">
          {a.modelsStatCompatibility}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={a.modelsFilterLabel}>
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

        <div className="sparkki-card mt-4 overflow-x-auto">
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
                      <Link
                        href={`/admin/models/${m.id}`}
                        className="font-medium text-sparkki-green underline"
                      >
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
      </section>

      <section className="mt-10" aria-labelledby="internet-cache-title">
        <h2 id="internet-cache-title" className="text-xl font-bold text-ink">
          {a.modelsInternetCacheTitle}
        </h2>
        <p className="mt-2 text-lg text-fog">{a.modelsInternetCacheIntro}</p>
        <div className="sparkki-card mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-base">
            <thead className="border-b border-edge bg-canvas">
              <tr>
                <th className="px-4 py-3 font-semibold">{a.modelsInternetColMake}</th>
                <th className="px-4 py-3 font-semibold">{a.modelsInternetColModel}</th>
                <th className="px-4 py-3 font-semibold">{a.modelsInternetColLocale}</th>
                <th className="px-4 py-3 font-semibold">{a.modelsInternetColSummary}</th>
                <th className="px-4 py-3 font-semibold">{a.modelsInternetColSpecUrl}</th>
                <th className="px-4 py-3 font-semibold">{a.modelsInternetColMeta}</th>
                <th className="px-4 py-3 font-semibold">{a.modelsInternetColFetched}</th>
                <th className="px-4 py-3 font-semibold">{a.modelsInternetColExpires}</th>
              </tr>
            </thead>
            <tbody>
              {internetCacheRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-fog">
                    {a.modelsInternetEmpty}
                  </td>
                </tr>
              ) : (
                internetCacheRows.map((row) => (
                  <tr key={row.id} className="border-b border-edge hover:bg-canvas/80">
                    <td className="px-4 py-3 font-medium text-ink">{row.makeDisplay}</td>
                    <td className="px-4 py-3 text-ink">{row.modelDisplay}</td>
                    <td className="px-4 py-3 font-mono text-sm uppercase text-fog">
                      {row.locale}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-sm text-ink">
                      {truncate(row.summary, 120)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {row.specUrl ? (
                        <a
                          href={row.specUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sparkki-green underline"
                        >
                          {truncate(row.specUrl, 40)}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-fog">
                      {a.modelsInternetMetaSearx.replace(
                        "{count}",
                        String(row.searxResultCount),
                      )}
                      {row.usedLlm ? ` · ${a.modelsInternetMetaLlm}` : ` · ${a.modelsInternetMetaSearchOnly}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-fog">
                      {row.updatedAt.toLocaleString("fi-FI")}
                    </td>
                    <td className="px-4 py-3 text-sm text-fog">
                      {row.expiresAt.toLocaleDateString("fi-FI")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
