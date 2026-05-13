import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localePathAlternates } from "@/lib/site/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    ...localePathAlternates(locale, "/tietosuoja"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      type: "website",
      locale: locale === "fi" ? "fi_FI" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("metaDescription"),
    },
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
      <header>
        <h1 className="text-4xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-4 text-xl leading-relaxed text-ink">{t("intro")}</p>
      </header>

      <section className="sparkki-card space-y-3 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-ink">{t("section1Title")}</h2>
        <p className="text-lg leading-relaxed text-ink">{t("section1Body")}</p>
      </section>

      <section className="sparkki-card space-y-3 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-ink">{t("section2Title")}</h2>
        <p className="text-lg leading-relaxed text-ink">{t("section2Body")}</p>
      </section>

      <section className="sparkki-card space-y-3 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-ink">{t("section3Title")}</h2>
        <p className="text-lg leading-relaxed text-ink">{t("section3Body")}</p>
      </section>

      <section className="sparkki-card space-y-3 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-ink">{t("section4Title")}</h2>
        <p className="text-lg leading-relaxed text-ink">{t("section4Body")}</p>
      </section>

      <section className="sparkki-card space-y-3 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-ink">{t("section5Title")}</h2>
        <p className="text-lg leading-relaxed text-ink">{t("section5Body")}</p>
      </section>
    </div>
  );
}
