import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import appsData from "@/data/apps.json";
import { localePathAlternates } from "@/lib/site/seo";
import { AppGrid, type AppItem } from "@/components/apps/AppGrid";
import { AppOsTabs } from "@/components/tietoa/AppOsTabs";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "tietoa" });
  return {
    title: t("apps.metaTitleWin"),
    description: t("apps.metaDescriptionWin"),
    ...localePathAlternates(locale, "/tietoa/sovellukset/windows"),
  };
}

export default async function TietoaAppsWindowsPage() {
  const t = await getTranslations("tietoa.apps");
  const apps = appsData as AppItem[];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-g">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          {t("titleWin")}
        </h1>
        <p className="mt-4 text-lg font-light leading-relaxed text-fog">{t("introWin")}</p>
      </header>
      <AppOsTabs />
      <AppGrid apps={apps} sourceOsFilter="windows" />
    </div>
  );
}
