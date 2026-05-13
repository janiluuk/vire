import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TryLinuxSection } from "@/components/tietoa/TryLinuxSection";

export async function LearnHubContent() {
  const t = await getTranslations("tietoa.hub");

  const benefitKeys = ["b1", "b2", "b3", "b4"] as const;

  return (
    <div className="mx-auto max-w-4xl space-y-16 md:space-y-20">
      <header className="space-y-5">
        <p className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-dust">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl md:text-[2.75rem] md:leading-tight">
          {t("title")}
        </h1>
        <p className="max-w-3xl text-xl leading-relaxed text-ink">{t("intro")}</p>
        <p className="max-w-3xl text-lg leading-relaxed text-fog">{t("introSub")}</p>
      </header>

      <section aria-labelledby="hub-benefits-title" className="space-y-6">
        <h2 id="hub-benefits-title" className="font-display text-2xl font-bold text-ink md:text-3xl">
          {t("benefitsTitle")}
        </h2>
        <p className="max-w-3xl text-lg text-fog">{t("benefitsLead")}</p>
        <ul className="grid gap-4 sm:grid-cols-2">
          {benefitKeys.map((key) => (
            <li
              key={key}
              className="vire-card-hover relative overflow-hidden border border-edge p-6 sm:p-7"
            >
              <span
                className="mb-4 flex size-11 items-center justify-center rounded-xl bg-g/15 text-xl text-g"
                aria-hidden
              >
                {t(`${key}Icon`)}
              </span>
              <h3 className="text-lg font-bold text-ink">{t(`${key}Title`)}</h3>
              <p className="mt-2 text-base leading-relaxed text-fog">{t(`${key}Body`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="hub-compat-title"
        className="rounded-2xl border border-g/25 bg-g/[0.06] p-6 sm:p-8 md:p-10"
      >
        <h2 id="hub-compat-title" className="font-display text-2xl font-bold text-ink md:text-3xl">
          {t("compatTitle")}
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink">{t("compatBody")}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {(["compatLi1", "compatLi2", "compatLi3", "compatLi4"] as const).map((k) => (
            <li key={k} className="flex gap-3 text-base text-ink">
              <span className="mt-0.5 shrink-0 text-g" aria-hidden>
                ◆
              </span>
              <span className="text-fog">{t(k)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="hub-apps-title" className="space-y-6">
        <h2 id="hub-apps-title" className="font-display text-2xl font-bold text-ink md:text-3xl">
          {t("appsSectionTitle")}
        </h2>
        <p className="max-w-3xl text-lg leading-relaxed text-fog">{t("appsSectionIntro")}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/tietoa/sovellukset/windows"
            className="vire-card-hover flex min-h-tap flex-col justify-between rounded-2xl border border-edge p-6 transition-colors hover:border-g/40"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-dust">
                {t("appsWinEyebrow")}
              </p>
              <p className="mt-2 text-lg font-bold text-ink">{t("appsWinTitle")}</p>
              <p className="mt-2 text-base text-fog">{t("appsWinBody")}</p>
            </div>
            <span className="mt-4 font-semibold text-g">{t("appsCta")} →</span>
          </Link>
          <Link
            href="/tietoa/sovellukset/mac"
            className="vire-card-hover flex min-h-tap flex-col justify-between rounded-2xl border border-edge p-6 transition-colors hover:border-g/40"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-dust">
                {t("appsMacEyebrow")}
              </p>
              <p className="mt-2 text-lg font-bold text-ink">{t("appsMacTitle")}</p>
              <p className="mt-2 text-base text-fog">{t("appsMacBody")}</p>
            </div>
            <span className="mt-4 font-semibold text-g">{t("appsCta")} →</span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="hub-os-title" className="space-y-6">
        <h2 id="hub-os-title" className="font-display text-2xl font-bold text-ink md:text-3xl">
          {t("osSectionTitle")}
        </h2>
        <p className="max-w-3xl text-lg text-fog">{t("osSectionIntro")}</p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="vire-card border-vire-green/30 bg-vire-green/[0.07] p-6 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-wider text-g">
              {t("osRecommendedBadge")}
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-ink">{t("osMintTitle")}</h3>
            <p className="mt-3 text-base leading-relaxed text-fog">{t("osMintBody")}</p>
            <p className="mt-4">
              <Link
                href="/tietoa/linux"
                className="font-semibold text-g underline-offset-2 hover:underline"
              >
                {t("osMintLink")}
              </Link>
            </p>
          </div>
          <div className="vire-card border-edge p-6 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-wider text-dust">
              {t("osAlsoRecommended")}
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-ink">{t("osFedoraTitle")}</h3>
            <p className="mt-3 text-base leading-relaxed text-fog">{t("osFedoraBody")}</p>
            <p className="mt-4 text-sm leading-relaxed text-fog">{t("osFedoraNote")}</p>
          </div>
        </div>
      </section>

      <TryLinuxSection />

      <section aria-labelledby="hub-more-title" className="border-t border-edge pt-12">
        <h2 id="hub-more-title" className="font-display text-xl font-bold text-ink">
          {t("moreTitle")}
        </h2>
        <ul className="mt-4 flex flex-col gap-2 text-lg">
          <li>
            <Link href="/tietoa/hyodyt" className="text-g underline-offset-2 hover:underline">
              {t("moreBenefits")}
            </Link>
          </li>
          <li>
            <Link
              href="/tietoa/galleria"
              className="text-g underline-offset-2 hover:underline"
            >
              {t("moreGallery")}
            </Link>
          </li>
          <li>
            <Link href="/tietoa/huolia" className="text-g underline-offset-2 hover:underline">
              {t("moreConcerns")}
            </Link>
          </li>
          <li>
            <Link href="/tietoa/vakaus" className="text-g underline-offset-2 hover:underline">
              {t("moreStability")}
            </Link>
          </li>
          <li>
            <Link href="/itse" className="text-g underline-offset-2 hover:underline">
              {t("moreDiy")}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
