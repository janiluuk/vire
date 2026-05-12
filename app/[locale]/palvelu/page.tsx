import { getTranslations } from "next-intl/server";

export default async function PalveluPage() {
  const t = await getTranslations("palvelu");
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
      <p className="text-xl text-gray-900">{t("intro")}</p>
      <h2 className="text-2xl font-semibold text-gray-900">{t("howTitle")}</h2>
      <p className="text-lg text-gray-900">{t("phase2Note")}</p>
      <h2 className="text-2xl font-semibold text-gray-900">{t("pricingTitle")}</h2>
    </div>
  );
}
