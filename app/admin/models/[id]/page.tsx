import Link from "next/link";
import { notFound } from "next/navigation";
import { updateComputerModel } from "@/app/admin/models/actions";
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

export default async function AdminModelDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string; saved?: string };
}) {
  await requireAdmin();
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
      <Link href="/admin/models" className="text-verso-green underline">
        ← {a.models}
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">{a.modelDetailTitle}</h1>
      <p className="mt-2 text-lg text-gray-800">
        <span className="font-semibold">{row.make}</span> {row.model}{" "}
        <span className="text-gray-600">({formatYears(row.yearFrom, row.yearTo)})</span>
      </p>
      {row.checkedAt ? (
        <p className="mt-2 text-sm text-gray-600">
          {a.modelChecked}: {row.checkedAt.toLocaleString("fi-FI")}
          {row.checkedBy ? ` · ${row.checkedBy}` : ""}
        </p>
      ) : null}

      {saved ? (
        <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-gray-900">
          {a.modelSaved}
        </p>
      ) : null}
      {errMsg ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-gray-900">
          {errMsg}
        </p>
      ) : null}

      <form action={updateComputerModel} className="verso-card mt-8 space-y-6 p-6 sm:p-8">
        <input type="hidden" name="id" value={row.id} />

        <fieldset>
          <legend className="mb-3 font-semibold text-gray-900">{a.modelFieldCompatible}</legend>
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
          <p className="mt-2 text-sm text-gray-600">{a.modelCompatibleHint}</p>
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
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
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
            className="min-h-tap w-full rounded-lg border border-gray-300 px-4 text-lg"
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
            className="min-h-tap w-full rounded-lg border border-gray-300 px-4 text-lg"
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
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
          />
        </div>

        <button
          type="submit"
          className="min-h-tap rounded-xl bg-verso-green px-8 py-3 font-semibold text-white hover:bg-[#178f68]"
        >
          {a.modelSave}
        </button>
      </form>
    </div>
  );
}
