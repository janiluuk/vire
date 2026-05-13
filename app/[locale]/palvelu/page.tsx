import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localePathAlternates } from "@/lib/site/seo";
import { OrderWizard } from "@/components/wizard/OrderWizard";

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

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-12">
      <header>
        <h1 className="text-4xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-4 text-xl text-ink">{t("intro")}</p>
      </header>

      <section aria-labelledby="how-title">
        <h2 id="how-title" className="text-2xl font-bold text-ink">
          {t("howTitle")}
        </h2>
        <ol className="mt-6 space-y-4 text-lg text-ink">
          {(["how1", "how2", "how3", "how4", "how5"] as const).map((key, i) => (
            <li key={key} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-vire-green text-xl font-bold text-canvas">
                {i + 1}
              </span>
              <span className="pt-2">{t(key)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="pricing-title">
        <h2 id="pricing-title" className="text-2xl font-bold text-ink">
          {t("pricingTitle")}
        </h2>
        <p className="mt-4 text-lg text-ink">{t("pricingNote")}</p>
      </section>

      <section aria-labelledby="migration-faq-title" className="space-y-6">
        <h2 id="migration-faq-title" className="text-2xl font-bold text-ink">
          {t("migrationFaqTitle")}
        </h2>
        <p className="text-lg text-ink">{t("migrationFaqIntro")}</p>
        <dl className="space-y-6 text-lg text-ink">
          <div>
            <dt className="font-semibold text-vire-green">
              {t("migrationFaqQ1")}
            </dt>
            <dd className="mt-2 text-fog">{t("migrationFaqA1")}</dd>
          </div>
          <div>
            <dt className="font-semibold text-vire-green">
              {t("migrationFaqQ2")}
            </dt>
            <dd className="mt-2 text-fog">{t("migrationFaqA2")}</dd>
          </div>
          <div>
            <dt className="font-semibold text-vire-green">
              {t("migrationFaqQ3")}
            </dt>
            <dd className="mt-2 text-fog">{t("migrationFaqA3")}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="backups-title" className="space-y-4">
        <h2 id="backups-title" className="text-2xl font-bold text-ink">
          {t("backupsTitle")}
        </h2>
        <p className="text-lg leading-relaxed text-fog">{t("backupsP1")}</p>
        <p className="text-lg leading-relaxed text-fog">{t("backupsP2")}</p>
      </section>

      <section
        aria-labelledby="b2b-title"
        className="vire-card border-vire-green/25 bg-vire-green/5 p-6 sm:p-8"
      >
        <h2 id="b2b-title" className="text-2xl font-bold text-ink">
          {t("b2bBanner")}
        </h2>
        <p className="mt-4 text-lg text-ink">{t("b2b.intro")}</p>
        <Link
          href="/palvelu/b2b"
          className="vire-btn-secondary mt-6 inline-flex min-h-tap items-center justify-center"
        >
          {t("b2bCta")}
        </Link>
      </section>

      <OrderWizard locale={locale} />
    </div>
  );
}
