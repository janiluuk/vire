import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localePathAlternates } from "@/lib/site/seo";

const BENEFIT_KEYS = ["b1", "b2", "b3", "b4", "b5", "b6"] as const;

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

      <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5" role="list">
        {BENEFIT_KEYS.map((key) => (
          <li
            key={key}
            className="vire-card-hover border border-edge bg-card p-6 sm:p-7"
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
