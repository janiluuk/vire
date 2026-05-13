import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localePathAlternates } from "@/lib/site/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "tietoa" });
  return {
    title: t("huolia.metaTitle"),
    description: t("huolia.metaDescription"),
    ...localePathAlternates(locale, "/tietoa/huolia"),
  };
}

export default async function TietoaHuoliaPage() {
  const t = await getTranslations("tietoa.huolia");

  const keys = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-g">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg font-light leading-relaxed text-fog">{t("intro")}</p>
      </header>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {keys.map((k) => (
          <article
            key={k}
            className="rounded-xl border border-edge bg-card p-5"
          >
            <h2 className="mb-2 flex items-start gap-2 font-display text-[15px] font-bold leading-snug text-ink">
              <span className="text-amber" aria-hidden>
                ?
              </span>
              {t(`concerns.${k}.question`)}
            </h2>
            <p className="text-[13px] font-light leading-relaxed text-fog">
              {t(`concerns.${k}.answer`)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
