import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { tryLinuxNovncUrls } from "@/lib/try-linux-novnc";
import { localePathAlternates } from "@/lib/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "info" });
  return {
    title: t("title"),
    description: t("intro"),
    ...localePathAlternates(locale, "/info"),
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

export default async function InfoPage() {
  const t = await getTranslations("info");
  const urls = tryLinuxNovncUrls();

  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-12">
      <header>
        <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-4 text-xl leading-relaxed text-gray-900">{t("intro")}</p>
      </header>

      <section aria-labelledby="try-linux-title" className="verso-card space-y-6 p-6 sm:p-8">
        <h2 id="try-linux-title" className="text-2xl font-bold text-gray-900">
          {t("tryLinuxTitle")}
        </h2>
        <p className="text-lg leading-relaxed text-gray-900">{t("tryLinuxIntro")}</p>

        {urls ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            <li>
              <a
                href={urls.mint}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-tap flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:border-verso-green hover:ring-verso-green/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verso-green"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t("mintTitle")}</h3>
                  <p className="mt-2 text-lg text-gray-800">{t("mintBody")}</p>
                </div>
                <span className="mt-6 font-semibold text-verso-green">{t("openMint")} →</span>
              </a>
            </li>
            <li>
              <a
                href={urls.fedora}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-tap flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:border-verso-green hover:ring-verso-green/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verso-green"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t("fedoraTitle")}</h3>
                  <p className="mt-2 text-lg text-gray-800">{t("fedoraBody")}</p>
                </div>
                <span className="mt-6 font-semibold text-verso-green">{t("openFedora")} →</span>
              </a>
            </li>
          </ul>
        ) : (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-lg text-gray-900">
            {t("notConfigured")}
          </p>
        )}
      </section>
    </div>
  );
}
