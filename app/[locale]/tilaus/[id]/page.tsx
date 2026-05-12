import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localePathAlternates } from "@/lib/site/seo";
import { OrderTrackingForm } from "@/components/tilaus/OrderTrackingForm";

export async function generateMetadata({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "tilaus" });
  return {
    title: t("title"),
    description: t("introPrefill"),
    robots: { index: false, follow: false },
    ...localePathAlternates(locale, `/tilaus/${id}`),
  };
}

type Props = { params: { locale: string; id: string } };

export default async function TilausOrderPage({ params }: Props) {
  const id = params.id?.trim();
  if (!id || id.length < 8 || id.length > 40) notFound();

  const t = await getTranslations("tilaus");
  const tuki = await getTranslations("tuki");

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <header>
        <h1 className="text-4xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-4 text-xl leading-relaxed text-ink">{t("introPrefill")}</p>
      </header>
      <OrderTrackingForm variant="prefill" orderId={id} />
      <p className="text-center text-lg text-fog">
        <Link
          href="/tilaus"
          className="font-semibold text-vire-green underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vire-green"
        >
          {t("backToHub")}
        </Link>
        {" · "}
        <Link
          href="/tuki"
          className="font-semibold text-vire-green underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vire-green"
        >
          {tuki("title")}
        </Link>
      </p>
    </div>
  );
}
