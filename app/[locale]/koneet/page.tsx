import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { KoneetCompatibilitySection } from "@/components/koneet/KoneetCompatibilitySection";
import { localePathAlternates } from "@/lib/site/seo";

type Props = {
  params: { locale: string };
  searchParams: { q?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "koneet" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    ...localePathAlternates(params.locale, "/koneet"),
  };
}

export default async function KoneetPage({ params, searchParams }: Props) {
  const query = searchParams.q?.trim() ?? "";

  return (
    <div className="mx-auto max-w-content px-6 py-12 sm:px-12 sm:py-16">
      <KoneetCompatibilitySection
        query={query}
        locale={params.locale}
        searchPath="/koneet"
        showRequestForm
      />
    </div>
  );
}
