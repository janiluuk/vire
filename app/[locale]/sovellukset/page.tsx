import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import appsData from "@/data/apps.json";
import { localePathAlternates } from "@/lib/site/seo";
import { AppGrid, type AppItem } from "@/components/apps/AppGrid";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "sovellukset" });
  return {
    title: t("title"),
    description: t("intro"),
    ...localePathAlternates(locale, "/sovellukset"),
    openGraph: {
      title: t("title"),
      description: t("intro"),
      type: "website",
      locale: locale === "fi" ? "fi_FI" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("intro"),
    },
  };
}

export default async function SovelluksetPage() {
  const t = await getTranslations("sovellukset");
  const apps = appsData as AppItem[];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <header>
        <h1 className="text-4xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-4 text-xl text-ink">{t("intro")}</p>
      </header>
      <AppGrid apps={apps} />
    </div>
  );
}
