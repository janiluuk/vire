import Link from "next/link";
import { GuidePublishToggle } from "@/components/admin/GuidePublishToggle";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import fiMessages from "@/messages/fi.json";

const a = fiMessages.admin;

export default async function AdminGuidesPage() {
  await requireAdmin();
  const guides = await prisma.guide.findMany({
    orderBy: [{ order: "asc" }, { slug: "asc" }],
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/admin" className="text-verso-green underline">
        ← {a.dashboard}
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{a.guides}</h1>
          <p className="mt-2 text-lg text-gray-700">{a.guidesIntro}</p>
        </div>
        <Link
          href="/admin/guides/new"
          className="min-h-tap rounded-xl bg-verso-green px-5 py-3 font-semibold text-white hover:bg-[#178f68]"
        >
          {a.guidesNew}
        </Link>
      </div>

      <div className="verso-card mt-8 overflow-x-auto">
        <table className="min-w-full text-left text-lg">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold">{a.guidesColTitle}</th>
              <th className="px-4 py-3 font-semibold">{a.guidesColSlug}</th>
              <th className="px-4 py-3 font-semibold">{a.guidesColPublished}</th>
              <th className="px-4 py-3 font-semibold">{a.guidesColOrder}</th>
            </tr>
          </thead>
          <tbody>
            {guides.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-600">
                  {a.guidesEmpty}
                </td>
              </tr>
            ) : (
              guides.map((g) => (
                <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <Link href={`/admin/guides/${g.slug}`} className="font-medium text-verso-green underline">
                      {g.titleFi}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-base text-gray-800">{g.slug}</td>
                  <td className="px-4 py-3">
                    <GuidePublishToggle slug={g.slug} published={g.published} />
                  </td>
                  <td className="px-4 py-3 text-gray-800">{g.order}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
