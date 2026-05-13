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
    title: t("vakaus.metaTitle"),
    description: t("vakaus.metaDescription"),
    ...localePathAlternates(locale, "/tietoa/vakaus"),
  };
}

export default async function TietoaVakausPage() {
  const t = await getTranslations("tietoa.vakaus");

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
      <div className="space-y-6 text-lg font-light leading-relaxed text-fog">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
      </div>
    </div>
  );
}
