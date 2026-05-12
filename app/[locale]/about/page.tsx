import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localePathAlternates } from "@/lib/seo";

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
        <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-4 text-xl leading-relaxed text-gray-900">{t("intro")}</p>
      </header>

      <section aria-labelledby="company-heading" className="verso-card space-y-4 p-6 sm:p-8">
        <h2 id="company-heading" className="text-2xl font-bold text-gray-900">
          {t("companyTitle")}
        </h2>
        <p className="text-lg font-semibold text-gray-900">{t("companyName")}</p>
        <dl className="grid gap-3 text-lg text-gray-900 sm:grid-cols-[minmax(10rem,auto)_1fr] sm:gap-x-6">
          <dt className="font-semibold text-gray-800">{t("businessIdLabel")}</dt>
          <dd>{t("businessIdValue")}</dd>
        </dl>
        <p className="text-lg text-gray-800">{t("companyNote")}</p>
      </section>

      <section aria-labelledby="address-heading" className="verso-card space-y-4 p-6 sm:p-8">
        <h2 id="address-heading" className="text-2xl font-bold text-gray-900">
          {t("addressTitle")}
        </h2>
        <address className="whitespace-pre-line not-italic text-lg leading-relaxed text-gray-900">
          {t("addressLines")}
        </address>
      </section>

      <section aria-labelledby="team-heading" className="space-y-6">
        <h2 id="team-heading" className="text-2xl font-bold text-gray-900">
          {t("teamTitle")}
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          <li className="verso-card flex flex-col p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900">{t("person1Name")}</h3>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-verso-green">
              {t("person1Role")}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-900">{t("person1Bio")}</p>
          </li>
          <li className="verso-card flex flex-col p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900">{t("person2Name")}</h3>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-verso-green">
              {t("person2Role")}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-900">{t("person2Bio")}</p>
          </li>
        </ul>
      </section>

      <section aria-labelledby="contact-heading" className="verso-card space-y-4 p-6 sm:p-8">
        <h2 id="contact-heading" className="text-2xl font-bold text-gray-900">
          {t("contactTitle")}
        </h2>
        <ul className="space-y-4 text-lg text-gray-900">
          <li>
            <span className="font-semibold text-gray-800">{t("phoneLabel")}: </span>
            <a
              href={`tel:${t("phoneValue").replace(/\s/g, "")}`}
              className="text-verso-green underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-verso-green"
            >
              {t("phoneValue")}
            </a>
          </li>
          <li>
            <span className="font-semibold text-gray-800">{t("emailLabel")}: </span>
            <a
              href={`mailto:${t("emailValue")}`}
              className="text-verso-green underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-verso-green"
            >
              {t("emailValue")}
            </a>
          </li>
          <li>
            <span className="font-semibold text-gray-800">{t("hoursLabel")}: </span>
            {t("hoursValue")}
          </li>
        </ul>
        <p className="pt-2 text-lg text-gray-800">
          <Link
            href="/tuki"
            className="font-semibold text-verso-green underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-verso-green"
          >
            {t("supportPageLink")} →
          </Link>
        </p>
      </section>
    </div>
  );
}
