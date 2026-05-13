import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localePathAlternates } from "@/lib/site/seo";
import { prisma } from "@/lib/db/prisma";
import { UsbOrderForm } from "@/components/usb/UsbOrderForm";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "itse" });
  return {
    title: t("title"),
    description: t("intro"),
    ...localePathAlternates(locale, "/itse"),
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

export default async function ItsePage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("itse");
  const { locale } = params;
  let guides: Awaited<ReturnType<typeof prisma.guide.findMany>> = [];
  try {
    guides = await prisma.guide.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { titleFi: "asc" }],
    });
  } catch {
    /* no DB at build time (e.g. Docker image build) */
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12">
      <header>
        <h1 className="text-4xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-4 text-xl text-ink">{t("intro")}</p>
      </header>
      <section aria-labelledby="guides-title">
        <h2 id="guides-title" className="text-2xl font-bold text-ink">
          {t("guidesTitle")}
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {guides.map((g) => {
            const title =
              locale === "en" && g.titleEn?.trim() ? g.titleEn : g.titleFi;
            const desc =
              locale === "en" && g.descEn?.trim() ? g.descEn : g.descFi;
            return (
              <li key={g.id}>
                <Link
                  href={`/itse/${g.slug}`}
                  className="guide-card block min-h-tap no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sparkki-green"
                >
                  <p className="guide-num">
                    {t("guideMeta", {
                      minutes: g.minutesFi,
                      category: g.category,
                      difficulty: g.difficulty,
                    })}
                  </p>
                  <h3 className="guide-title mt-2">{title}</h3>
                  <p className="mt-2 text-lg text-fog">{desc}</p>
                  <span className="mt-4 inline-block text-base font-semibold text-sparkki-green">
                    {t("readGuide")} →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <section
        className="rounded-2xl border border-edge bg-card p-8"
        aria-labelledby="usb-title"
      >
        <h2 id="usb-title" className="text-2xl font-bold text-ink">
          {t("usbTitle")}
        </h2>
        <p className="mt-2 text-lg text-ink">{t("usbBlurb")}</p>
        <UsbOrderForm locale={locale} />
      </section>
    </div>
  );
}
