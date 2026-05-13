import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { readGuideMdxSource } from "@/lib/content/guide-content";
import { parseGuideMdx } from "@/lib/content/guide-mdx";
import { localePathAlternates } from "@/lib/site/seo";

type Props = { params: { locale: string; slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = params;
  const guide = await prisma.guide.findUnique({ where: { slug } });
  if (!guide || !guide.published) {
    return { title: "Sparkki" };
  }
  const title =
    locale === "en" && guide.titleEn?.trim() ? guide.titleEn : guide.titleFi;
  const description =
    locale === "en" && guide.descEn?.trim() ? guide.descEn : guide.descFi;
  return {
    title,
    description,
    ...localePathAlternates(locale, `/itse/${slug}`),
    openGraph: {
      title,
      description,
      type: "article",
      locale: locale === "fi" ? "fi_FI" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug, locale } = params;
  const guide = await prisma.guide.findUnique({ where: { slug } });
  if (!guide || !guide.published) notFound();

  const source = readGuideMdxSource(slug);
  if (!source) notFound();
  const { content: mdxBody } = parseGuideMdx(source);

  const t = await getTranslations("itse");
  const title =
    locale === "en" && guide.titleEn?.trim() ? guide.titleEn : guide.titleFi;
  const description =
    locale === "en" && guide.descEn?.trim() ? guide.descEn : guide.descFi;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <header className="border-b border-edge pb-8">
        <p className="text-sm font-semibold uppercase text-sparkki-green">
          {guide.category}
        </p>
        <h1 className="mt-2 text-4xl font-bold text-ink">{title}</h1>
        <p className="mt-4 text-xl text-ink">{description}</p>
        {guide.videoUrl ? (
          <div className="mt-8 aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe
              title="Video"
              loading="lazy"
              src={guide.videoUrl.replace("watch?v=", "embed/")}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}
      </header>
      <div className="mt-10 space-y-6 text-lg leading-relaxed text-ink [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-edge [&_pre]:bg-sunken [&_pre]:p-4 [&_code]:font-mono [&_code]:text-[0.95em]">
        <MDXRemote source={mdxBody} />
      </div>
      <p className="mt-12">
        <Link
          href="/itse"
          className="font-medium text-sparkki-green underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sparkki-green"
        >
          ← {t("title")}
        </Link>
      </p>
    </article>
  );
}
