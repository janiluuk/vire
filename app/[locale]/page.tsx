import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PalveluHero, PalveluMainContent } from "@/components/palvelu/PalveluMainContent";
import { ServiceHubTabs } from "@/components/navigation/ServiceHubTabs";
import { OrderWizardLazy } from "@/components/wizard/OrderWizardLazy";
import { localePathAlternates } from "@/lib/site/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "palvelu" });
  return {
    title: t("title"),
    description: t("intro"),
    ...localePathAlternates(locale, ""),
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

export default async function HomePage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string; computer?: string };
}) {
  const { locale } = params;
  const initialComputer =
    searchParams.q?.trim() ??
    searchParams.computer?.trim() ??
    "";

  return (
    <div className="flex min-h-[50vh] flex-col">
      <ServiceHubTabs />
      <div className="mx-auto max-w-content flex-1 space-y-16 px-6 py-12 sm:px-12 sm:py-16">
        <PalveluHero />
        <PalveluMainContent locale={locale} initialComputer={initialComputer} />
        <OrderWizardLazy locale={locale} />
      </div>
    </div>
  );
}
