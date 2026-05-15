import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CareSubscribeForm } from "@/components/care/CareSubscribeForm";
import {
  BenefitGrid,
  InfoBlock,
  TimelineSection,
  VisualExplainer,
} from "@/components/ui/DesignSystemSections";
import { localePathAlternates } from "@/lib/site/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "care" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...localePathAlternates(locale, "/care"),
  };
}

export default async function CarePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "care" });
  const careLocale = locale === "en" ? "en" : "fi";

  const tiers = [
    {
      key: "tierBasic" as const,
      desc: "tierBasicDesc" as const,
      price: "priceBasic" as const,
      featured: false,
    },
    {
      key: "tierPlus" as const,
      desc: "tierPlusDesc" as const,
      price: "pricePlus" as const,
      featured: true,
    },
    {
      key: "tierPro" as const,
      desc: "tierProDesc" as const,
      price: "pricePro" as const,
      featured: false,
    },
  ];

  const supportItems = [
    {
      icon: "✉",
      title: t("benefitEmailTitle"),
      body: t("benefitEmailBody"),
      accent: "accent" as const,
    },
    {
      icon: "⚑",
      title: t("benefitPriorityTitle"),
      body: t("benefitPriorityBody"),
    },
    {
      icon: "◇",
      title: t("benefitHealthTitle"),
      body: t("benefitHealthBody"),
      accent: "amber" as const,
    },
  ];

  const timelineItems = [
    {
      eyebrow: "D75",
      body: t("timelineD75"),
      accent: "amber" as const,
    },
    {
      eyebrow: "D88",
      body: t("timelineD88"),
      accent: "amber" as const,
    },
    {
      eyebrow: "D90",
      body: t("timelineD90"),
    },
    {
      eyebrow: "D91+",
      body: t("timelineD91"),
      accent: "accent" as const,
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
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-fog">
            {t("intro")}
          </p>
        </div>
      </section>

      <InfoBlock title={t("tiersHeading")} intro={t("tiersIntro")}>
        <div className="grid gap-4 md:grid-cols-3">
          {tiers.map(({ key, desc, price, featured }) => (
            <article
              key={key}
              className={`relative flex flex-col p-7 ${
                featured
                  ? "sparkki-card pricing-card-featured"
                  : "sparkki-card-hover"
              }`}
            >
              {featured ? (
                <span className="pricing-badge-featured">{t("featuredBadge")}</span>
              ) : null}
              <h3 className="font-display text-xl font-bold text-ink">{t(key)}</h3>
              <p className="mt-3 text-base leading-relaxed text-fog">{t(desc)}</p>
              <p className="mt-6 font-display text-[2.375rem] font-extrabold leading-none tracking-hero text-g">
                {t(price)}
                <span className="ml-2 text-lg font-normal text-fog">{t("perMonth")}</span>
              </p>
              {key === "tierBasic" ? (
                <CareSubscribeForm locale={careLocale} />
              ) : (
                <p className="mt-6 text-base leading-relaxed text-fog">
                  {t("tierHigherContact")}
                </p>
              )}
            </article>
          ))}
        </div>
      </InfoBlock>

      <InfoBlock title={t("benefitsTitle")} intro={t("benefitsIntro")}>
        <BenefitGrid items={supportItems} columns={3} />
      </InfoBlock>

      <InfoBlock title={t("timelineTitle")} intro={t("timelineIntro")}>
        <TimelineSection items={timelineItems} />
      </InfoBlock>

      <VisualExplainer
        eyebrow={t("ctaEyebrow")}
        title={t("ctaTitle")}
        body={t("ctaNote")}
        points={[t("ctaPoint1"), t("ctaPoint2"), t("ctaPoint3"), t("ctaPoint4")]}
      />

      <div className="text-center">
        <Link href="/tuki" className="sparkki-btn-primary">
          {t("ctaTuki")}
        </Link>
      </div>
    </div>
  );
}
