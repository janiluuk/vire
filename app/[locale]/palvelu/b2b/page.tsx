import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localePathAlternates } from "@/lib/site/seo";
import { submitB2bQuote } from "./actions";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "palvelu" });
  return {
    title: t("b2b.title"),
    description: t("b2b.metaDescription"),
    ...localePathAlternates(locale, "/palvelu/b2b"),
    openGraph: {
      title: t("b2b.title"),
      description: t("b2b.metaDescription"),
      type: "website",
      locale: locale === "fi" ? "fi_FI" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("b2b.title"),
      description: t("b2b.metaDescription"),
    },
  };
}

export default async function PalveluB2bPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { sent?: string; err?: string };
}) {
  const t = await getTranslations("palvelu");
  const { locale } = params;
  const sent = searchParams.sent === "1";
  const err = searchParams.err;

  return (
    <div className="mx-auto max-w-2xl space-y-10 px-4 py-12">
      <header>
        <p className="text-sm font-semibold text-g">
          <Link href="/palvelu" className="hover:underline">
            {t("b2b.backToService")}
          </Link>
        </p>
        <h1 className="mt-4 text-4xl font-bold text-ink">{t("b2b.title")}</h1>
        <p className="mt-4 text-xl text-ink">{t("b2b.intro")}</p>
      </header>

      {sent ? (
        <p
          className="rounded-xl border border-g/40 bg-g/10 px-4 py-3 text-lg text-ink"
          role="status"
        >
          {t("b2b.sentOk")}
        </p>
      ) : null}

      {err === "validation" ? (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-lg text-ink">
          {t("b2b.errorValidation")}
        </p>
      ) : null}
      {err === "config" ? (
        <p className="rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-lg text-ink">
          {t("b2b.errorConfig")}
        </p>
      ) : null}
      {err === "send" ? (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-lg text-ink">
          {t("b2b.errorSend")}
        </p>
      ) : null}

      <form action={submitB2bQuote} className="vire-card space-y-6 p-6 sm:p-8">
        <input type="hidden" name="locale" value={locale} />

        <div>
          <label htmlFor="details" className="block text-sm font-semibold text-ink">
            {t("b2b.fieldDetails")}
          </label>
          <textarea
            id="details"
            name="details"
            required
            rows={4}
            maxLength={4000}
            placeholder={t("b2b.fieldDetailsPlaceholder")}
            className="mt-2 w-full resize-y rounded-lg border border-em bg-sunken px-3 py-2 text-lg text-ink placeholder:text-dust focus:border-g focus:outline-none"
          />
          <p className="mt-2 text-base font-light text-fog">{t("b2b.fieldDetailsHint")}</p>
        </div>

        <div>
          <label htmlFor="contact" className="block text-sm font-semibold text-ink">
            {t("b2b.fieldContact")}
          </label>
          <input
            id="contact"
            name="contact"
            type="text"
            required
            maxLength={320}
            autoComplete="email"
            placeholder={t("b2b.fieldContactPlaceholder")}
            className="mt-2 w-full rounded-lg border border-em bg-sunken px-3 py-2 text-lg text-ink placeholder:text-dust focus:border-g focus:outline-none"
          />
          <p className="mt-2 text-base font-light text-fog">{t("b2b.fieldContactHint")}</p>
        </div>

        <button type="submit" className="vire-btn-primary w-full sm:w-auto">
          {t("b2b.submit")}
        </button>
      </form>
    </div>
  );
}
