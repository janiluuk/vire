import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TIER_BASE_CENTS } from "@/lib/billing/pricing";
import { SERVICE_PRICING_TIERS } from "@/lib/palvelu/service-pricing-tiers";
import { formatWizardPriceEuro } from "@/components/wizard/WizardPrice";
import { ServicePricingOrderCta } from "@/components/palvelu/ServicePricingOrderCta";

export async function ServicePricingSection() {
  const t = await getTranslations("palvelu");
  const tw = await getTranslations("palvelu.wizard");
  const th = await getTranslations("home");

  return (
    <section
      id="pricing-title"
      aria-labelledby="service-pricing-heading"
      className="scroll-mt-28 space-y-8"
    >
      <header className="max-w-3xl">
        <h2
          id="service-pricing-heading"
          className="font-display text-2xl font-extrabold tracking-section text-ink md:text-3xl"
        >
          {t("pricingTitle")}
        </h2>
        <p className="mt-3 text-lg font-light leading-relaxed text-fog">
          {t("pricingNote")}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SERVICE_PRICING_TIERS.map(({ tier, nameKey, descKey, featured, noteKey }) => (
          <article
            key={tier}
            className={`relative flex flex-col rounded-2xl border p-5 sm:p-6 ${
              featured
                ? "border-g bg-g/[0.06] shadow-sm"
                : "border-edge bg-card"
            }`}
          >
            {featured ? (
              <span className="pricing-badge-featured">{th("pricingBadgeFeatured")}</span>
            ) : null}
            <h3 className="font-display text-lg font-bold text-ink">{tw(nameKey)}</h3>
            <p className="mt-2 flex-1 text-sm font-light leading-snug text-fog">
              {tw(descKey)}
            </p>
            {noteKey ? (
              <p className="mt-3 text-xs font-medium text-fog">{th(noteKey)}</p>
            ) : null}
            <p className="mt-4 font-display text-2xl font-extrabold tabular-nums tracking-tight text-ink">
              {formatWizardPriceEuro(TIER_BASE_CENTS[tier])}
            </p>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm font-light leading-relaxed text-fog">
          {th("pricingFootnote")}
        </p>
        <ServicePricingOrderCta label={t("pricingOrderCta")} />
      </div>

      <p className="text-sm text-fog">
        <Link
          href="/for-good"
          className="font-medium text-g underline-offset-2 hover:underline"
        >
          {th("pricingForGoodLink")}
        </Link>
      </p>
    </section>
  );
}
