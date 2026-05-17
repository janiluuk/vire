import { getTranslations } from "next-intl/server";
import { HomeCompatibilityCheckerDynamic } from "@/components/koneet/HomeCompatibilityCheckerDynamic";
import { ComponentSourcingSection } from "@/components/palvelu/ComponentSourcingSection";
import { PalveluB2bTeaser } from "@/components/palvelu/PalveluB2bTeaser";
import { ServicePricingSection } from "@/components/palvelu/ServicePricingSection";
import {
  BenefitGrid,
  FAQAccordion,
  InfoBlock,
  InteractiveDiagram,
  TransformationCard,
  VisualExplainer,
} from "@/components/ui/DesignSystemSections";

export async function PalveluHero() {
  const t = await getTranslations("palvelu");
  return (
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
  );
}

type PalveluMainContentProps = {
  locale: string;
  initialComputer?: string;
};

export async function PalveluMainContent({
  locale,
  initialComputer = "",
}: PalveluMainContentProps) {
  const t = await getTranslations("palvelu");

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
    <>
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

      <HomeCompatibilityCheckerDynamic
        locale={locale}
        initialDescription={initialComputer}
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
        points={[t("backupsPoint1")]}
        accent="neutral"
      />

      <ComponentSourcingSection />

      <InfoBlock title={t("supportTitle")} intro={t("supportIntro")}>
        <BenefitGrid items={supportItems} columns={4} />
      </InfoBlock>

      <ServicePricingSection />

      <PalveluB2bTeaser />
    </>
  );
}
