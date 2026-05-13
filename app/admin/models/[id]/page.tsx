import Link from "next/link";
import { notFound } from "next/navigation";
import { updateComputerModel } from "@/app/admin/models/actions";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";

function formatYears(yearFrom: number | null, yearTo: number | null) {
  if (yearFrom != null && yearTo != null) return `${yearFrom}–${yearTo}`;
  if (yearFrom != null) return String(yearFrom);
  if (yearTo != null) return String(yearTo);
  return "—";
}

export default async function AdminModelDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string; saved?: string };
}) {
  await requireAdmin();
  const a = getAdminMessages().admin;
  const row = await prisma.computerModel.findUnique({ where: { id: params.id } });
  if (!row) notFound();

  const err = searchParams?.error;
  const errMsg =
    err === "compatible"
      ? a.modelErrorCompatible
      : err === "verdict"
        ? a.modelErrorVerdict
        : err === "ram"
          ? a.modelErrorRam
          : null;

  const saved = searchParams?.saved === "1";

  const compatibleValue =
    row.compatible === true ? "true" : row.compatible === false ? "false" : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin/models" className="text-sparkki-green underline">
        ← {a.models}
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-ink">{a.modelDetailTitle}</h1>
      <p className="mt-2 text-lg text-ink">
        <span className="font-semibold">{row.make}</span> {row.model}{" "}
        <span className="text-fog">({formatYears(row.yearFrom, row.yearTo)})</span>
      </p>
      {row.checkedAt ? (
        <p className="mt-2 text-sm text-fog">
          {a.modelChecked}: {row.checkedAt.toLocaleString("fi-FI")}
          {row.checkedBy ? ` · ${row.checkedBy}` : ""}
        </p>
      ) : null}

      {saved ? (
        <p className="mt-4 rounded-lg border border-g/40 bg-g/10 px-4 py-3 text-ink">
          {a.modelSaved}
        </p>
      ) : null}
      {errMsg ? (
        <p className="mt-4 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-ink">
          {errMsg}
        </p>
      ) : null}

      <form action={updateComputerModel} className="sparkki-card mt-8 space-y-6 p-6 sm:p-8">
        <input type="hidden" name="id" value={row.id} />

        <fieldset>
          <legend className="mb-3 font-semibold text-ink">{a.modelFieldCompatible}</legend>
          <div className="flex flex-wrap gap-6">
            <label className="inline-flex cursor-pointer items-center gap-2 text-lg">
              <input
                type="radio"
                name="compatible"
                value="true"
                required
                defaultChecked={compatibleValue === "true"}
              />
              {a.modelCompatibleYes}
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-lg">
              <input
                type="radio"
                name="compatible"
                value="false"
                defaultChecked={compatibleValue === "false"}
              />
              {a.modelCompatibleNo}
            </label>
          </div>
          <p className="mt-2 text-sm text-fog">{a.modelCompatibleHint}</p>
        </fieldset>

        <div>
          <label htmlFor="verdict" className="mb-2 block font-semibold">
            {a.modelFieldVerdict}
          </label>
          <textarea
            id="verdict"
            name="verdict"
            required
            rows={4}
            defaultValue={row.verdict ?? ""}
            className="w-full rounded-lg border border-em px-4 py-3 text-lg"
          />
        </div>

        <div>
          <label htmlFor="ssdSlot" className="mb-2 block font-semibold">
            {a.modelFieldSsdSlot}
          </label>
          <input
            id="ssdSlot"
            name="ssdSlot"
            defaultValue={row.ssdSlot ?? ""}
            className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
          />
        </div>

        <div>
          <label htmlFor="maxRamGb" className="mb-2 block font-semibold">
            {a.modelFieldMaxRam}
          </label>
          <input
            id="maxRamGb"
            name="maxRamGb"
            type="number"
            min={0}
            defaultValue={row.maxRamGb ?? ""}
            className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
          />
        </div>

        <div>
          <label htmlFor="notes" className="mb-2 block font-semibold">
            {a.modelFieldNotes}
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={row.notes ?? ""}
            className="w-full rounded-lg border border-em px-4 py-3 text-lg"
          />
        </div>

        <button
          type="submit"
          className="min-h-tap rounded-xl bg-sparkki-green px-8 py-3 font-semibold text-canvas hover:opacity-[0.85]"
        >
          {a.modelSave}
        </button>
      </form>
    </div>
  );
}
