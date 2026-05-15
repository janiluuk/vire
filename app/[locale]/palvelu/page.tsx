import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ComponentSourcingSection } from "@/components/palvelu/ComponentSourcingSection";
import {
  BenefitGrid,
  FAQAccordion,
  InfoBlock,
  InteractiveDiagram,
  TransformationCard,
  VisualExplainer,
} from "@/components/ui/DesignSystemSections";
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
    ...localePathAlternates(locale, "/palvelu"),
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

export default async function PalveluPage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("palvelu");
  const { locale } = params;

  const processItems = [
    {
      step: "01",
      title: t("flow1Title"),
      body: t("flow1Body"),
    },
    {
      step: "02",
      title: t("flow2Title"),
      body: t("flow2Body"),
    },
    {
      step: "03",
      title: t("flow3Title"),
      body: t("flow3Body"),
    },
    {
      step: "04",
      title: t("flow4Title"),
      body: t("flow4Body"),
    },
  ];

  const logisticsItems = [
    {
      icon: "↔",
      title: t("logisticsPickupTitle"),
      body: t("logisticsPickupBody"),
      accent: "accent" as const,
    },
    {
      icon: "□",
      title: t("logisticsPackagingTitle"),
      body: t("logisticsPackagingBody"),
    },
    {
      icon: "✦",
      title: t("logisticsTurnaroundTitle"),
      body: t("logisticsTurnaroundBody"),
      accent: "amber" as const,
    },
    {
      icon: "✓",
      title: t("logisticsHandoffTitle"),
      body: t("logisticsHandoffBody"),
    },
  ];

  const migrationItems = [
    {
      question: t("migrationFaqQ1"),
      answer: t("migrationFaqA1"),
    },
    {
      question: t("migrationFaqQ2"),
      answer: t("migrationFaqA2"),
    },
    {
      question: t("migrationFaqQ3"),
      answer: t("migrationFaqA3"),
    },
  ];

  const supportItems = [
    {
      icon: "✉",
      title: t("supportHumanTitle"),
      body: t("supportHumanBody"),
      accent: "accent" as const,
    },
    {
      icon: "⌁",
      title: t("supportTransparentTitle"),
      body: t("supportTransparentBody"),
    },
    {
      icon: "▣",
      title: t("supportGuidesTitle"),
      body: t("supportGuidesBody"),
    },
    {
      icon: "◎",
      title: t("supportCareTitle"),
      body: t("supportCareBody"),
      accent: "amber" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-content space-y-16 px-6 py-12 sm:px-12 sm:py-16">
      <section className="sparkki-hero">
        <div className="sparkki-hero-inner">
          <p className="sparkki-eyebrow justify-center">{t("eyebrow")}</p>
          <h1 className="font-display text-balance text-4xl font-extrabold tracking-hero text-ink sm:text-5xl md:text-[3.25rem]">
            {t("title")}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-ink">
            {t("intro")}
          </p>
        </div>
      </section>

      <InfoBlock title={t("howTitle")} intro={t("howIntro")}>
        <InteractiveDiagram items={processItems} />
      </InfoBlock>

      <TransformationCard
        title={t("storyTitle")}
        intro={t("storyIntro")}
        beforeLabel={t("storyBeforeLabel")}
        afterLabel={t("storyAfterLabel")}
        beforeItems={[t("storyBefore1"), t("storyBefore2"), t("storyBefore3")]}
        afterItems={[t("storyAfter1"), t("storyAfter2"), t("storyAfter3")]}
      />

      <InfoBlock title={t("logisticsTitle")} intro={t("logisticsIntro")}>
        <BenefitGrid items={logisticsItems} columns={4} />
      </InfoBlock>

      <InfoBlock title={t("migrationFaqTitle")} intro={t("migrationFaqIntro")}>
        <FAQAccordion items={migrationItems} />
      </InfoBlock>

      <VisualExplainer
        eyebrow={t("backupsEyebrow")}
        title={t("backupsTitle")}
        body={t("backupsP1")}
        points={[t("backupsP2"), t("backupsPoint1"), t("backupsPoint2"), t("backupsPoint3")]}
        accent="neutral"
      />

      <ComponentSourcingSection />

      <InfoBlock title={t("supportTitle")} intro={t("supportIntro")}>
        <BenefitGrid items={supportItems} columns={4} />
      </InfoBlock>

      <section
        aria-labelledby="b2b-title"
        className="sparkki-card border-g/30 bg-g/[0.05] p-8 sm:p-10"
      >
        <h2 id="b2b-title" className="font-display text-2xl font-extrabold text-ink">
          {t("b2bBanner")}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink">{t("b2b.intro")}</p>
        <Link href="/palvelu/b2b" className="sparkki-btn-secondary mt-6">
          {t("b2bCta")}
        </Link>
      </section>

      <InfoBlock title={t("pricingTitle")} intro={t("pricingNote")} />

      <OrderWizardLazy locale={locale} />
    </div>
  );
}
