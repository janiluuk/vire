import { getTranslations } from "next-intl/server";
import { HomeValueBenefits } from "@/components/home/HomeValueBenefits";
import { ComponentSourcingSection } from "@/components/palvelu/ComponentSourcingSection";
import { SpeedBar } from "@/components/home/SpeedBar";
import { KONEET_SECTION_ID } from "@/components/koneet/koneet-section-id";
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
  const pillars = [
    { title: t("heroPillar1Title"), body: t("heroPillar1Body") },
    { title: t("heroPillar2Title"), body: t("heroPillar2Body") },
    { title: t("heroPillar3Title"), body: t("heroPillar3Body") },
  ];

  return (
    <section className="sparkki-hero">
      <div className="sparkki-hero-inner">
        <p className="sparkki-eyebrow justify-center">{t("eyebrow")}</p>
        <h1 className="font-display text-balance text-4xl font-extrabold tracking-hero text-ink sm:text-5xl md:text-[3.25rem]">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-ink">
          {t("heroLead")}
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-light leading-relaxed text-fog">
          {t("heroSupport")}
        </p>

        <ul className="mx-auto mt-10 grid max-w-4xl gap-3 text-left sm:grid-cols-3">
          {pillars.map((pillar) => (
            <li
              key={pillar.title}
              className="rounded-spark-lg border border-edge bg-canvas/40 px-4 py-4 sm:px-5"
            >
              <p className="font-display text-base font-bold text-ink">{pillar.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-fog">{pillar.body}</p>
            </li>
          ))}
        </ul>

        <p className="mt-10">
          <a href={`#${KONEET_SECTION_ID}`} className="sparkki-btn-primary sparkki-pressable">
            {t("heroCtaCheck")}
          </a>
        </p>
      </div>
    </section>
  );
}

export async function PalveluMainContent() {
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
      <HomeValueBenefits />

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

      <SpeedBar />

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
