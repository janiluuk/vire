import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  FAQAccordion,
  InfoBlock,
  VisualExplainer,
} from "@/components/ui/DesignSystemSections";
import { localePathAlternates } from "@/lib/site/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "tietoa.huolia" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...localePathAlternates(locale, "/tietoa/huolia"),
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

export default async function CommonConcernsPage() {
  const t = await getTranslations("tietoa.huolia");

  const faqItems = (["q1", "q2", "q3", "q4", "q5", "q6"] as const).map((key) => ({
    question: t(`concerns.${key}.question`),
    answer: t(`concerns.${key}.answer`),
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-16">
      <InfoBlock eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />

      <FAQAccordion items={faqItems} />

      <VisualExplainer
        eyebrow={t("supportEyebrow")}
        title={t("supportTitle")}
        body={t("supportBody")}
        points={[t("supportPoint1"), t("supportPoint2"), t("supportPoint3"), t("supportPoint4")]}
      />
    </div>
  );
}
