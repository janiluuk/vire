import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LearnHubContent } from "@/components/tietoa/LearnHubContent";
import { localePathAlternates } from "@/lib/site/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "tietoa.hub" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...localePathAlternates(locale, "/tietoa"),
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

export default function TietoaHubPage() {
  return <LearnHubContent />;
}
