import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { tryLinuxNovncUrls } from "@/lib/site/try-linux-novnc";
import { localePathAlternates } from "@/lib/site/seo";

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
        <h1 className="text-4xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-4 text-xl leading-relaxed text-ink">{t("intro")}</p>
      </header>

      <section aria-labelledby="try-linux-title" className="vire-card space-y-6 p-6 sm:p-8">
        <h2 id="try-linux-title" className="text-2xl font-bold text-ink">
          {t("tryLinuxTitle")}
        </h2>
        <p className="text-lg leading-relaxed text-ink">{t("tryLinuxIntro")}</p>
        {urls ? (
          <p className="rounded-xl border border-edge bg-card/80 px-4 py-3 text-base leading-relaxed text-ink">
            {t("tryLinuxSecurityHint")}
          </p>
        ) : null}

        {urls ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            <li>
              <a
                href={urls.mint}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-tap flex-col justify-between rounded-2xl border border-edge bg-card p-6 transition-colors duration-150 hover:border-g focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
              >
                <div>
                  <h3 className="text-xl font-bold text-ink">{t("mintTitle")}</h3>
                  <p className="mt-2 text-lg text-ink">{t("mintBody")}</p>
                </div>
                <span className="mt-6 font-semibold text-vire-green">{t("openMint")} →</span>
              </a>
            </li>
            <li>
              <a
                href={urls.fedora}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-tap flex-col justify-between rounded-2xl border border-edge bg-card p-6 transition-colors duration-150 hover:border-g focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
              >
                <div>
                  <h3 className="text-xl font-bold text-ink">{t("fedoraTitle")}</h3>
                  <p className="mt-2 text-lg text-ink">{t("fedoraBody")}</p>
                </div>
                <span className="mt-6 font-semibold text-vire-green">{t("openFedora")} →</span>
              </a>
            </li>
          </ul>
        ) : (
          <p className="rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-lg text-ink">
            {t("notConfigured")}
          </p>
        )}
      </section>
    </div>
  );
}
