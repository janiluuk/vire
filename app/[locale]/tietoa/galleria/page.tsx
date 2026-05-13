import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildDemoGalleryItems } from "@/components/tietoa/demo-gallery-data";
import { DemoGallerySlideshow } from "@/components/tietoa/DemoGallerySlideshow";
import { localePathAlternates } from "@/lib/site/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "tietoa.galleria" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...localePathAlternates(locale, "/tietoa/galleria"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
      locale: locale === "fi" ? "fi_FI" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

export default async function TietoaGalleriaPage() {
  const t = await getTranslations("tietoa.galleria");
  const tDemo = await getTranslations("tietoa.hub.demo");
  const items = buildDemoGalleryItems((key) => tDemo(key));

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header className="space-y-4">
        <p className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-dust">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl md:text-[2.75rem] md:leading-tight">
          {t("title")}
        </h1>
        <p className="max-w-3xl text-xl leading-relaxed text-fog">{t("intro")}</p>
      </header>

      <DemoGallerySlideshow items={items} />
    </div>
  );
}
