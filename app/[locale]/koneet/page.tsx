import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { computerModelSlug } from "@/lib/site/computer-model-slug";
import { localePathAlternates } from "@/lib/site/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "koneet" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...localePathAlternates(locale, "/koneet"),
  };
}

export default async function KoneetPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const t = await getTranslations("koneet");
  const q = searchParams.q?.trim().toLowerCase() ?? "";

  const models = await prisma.computerModel.findMany({
    orderBy: [{ make: "asc" }, { model: "asc" }],
  });

  const filtered =
    q.length > 0
      ? models.filter(
          (m) =>
            m.make.toLowerCase().includes(q) ||
            m.model.toLowerCase().includes(q),
        )
      : models;

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
      <header>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg font-light leading-relaxed text-fog">{t("intro")}</p>
      </header>

      <form className="compat-search flex flex-wrap items-center gap-3 rounded-[10px] border border-em bg-card px-4 py-3" role="search" method="get">
        <label htmlFor="koneet-q" className="sr-only">
          {t("searchLabel")}
        </label>
        <input
          id="koneet-q"
          name="q"
          type="search"
          defaultValue={searchParams.q ?? ""}
          placeholder={t("searchPlaceholder")}
          className="min-h-tap flex-1 border-0 bg-transparent text-lg font-light text-ink placeholder:text-dust focus:outline-none"
        />
        <button
          type="submit"
          className="min-h-tap rounded-lg bg-g px-5 py-2.5 text-sm font-semibold text-canvas hover:opacity-90"
        >
          {t("searchLabel")}
        </button>
      </form>

      {models.length === 0 ? (
        <p className="text-lg text-fog">{t("noModels")}</p>
      ) : filtered.length === 0 ? (
        <p className="text-lg text-fog">{t("empty")}</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((m) => {
            const slug = computerModelSlug(m.make, m.model);
            const badge =
              m.compatible === true
                ? t("compatYes")
                : m.compatible === false
                  ? t("compatNo")
                  : t("compatUnknown");
            const badgeClass =
              m.compatible === true
                ? "border-g text-g"
                : m.compatible === false
                  ? "border-danger/40 text-danger"
                  : "border-amber/40 text-amber";
            return (
              <li key={m.id}>
                <Link
                  href={`/koneet/${slug}`}
                  className="model-card flex cursor-pointer items-center gap-4 rounded-xl border border-edge bg-card p-5 transition-colors duration-150 hover:border-em"
                >
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wide ${badgeClass}`}
                  >
                    {badge}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {m.make} {m.model}
                    </p>
                    <p className="font-mono text-[11px] text-dust">
                      {[m.yearFrom, m.yearTo].filter(Boolean).length > 0
                        ? `${t("years")}: ${m.yearFrom ?? "—"}–${m.yearTo ?? "—"}`
                        : t("statusUnchecked")}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
