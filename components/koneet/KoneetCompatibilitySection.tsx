import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { searchComputerModels } from "@/lib/koneet/computer-model-db";
import { computerModelSlug } from "@/lib/site/computer-model-slug";

import { KONEET_SECTION_ID } from "@/components/koneet/koneet-section-id";
import { KoneetRequestCheckForm } from "@/components/koneet/KoneetRequestCheckForm";

export { KONEET_SECTION_ID };

type Props = {
  query?: string;
  locale?: string;
  /** GET form target path (default `/` for home embed). */
  searchPath?: string;
  /** Show “request a check” form (default on `/koneet` hub). */
  showRequestForm?: boolean;
};

export async function KoneetCompatibilitySection({
  query = "",
  locale = "fi",
  searchPath = "/",
  showRequestForm = false,
}: Props) {
  const t = await getTranslations("koneet");
  const q = query.trim();

  const models = await searchComputerModels(q);
  const filtered = models;

  return (
    <section
      id={KONEET_SECTION_ID}
      aria-labelledby="koneet-section-title"
      className="scroll-mt-28"
    >
      <header>
        <h2
          id="koneet-section-title"
          className="font-display text-3xl font-extrabold tracking-section text-ink"
        >
          {t("title")}
        </h2>
        <p className="mt-4 max-w-3xl text-lg font-light leading-relaxed text-fog">
          {t("intro")}
        </p>
      </header>

      <form
        className="compat-search mt-8 flex flex-wrap items-center gap-3 rounded-[10px] border border-em bg-card px-4 py-3"
        role="search"
        method="get"
        action={searchPath}
      >
        <label htmlFor="koneet-q" className="sr-only">
          {t("searchLabel")}
        </label>
        <input
          id="koneet-q"
          name="q"
          type="search"
          defaultValue={query}
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
        <p className="mt-6 text-lg text-fog">{t("noModels")}</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-lg text-fog">{t("empty")}</p>
      ) : (
        <ul className="mt-6 space-y-3">
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

      {showRequestForm ? (
        <KoneetRequestCheckForm locale={locale} />
      ) : null}
    </section>
  );
}
