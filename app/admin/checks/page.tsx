import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminLocale } from "@/lib/admin/get-admin-locale";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";
import { prisma } from "@/lib/db/prisma";

const PAGE_SIZE = 100;

function formatReasons(raw: unknown): string {
  if (Array.isArray(raw) && raw.every((x) => typeof x === "string")) {
    return raw.join(", ");
  }
  return JSON.stringify(raw);
}

export default async function AdminCompatibilityChecksPage() {
  await requireAdmin();
  const a = getAdminMessages().admin;
  const locale = getAdminLocale();
  const loc = locale === "en" ? "en-GB" : "fi-FI";

  const rows = await prisma.compatibilityCheck.findMany({
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    select: {
      id: true,
      createdAt: true,
      source: true,
      make: true,
      model: true,
      ramGb: true,
      diskType: true,
      status: true,
      reasons: true,
      speedGainEstimate: true,
    },
  });

  const statusLabel = (s: string) => {
    if (s === "compatible") return a.checksStatus_compatible;
    if (s === "borderline") return a.checksStatus_borderline;
    if (s === "incompatible") return a.checksStatus_incompatible;
    return s;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-lg">
        <Link href="/admin" className="font-semibold text-g hover:underline">
          {a.checksBack}
        </Link>
      </p>
      <header className="mt-4 border-b border-edge pb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
          {a.checksTitle}
        </h1>
        <p className="mt-2 max-w-3xl text-lg text-fog">{a.checksIntro}</p>
      </header>

      {rows.length === 0 ? (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-ink">{a.checksEmptyTitle}</h2>
          <p className="mt-2 text-lg text-fog">{a.checksEmptyDescription}</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-em">
          <table className="w-full min-w-[48rem] border-collapse text-left text-base">
            <thead className="bg-sunken text-sm font-semibold uppercase tracking-wide text-fog">
              <tr>
                <th className="px-4 py-3">{a.checksColWhen}</th>
                <th className="px-4 py-3">{a.checksColSource}</th>
                <th className="px-4 py-3">{a.checksColMake}</th>
                <th className="px-4 py-3">{a.checksColModel}</th>
                <th className="px-4 py-3">{a.checksColStatus}</th>
                <th className="px-4 py-3">{a.checksColDisk}</th>
                <th className="px-4 py-3">{a.checksColRam}</th>
                <th className="px-4 py-3">{a.checksColSpeed}</th>
                <th className="px-4 py-3">{a.checksColReasons}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-em odd:bg-card/40">
                  <td className="whitespace-nowrap px-4 py-3 text-ink">
                    {r.createdAt.toLocaleString(loc)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-fog">{r.source}</td>
                  <td className="px-4 py-3 text-ink">{r.make}</td>
                  <td className="px-4 py-3 text-ink">{r.model}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">
                    {statusLabel(r.status)}
                  </td>
                  <td className="px-4 py-3 text-fog">{r.diskType ?? "—"}</td>
                  <td className="px-4 py-3 text-fog">
                    {r.ramGb != null ? `${r.ramGb} GB` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-fog">
                    {r.speedGainEstimate}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-fog" title={formatReasons(r.reasons)}>
                    {formatReasons(r.reasons)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-em bg-sunken px-4 py-2 text-sm text-fog">
            {a.checksShowing.replace("{n}", String(rows.length))}
          </p>
        </div>
      )}
    </div>
  );
}
