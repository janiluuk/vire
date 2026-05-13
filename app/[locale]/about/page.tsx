import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localePathAlternates } from "@/lib/site/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("intro"),
    ...localePathAlternates(locale, "/about"),
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

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-12">
      <header>
        <h1 className="text-4xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-4 text-xl leading-relaxed text-ink">{t("intro")}</p>
      </header>

      <section aria-labelledby="company-heading" className="vire-card space-y-4 p-6 sm:p-8">
        <h2 id="company-heading" className="text-2xl font-bold text-ink">
          {t("companyTitle")}
        </h2>
        <p className="text-lg font-semibold text-ink">{t("companyName")}</p>
        <dl className="grid gap-3 text-lg text-ink sm:grid-cols-[minmax(10rem,auto)_1fr] sm:gap-x-6">
          <dt className="font-semibold text-ink">{t("businessIdLabel")}</dt>
          <dd>{t("businessIdValue")}</dd>
        </dl>
        <p className="text-lg text-ink">{t("companyNote")}</p>
      </section>

      <section aria-labelledby="address-heading" className="vire-card space-y-4 p-6 sm:p-8">
        <h2 id="address-heading" className="text-2xl font-bold text-ink">
          {t("addressTitle")}
        </h2>
        <address className="whitespace-pre-line not-italic text-lg leading-relaxed text-ink">
          {t("addressLines")}
        </address>
      </section>

      <section aria-labelledby="team-heading" className="space-y-6">
        <h2 id="team-heading" className="text-2xl font-bold text-ink">
          {t("teamTitle")}
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          <li className="vire-card flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6 sm:p-8">
            <figure className="mx-auto w-full max-w-[220px] shrink-0 sm:mx-0">
              <div
                role="img"
                aria-label={t("personPhotoPlaceholder")}
                className="flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-em bg-sunken px-4 text-center text-sm leading-snug text-fog"
              >
                {t("personPhotoPlaceholder")}
              </div>
            </figure>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-ink">{t("person1Name")}</h3>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-vire-green">
                {t("person1Role")}
              </p>
              <p className="mt-4 text-lg leading-relaxed text-ink">{t("person1Bio")}</p>
            </div>
          </li>
          <li className="vire-card flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6 sm:p-8">
            <figure className="mx-auto w-full max-w-[220px] shrink-0 sm:mx-0">
              <div
                role="img"
                aria-label={t("personPhotoPlaceholder")}
                className="flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-em bg-sunken px-4 text-center text-sm leading-snug text-fog"
              >
                {t("personPhotoPlaceholder")}
              </div>
            </figure>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-ink">{t("person2Name")}</h3>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-vire-green">
                {t("person2Role")}
              </p>
              <p className="mt-4 text-lg leading-relaxed text-ink">{t("person2Bio")}</p>
            </div>
          </li>
        </ul>
      </section>

      <section aria-labelledby="contact-heading" className="vire-card space-y-4 p-6 sm:p-8">
        <h2 id="contact-heading" className="text-2xl font-bold text-ink">
          {t("contactTitle")}
        </h2>
        <ul className="space-y-4 text-lg text-ink">
          <li>
            <span className="font-semibold text-ink">{t("phoneLabel")}: </span>
            <a
              href={`tel:${t("phoneTelHref")}`}
              className="text-vire-green underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vire-green"
            >
              {t("phoneValue")}
            </a>
          </li>
          <li>
            <span className="font-semibold text-ink">{t("emailLabel")}: </span>
            <a
              href={`mailto:${t("emailValue")}`}
              className="text-vire-green underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vire-green"
            >
              {t("emailValue")}
            </a>
          </li>
          <li>
            <span className="font-semibold text-ink">{t("hoursLabel")}: </span>
            {t("hoursValue")}
          </li>
        </ul>
        <p className="pt-2 text-lg text-ink">
          <Link
            href="/tuki"
            className="font-semibold text-vire-green underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vire-green"
          >
            {t("supportPageLink")} →
          </Link>
        </p>
      </section>
    </div>
  );
}
