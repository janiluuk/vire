import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SpeedBar } from "@/components/home/SpeedBar";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-12">
      <section className="text-center">
        <h1 className="text-balance text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-900">
          {t("subtitle")}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/palvelu"
            className="inline-flex min-h-tap min-w-[200px] items-center justify-center rounded-xl bg-verso-green px-8 py-3 text-lg font-semibold text-white shadow hover:bg-[#178f68] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verso-green"
          >
            {t("ctaService")}
          </Link>
          <Link
            href="/itse"
            className="inline-flex min-h-tap min-w-[200px] items-center justify-center rounded-xl border-2 border-verso-green bg-white px-8 py-3 text-lg font-semibold text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verso-green"
          >
            {t("ctaDiy")}
          </Link>
        </div>
      </section>

      <SpeedBar />

      <section aria-labelledby="steps-title">
        <h2 id="steps-title" className="text-3xl font-bold text-gray-900">
          {t("stepsTitle")}
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {(["step1", "step2", "step3"] as const).map((key, i) => (
            <li
              key={key}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <span className="text-4xl font-bold text-verso-green">{i + 1}</span>
              <p className="mt-4 text-lg font-medium text-gray-900">{t(key)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="pricing-title">
        <h2 id="pricing-title" className="text-3xl font-bold text-gray-900">
          {t("pricingTitle")}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {(["tierBasic", "tierRam", "tierFull"] as const).map((key) => (
            <div
              key={key}
              className="rounded-2xl border-2 border-gray-200 bg-white p-6 text-center shadow-sm"
            >
              <h3 className="text-xl font-bold text-gray-900">{t(key)}</h3>
              <p className="mt-4 text-lg text-gray-900">—</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="benefits-title">
        <h2 id="benefits-title" className="sr-only">
          Benefits
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              "benefitCo2",
              "benefitCost",
              "benefitApps",
              "benefitSupport",
            ] as const
          ).map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="text-lg font-semibold text-gray-900">{t(key)}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="rounded-2xl border border-verso-amber/40 bg-amber-50 p-8"
        aria-labelledby="trust-title"
      >
        <h2 id="trust-title" className="text-2xl font-bold text-gray-900">
          {t("trustTitle")}
        </h2>
        <ul className="mt-4 list-inside list-disc space-y-2 text-lg text-gray-900">
          <li>{t("trustSupport")}</li>
          <li>{t("trustParts")}</li>
          <li>{t("trustDelivery")}</li>
        </ul>
      </section>
    </div>
  );
}
