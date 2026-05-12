import Link from "next/link";
import { notFound } from "next/navigation";
import { SaveGuideForm } from "@/components/admin/SaveGuideForm";
import { readGuideMdxSource } from "@/lib/guide-content";
import { parseGuideMdx } from "@/lib/guide-mdx";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import fiMessages from "@/messages/fi.json";

const a = fiMessages.admin;

function guideErrorMessage(code: string | undefined) {
  if (!code) return null;
  switch (code) {
    case "slug":
      return a.guideErrSlug;
    case "difficulty":
      return a.guideErrDifficulty;
    case "minutes":
      return a.guideErrMinutes;
    case "order":
      return a.guideErrOrder;
    default:
      return a.guideErrGeneric;
  }
}

export default async function AdminGuideEditPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { error?: string; saved?: string };
}) {
  await requireAdmin();
  const guide = await prisma.guide.findUnique({ where: { slug: params.slug } });
  if (!guide) notFound();

  const raw = readGuideMdxSource(guide.slug);
  const parsed = raw ? parseGuideMdx(raw) : { data: {}, content: "" };
  const mdxContent = parsed.content ?? "";

  const errMsg = guideErrorMessage(searchParams?.error);
  const saved = searchParams?.saved === "1";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/admin/guides" className="text-verso-green underline">
        ← {a.guides}
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">{a.guidesEditTitle}</h1>
      <p className="mt-2 font-mono text-lg text-gray-700">{guide.slug}</p>

      {saved ? (
        <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-gray-900">
          {a.guideSaved}
        </p>
      ) : null}
      {errMsg ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-gray-900">
          {errMsg}
        </p>
      ) : null}

      <div className="mt-8">
        <SaveGuideForm
          defaults={{
            editorSlug: guide.slug,
            slug: guide.slug,
            titleFi: guide.titleFi,
            titleEn: guide.titleEn ?? undefined,
            descFi: guide.descFi,
            descEn: guide.descEn ?? undefined,
            category: guide.category,
            difficulty: guide.difficulty,
            minutesFi: guide.minutesFi,
            videoUrl: guide.videoUrl ?? undefined,
            order: guide.order,
            published: guide.published,
            mdxContent,
          }}
        />
      </div>
    </div>
  );
}
