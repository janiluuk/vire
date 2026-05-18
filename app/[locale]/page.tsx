import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HomeCompatibilityCheckerDynamic } from "@/components/koneet/HomeCompatibilityCheckerDynamic";
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
    title: t("heroTitle"),
    description: t("metaDescription"),
    ...localePathAlternates(locale, ""),
    openGraph: {
      title: t("heroTitle"),
      description: t("metaDescription"),
      type: "website",
      locale: locale === "fi" ? "fi_FI" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("heroTitle"),
      description: t("metaDescription"),
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
        <HomeCompatibilityCheckerDynamic
          locale={locale}
          initialDescription={initialComputer}
        />
        <PalveluMainContent />
        <OrderWizardLazy locale={locale} />
      </div>
    </div>
  );
}
