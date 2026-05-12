import { getTranslations } from "next-intl/server";

export default async function TukiPage() {
  const t = await getTranslations("tuki");
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
      <p className="text-xl text-gray-900">{t("intro")}</p>
      <section aria-labelledby="contact-title">
        <h2 id="contact-title" className="text-2xl font-bold text-gray-900">
          {t("contactTitle")}
        </h2>
        <p className="mt-2 text-lg font-medium text-gray-900">{t("phone")}</p>
        <p className="mt-1 text-2xl font-semibold text-verso-green">
          {t("phoneValue")}
        </p>
        <p className="mt-4 text-lg font-medium text-gray-900">{t("email")}</p>
        <p className="mt-1 text-lg text-gray-900">{t("emailValue")}</p>
        <p className="mt-2 text-lg text-gray-900">{t("hours")}</p>
      </section>
    </div>
  );
}
