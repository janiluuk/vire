import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { KoneetDetailBreadcrumbs } from "@/components/layout/HubBreadcrumbs";
import { prisma } from "@/lib/db/prisma";
import { computerModelSlug } from "@/lib/site/computer-model-slug";
import { localePathAlternates } from "@/lib/site/seo";

type Props = { params: { locale: string; slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const models = await prisma.computerModel.findMany();
  const m = models.find(
    (row) => computerModelSlug(row.make, row.model) === params.slug,
  );
  const t = await getTranslations({ locale: params.locale, namespace: "koneet" });
  if (!m) {
    return { title: t("title") };
  }
  return {
    title: `${m.make} ${m.model} — ${t("title")}`,
    description: m.verdict ?? t("metaDescription"),
    ...localePathAlternates(params.locale, `/koneet/${params.slug}`),
  };
}

export default async function KoneetDetailPage({ params }: Props) {
  const t = await getTranslations("koneet");
  const models = await prisma.computerModel.findMany();
  const m = models.find(
    (row) => computerModelSlug(row.make, row.model) === params.slug,
  );
  if (!m) notFound();

  const statusKey =
    m.status === "IN_REVIEW"
      ? "statusReview"
      : m.status === "APPROVED"
        ? "statusApproved"
        : m.status === "REJECTED"
          ? "statusRejected"
          : "statusUnchecked";

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <KoneetDetailBreadcrumbs make={m.make} model={m.model} />
      <p>
        <Link href="/#yhteensopivuus" className="text-g hover:underline">
          {t("backToList")}
        </Link>
      </p>
      <header>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
          {m.make} {m.model}
        </h1>
        <p className="mt-2 font-mono text-sm text-dust">{t(statusKey)}</p>
      </header>

      <dl className="space-y-4 text-lg">
        <div>
          <dt className="font-mono text-xs uppercase tracking-wide text-dust">
            {t("years")}
          </dt>
          <dd className="text-ink">
            {m.yearFrom ?? "—"} – {m.yearTo ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wide text-dust">
            {t("compatShort")}
          </dt>
          <dd className="text-ink">
            {m.compatible === true
              ? t("compatYes")
              : m.compatible === false
                ? t("compatNo")
                : t("compatUnknown")}
          </dd>
        </div>
        {m.verdict ? (
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-dust">
              {t("verdict")}
            </dt>
            <dd className="whitespace-pre-wrap text-fog">{m.verdict}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
