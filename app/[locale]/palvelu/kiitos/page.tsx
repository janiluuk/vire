import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { thankYouFromSession } from "@/lib/billing/checkout-thanks";
import { localePathAlternates } from "@/lib/site/seo";

type Props = {
  params: { locale: string };
  searchParams: { session_id?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "palvelu.thanks" });
  return {
    title: t("title"),
    description: t("serviceBody"),
    robots: { index: false, follow: true },
    ...localePathAlternates(params.locale, "/palvelu/kiitos"),
  };
}

export default async function PalveluKiitosPage({ searchParams }: Props) {
  const t = await getTranslations("palvelu.thanks");
  const info = await thankYouFromSession(searchParams.session_id);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-16 text-center">
      {info.ok && info.kind === "service" ? (
        <>
          <h1 className="text-4xl font-bold text-ink">{t("title")}</h1>
          <p className="text-xl text-ink">{t("serviceBody")}</p>
          <p className="rounded-xl border border-em bg-card p-4 text-lg text-ink">
            {t("orderRef")}: <span className="font-mono">{info.orderId}</span>
          </p>
          <p>
            <Link
              href={`/tilaus/${info.orderId}`}
              className="inline-flex min-h-tap items-center justify-center rounded-xl bg-sparkki-green px-6 py-3 text-lg font-semibold text-canvas hover:opacity-[0.85] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sparkki-green"
            >
              {t("trackOrder")}
            </Link>
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-ink">{t("genericTitle")}</h1>
          <p className="text-lg text-ink">{t("genericBody")}</p>
        </>
      )}
    </div>
  );
}
