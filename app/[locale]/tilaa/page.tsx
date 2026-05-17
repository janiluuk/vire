import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrderWizardLazy } from "@/components/wizard/OrderWizardLazy";
import { localePathAlternates } from "@/lib/site/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "palvelu.wizard" });
  return {
    title: t("title"),
    description: t("stepHint0"),
    ...localePathAlternates(locale, "/tilaa"),
  };
}

export default async function TilaaPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <div className="mx-auto max-w-content px-6 py-8 sm:px-12 sm:py-10">
      <OrderWizardLazy locale={locale} />
    </div>
  );
}
