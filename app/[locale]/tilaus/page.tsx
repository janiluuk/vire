import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localePathAlternates } from "@/lib/site/seo";
import { OrderTrackingForm } from "@/components/tilaus/OrderTrackingForm";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "tilaus" });
  return {
    title: t("title"),
    description: t("introHub"),
    robots: { index: true, follow: true },
    ...localePathAlternates(locale, "/tilaus"),
  };
}

export default async function TilausHubPage() {
  const t = await getTranslations("tilaus");
  const tuki = await getTranslations("tuki");

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <header>
        <h1 className="text-4xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-4 text-xl leading-relaxed text-ink">{t("introHub")}</p>
      </header>
      <OrderTrackingForm variant="hub" />
      <p className="text-center text-lg text-fog">
        <Link
          href="/tuki"
          className="font-semibold text-sparkki-green underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sparkki-green"
        >
          ← {tuki("title")}
        </Link>
      </p>
    </div>
  );
}
