import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localePathAlternates } from "@/lib/site/seo";
import { TryLinuxSection } from "@/components/tietoa/TryLinuxSection";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "tietoa" });
  return {
    title: t("linux.metaTitle"),
    description: t("linux.metaDescription"),
    ...localePathAlternates(locale, "/tietoa/linux"),
  };
}

export default async function TietoaLinuxPage() {
  const t = await getTranslations("tietoa.linux");

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
        <p className="mt-4 text-lg leading-relaxed text-ink">{t("body")}</p>
      </header>
      <TryLinuxSection />
    </div>
  );
}
