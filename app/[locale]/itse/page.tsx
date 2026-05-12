import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";

export default async function ItsePage() {
  const t = await getTranslations("itse");
  const guides = await prisma.guide.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { titleFi: "asc" }],
  });

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12">
      <header>
        <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-4 text-xl text-gray-900">{t("intro")}</p>
      </header>
      <section aria-labelledby="guides-title">
        <h2 id="guides-title" className="text-2xl font-bold text-gray-900">
          {t("guidesTitle")}
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {guides.map((g) => (
            <li key={g.id}>
              <Link
                href={`/itse/${g.slug}`}
                className="block min-h-tap rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-verso-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-verso-green"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-verso-green">
                  {g.category} · {g.difficulty}
                </span>
                <h3 className="mt-2 text-xl font-bold text-gray-900">
                  {g.titleFi}
                </h3>
                <p className="mt-2 text-lg text-gray-900">{g.descFi}</p>
                <span className="mt-4 inline-block font-semibold text-verso-green">
                  {t("readGuide")} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section
        className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        aria-labelledby="usb-title"
      >
        <h2 id="usb-title" className="text-2xl font-bold text-gray-900">
          {t("usbTitle")}
        </h2>
        <p className="mt-2 text-lg text-gray-900">{t("usbBlurb")}</p>
        <button
          type="button"
          disabled
          className="mt-6 min-h-tap rounded-xl bg-verso-amber px-6 py-3 text-lg font-semibold text-gray-900 opacity-60"
        >
          {t("usbCta")}
        </button>
      </section>
    </div>
  );
}
