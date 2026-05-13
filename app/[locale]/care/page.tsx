import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CareSubscribeForm } from "@/components/care/CareSubscribeForm";
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
    { key: "tierBasic" as const, desc: "tierBasicDesc" as const, price: "priceBasic" as const, featured: false },
    { key: "tierPlus" as const, desc: "tierPlusDesc" as const, price: "pricePlus" as const, featured: true },
    { key: "tierPro" as const, desc: "tierProDesc" as const, price: "pricePro" as const, featured: false },
  ];

  const timeline = [
    { key: "timelineD75" as const, accent: "amber" as const },
    { key: "timelineD88" as const, accent: "amber" as const },
    { key: "timelineD90" as const, accent: "neutral" as const },
    { key: "timelineD91" as const, accent: "green" as const },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-12">
      <header className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-g">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-ink md:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-fog">
          {t("intro")}
        </p>
      </header>

      <section aria-labelledby="care-tiers-heading" className="grid gap-4 md:grid-cols-3">
        <h2 id="care-tiers-heading" className="col-span-full text-2xl font-bold text-ink">
          {t("tiersHeading")}
        </h2>
        {tiers.map(({ key, desc, price, featured }) => (
          <article
            key={key}
            className={`relative rounded-2xl border p-7 transition-colors duration-200 ${
              featured
                ? "border-g bg-g/[0.04]"
                : "border-edge bg-card hover:border-em"
            }`}
          >
            {featured ? (
              <span className="absolute -top-3 left-6 rounded-full bg-g px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-canvas">
                {t("featuredBadge")}
              </span>
            ) : null}
            <h3 className="font-display text-xl font-bold text-ink">{t(key)}</h3>
            <p className="mt-3 text-base font-light leading-relaxed text-fog">{t(desc)}</p>
            <p className="care-price mt-6 font-display text-[38px] font-extrabold leading-none tracking-tight text-g">
              {t(price)}
              <span className="text-lg font-normal text-fog"> {t("perMonth")}</span>
            </p>
            {key === "tierBasic" ? (
              <CareSubscribeForm locale={careLocale} />
            ) : (
              <p className="mt-6 text-base font-light leading-relaxed text-fog">
                {t("tierHigherContact")}
              </p>
            )}
          </article>
        ))}
      </section>

      <section aria-labelledby="care-timeline">
        <h2 id="care-timeline" className="text-2xl font-bold text-ink">
          {t("timelineTitle")}
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {timeline.map(({ key, accent }) => (
            <div
              key={key}
              className={`rounded-xl border px-4 py-4 text-sm ${
                accent === "green"
                  ? "border-g bg-g/[0.06]"
                  : accent === "amber"
                    ? "border-amber/30 bg-card"
                    : "border-edge bg-card"
              }`}
            >
              {t(key)}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-edge bg-raised p-8 text-center">
        <p className="text-lg text-fog">{t("ctaNote")}</p>
        <Link
          href="/tuki"
          className="mt-6 inline-flex min-h-tap items-center justify-center rounded-xl bg-g px-8 py-3 font-semibold text-canvas hover:opacity-[0.9]"
        >
          {t("ctaTuki")}
        </Link>
      </section>
    </div>
  );
}
