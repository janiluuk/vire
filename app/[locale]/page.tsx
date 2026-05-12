import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SpeedBar } from "@/components/home/SpeedBar";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="mx-auto max-w-6xl space-y-20 px-4 py-12 sm:py-16">
      <section className="verso-hero">
        <div className="verso-hero-inner">
          <p className="verso-eyebrow">{t("eyebrow")}</p>
          <h1 className="text-balance text-4xl font-extrabold tracking-hero text-gray-900 sm:text-5xl md:text-[3.25rem]">
            {t("title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-gray-800">
            {t("subtitle")}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/palvelu" className="verso-btn-primary">
              {t("ctaService")}
            </Link>
            <Link href="/itse" className="verso-btn-secondary">
              {t("ctaDiy")}
            </Link>
          </div>
        </div>
      </section>

      <SpeedBar />

      <section aria-labelledby="steps-title">
        <h2
          id="steps-title"
          className="text-3xl font-bold tracking-tight text-gray-900"
        >
          {t("stepsTitle")}
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {(["step1", "step2", "step3"] as const).map((key, i) => (
            <li key={key} className="verso-card-hover p-6 sm:p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-verso-green/12 text-xl font-bold text-verso-green ring-1 ring-verso-green/20">
                {i + 1}
              </span>
              <p className="mt-5 text-lg font-medium leading-snug text-gray-900">
                {t(key)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="pricing-title">
        <h2
          id="pricing-title"
          className="text-3xl font-bold tracking-tight text-gray-900"
        >
          {t("pricingTitle")}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {(["tierBasic", "tierRam", "tierFull"] as const).map((key) => (
            <div
              key={key}
              className="verso-card-hover flex flex-col p-7 text-center"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-verso-green/40" />
              <h3 className="text-xl font-bold tracking-tight text-gray-900">
                {t(key)}
              </h3>
              <p className="mt-4 text-lg text-gray-700">—</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="benefits-title">
        <h2 id="benefits-title" className="sr-only">
          Benefits
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              "benefitCo2",
              "benefitCost",
              "benefitApps",
              "benefitSupport",
            ] as const
          ).map((key) => (
            <div key={key} className="verso-card p-6 sm:p-7">
              <span className="text-lg text-verso-green/90" aria-hidden>
                ◆
              </span>
              <p className="mt-3 text-lg font-semibold leading-snug text-gray-900">
                {t(key)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="verso-card border-verso-amber/30 bg-gradient-to-br from-amber-50/95 to-white p-8 sm:p-10"
        aria-labelledby="trust-title"
      >
        <h2
          id="trust-title"
          className="text-2xl font-bold tracking-tight text-gray-900"
        >
          {t("trustTitle")}
        </h2>
        <ul className="mt-5 space-y-3 text-lg leading-relaxed text-gray-900">
          <li className="flex gap-3">
            <span className="text-verso-green" aria-hidden>
              ✓
            </span>
            <span>{t("trustSupport")}</span>
          </li>
          <li className="flex gap-3">
            <span className="text-verso-green" aria-hidden>
              ✓
            </span>
            <span>{t("trustParts")}</span>
          </li>
          <li className="flex gap-3">
            <span className="text-verso-green" aria-hidden>
              ✓
            </span>
            <span>{t("trustDelivery")}</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
