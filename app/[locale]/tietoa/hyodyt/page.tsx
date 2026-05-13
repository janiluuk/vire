import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localePathAlternates } from "@/lib/site/seo";

const BENEFIT_KEYS = ["b1", "b2", "b3", "b4", "b5", "b6"] as const;

const REASON_HIGHLIGHT_KEYS = ["hw", "free", "sec"] as const;
const HIGHLIGHT_POINT_COUNT = 3 as const;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "tietoa.hyodyt" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...localePathAlternates(locale, "/tietoa/hyodyt"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
      locale: locale === "fi" ? "fi_FI" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

export default async function TietoaHyodytPage() {
  const t = await getTranslations("tietoa.hyodyt");

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header>
        <p className="font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-g">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg font-light leading-relaxed text-fog">{t("intro")}</p>
      </header>

      <section
        aria-labelledby="hyodyt-reasoning-highlights"
        className="space-y-6 border-b border-edge pb-10"
      >
        <div>
          <h2
            id="hyodyt-reasoning-highlights"
            className="font-display text-2xl font-bold tracking-tight text-ink"
          >
            {t("highlightsTitle")}
          </h2>
          <p className="mt-3 max-w-3xl text-lg font-light leading-relaxed text-fog">
            {t("highlightsIntro")}
          </p>
        </div>
        <div className="grid gap-5">
          {REASON_HIGHLIGHT_KEYS.map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-g/35 bg-g/[0.07] px-6 py-6 sm:px-8 sm:py-7"
            >
              <h3 className="text-xl font-bold text-ink">
                {t(`${key}HighlightTitle`)}
              </h3>
              <p className="mt-3 text-base font-light leading-relaxed text-ink/95">
                {t(`${key}HighlightLead`)}
              </p>
              <ul className="mt-4 list-none space-y-2.5 text-base font-light leading-relaxed text-fog">
                {Array.from({ length: HIGHLIGHT_POINT_COUNT }, (_, i) => i + 1).map(
                  (n) => (
                    <li key={n} className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-g" aria-hidden />
                      <span>{t(`${key}HighlightP${n}`)}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5" role="list">
        {BENEFIT_KEYS.map((key) => (
          <li
            key={key}
            className="vire-card-hover border border-edge p-6 sm:p-7"
          >
            <span
              className="mb-4 flex size-11 items-center justify-center rounded-xl bg-g/15 text-xl text-g"
              aria-hidden
            >
              {t(`${key}Icon`)}
            </span>
            <h2 className="text-lg font-bold text-ink">{t(`${key}Title`)}</h2>
            <p className="mt-2 text-base font-light leading-relaxed text-fog">
              {t(`${key}Body`)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
