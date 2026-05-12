import { getTranslations } from "next-intl/server";

export default async function YhteisoPage() {
  const t = await getTranslations("yhteiso");
  const invite = process.env.NEXT_PUBLIC_DISCORD_INVITE;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
      <p className="text-xl text-gray-900">{t("intro")}</p>
      {invite && invite !== "#" ? (
        <a
          href={invite}
          className="inline-flex min-h-tap items-center justify-center rounded-xl bg-verso-green px-8 py-3 text-lg font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verso-green"
          rel="noopener noreferrer"
          target="_blank"
        >
          {t("discordCta")}
        </a>
      ) : null}
      <section aria-labelledby="g-title">
        <h2 id="g-title" className="text-2xl font-bold text-gray-900">
          {t("guidelinesTitle")}
        </h2>
        <p className="mt-4 text-lg text-gray-900">{t("guidelinesBody")}</p>
      </section>
    </div>
  );
}
