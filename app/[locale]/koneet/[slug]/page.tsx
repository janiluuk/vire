import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { KoneetDetailBreadcrumbs } from "@/components/layout/HubBreadcrumbs";
import { KoneetModelDetail } from "@/components/koneet/KoneetModelDetail";
import { findComputerModelBySlug } from "@/lib/koneet/computer-model-db";
import {
  buildKoneetDetailDescription,
  findRelatedComputerModels,
  incrementComputerModelView,
} from "@/lib/koneet/koneet-detail";
import { localePathAlternates } from "@/lib/site/seo";

type Props = { params: { locale: string; slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await findComputerModelBySlug(params.slug);
  const t = await getTranslations({ locale: params.locale, namespace: "koneet" });
  const loc = params.locale === "en" ? "en" : "fi";
  if (!m) {
    return { title: t("title") };
  }
  const name = `${m.make} ${m.model}`;
  const title =
    loc === "en"
      ? `${name} — SSD upgrade & compatibility | Sparkki`
      : `${name} — SSD-päivitys, yhteensopivuus | Sparkki`;
  return {
    title,
    description: buildKoneetDetailDescription(m, loc),
    ...localePathAlternates(params.locale, `/koneet/${params.slug}`),
  };
}

export default async function KoneetDetailPage({ params }: Props) {
  const t = await getTranslations("koneet");
  const m = await findComputerModelBySlug(params.slug);
  if (!m) notFound();

  void incrementComputerModelView(m.id);
  const related = await findRelatedComputerModels(m);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-12">
      <KoneetDetailBreadcrumbs make={m.make} model={m.model} />
      <p>
        <Link href="/koneet" className="text-g hover:underline">
          {t("backToList")}
        </Link>
      </p>
      <KoneetModelDetail model={m} related={related} locale={params.locale} />
    </div>
  );
}
