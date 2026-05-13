import Link from "next/link";
import { SaveGuideForm } from "@/components/admin/SaveGuideForm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";

export default async function AdminGuideNewPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  await requireAdmin();
  const a = getAdminMessages().admin;

  const errCodes: Record<string, string> = {
    slug: a.guideErrSlug,
    difficulty: a.guideErrDifficulty,
    minutes: a.guideErrMinutes,
    order: a.guideErrOrder,
  };
  const errMsg = searchParams?.error ? errCodes[searchParams.error] ?? a.guideErrGeneric : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/admin/guides" className="text-sparkki-green underline">
        ← {a.guides}
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-ink">{a.guidesNewTitle}</h1>
      <p className="mt-2 text-lg text-fog">{a.guidesNewIntro}</p>
      {errMsg ? (
        <p className="mt-4 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-ink">
          {errMsg}
        </p>
      ) : null}
      <div className="mt-8">
        <SaveGuideForm
          defaults={{
            editorSlug: null,
            published: false,
            minutesFi: 5,
            order: 0,
            category: "install",
            difficulty: "easy",
            mdxContent: "",
          }}
        />
      </div>
    </div>
  );
}
