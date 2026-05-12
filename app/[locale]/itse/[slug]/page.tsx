import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { readGuideMdxSource } from "@/lib/guide-content";

type Props = { params: { locale: string; slug: string } };

export async function generateMetadata({ params }: Props) {
  const guide = await prisma.guide.findUnique({ where: { slug: params.slug } });
  if (!guide || !guide.published) return { title: "Verso" };
  return { title: `${guide.titleFi} — Verso` };
}

export default async function GuidePage({ params }: Props) {
  const guide = await prisma.guide.findUnique({ where: { slug: params.slug } });
  if (!guide || !guide.published) notFound();

  const source = readGuideMdxSource(params.slug);
  if (!source) notFound();

  const t = await getTranslations("itse");

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <header className="border-b border-gray-200 pb-8">
        <p className="text-sm font-semibold uppercase text-verso-green">
          {guide.category}
        </p>
        <h1 className="mt-2 text-4xl font-bold text-gray-900">{guide.titleFi}</h1>
        <p className="mt-4 text-xl text-gray-900">{guide.descFi}</p>
        {guide.videoUrl ? (
          <div className="mt-8 aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe
              title="Video"
              src={guide.videoUrl.replace("watch?v=", "embed/")}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}
      </header>
      <div className="mt-10 space-y-6 text-lg leading-relaxed text-gray-900 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6">
        <MDXRemote source={source} />
      </div>
      <p className="mt-12">
        <Link
          href="/itse"
          className="font-medium text-verso-green underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-verso-green"
        >
          ← {t("title")}
        </Link>
      </p>
    </article>
  );
}
