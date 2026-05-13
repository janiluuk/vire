import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localePathAlternates } from "@/lib/site/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "care" });
  return {
    title: t("thankYouTitle"),
    description: t("thankYouBody"),
    robots: { index: false, follow: true },
    ...localePathAlternates(locale, "/care/kiitos"),
  };
}

export default async function CareThankYouPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "care" });

  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 py-16 text-center">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
        {t("thankYouTitle")}
      </h1>
      <p className="text-lg font-light leading-relaxed text-fog">{t("thankYouBody")}</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/care"
          className="inline-flex min-h-tap items-center justify-center rounded-xl border border-em bg-card px-6 py-3 font-semibold text-ink hover:border-g"
        >
          {t("thankYouBack")}
        </Link>
        <Link
          href="/tuki"
          className="inline-flex min-h-tap items-center justify-center rounded-xl bg-g px-6 py-3 font-semibold text-canvas hover:opacity-[0.9]"
        >
          {t("thankYouSupport")}
        </Link>
      </div>
    </div>
  );
}
