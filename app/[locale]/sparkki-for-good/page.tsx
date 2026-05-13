import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localePathAlternates } from "@/lib/site/seo";
import { submitVireForGood } from "./actions";

const FOR_GOOD_PATH = "/sparkki-for-good";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "forGood" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...localePathAlternates(locale, FOR_GOOD_PATH),
  };
}

const GROUP_KEYS = [
  "groupPension",
  "groupUnemp",
  "groupStudent",
  "groupRedCross",
  "groupSalvation",
] as const;

export default async function SparkkiForGoodPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { sent?: string; err?: string };
}) {
  const t = await getTranslations("forGood");
  const { locale } = params;
  const sent = searchParams.sent === "1";
  const err = searchParams.err;

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-12">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg font-light leading-relaxed text-fog">{t("intro")}</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,340px)] lg:items-start">
        <div className="good-banner rounded-[14px] border border-em bg-gradient-to-br from-g/[0.08] to-g/[0.03] p-7">
          <p className="text-lg font-medium text-ink">{t("bannerLead")}</p>
          <p className="mt-4 font-mono text-xs uppercase tracking-wide text-dust">
            {t("groupsLabel")}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {GROUP_KEYS.map((k) => (
              <li key={k}>
                <span className="inline-flex rounded-full border border-g/40 bg-g/10 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wide text-g">
                  {t(k)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="rounded-2xl border border-edge bg-card p-6">
          <h2 className="font-display text-lg font-bold text-ink">{t("basicLabel")}</h2>
          <p className="good-price mt-2">
            <span className="was font-mono text-xs text-dust line-through">
              {t("priceWasBasic")}
            </span>
            <span className="now ml-2 font-display text-3xl font-extrabold tracking-tight text-g">
              {t("priceNowBasic")}
            </span>
          </p>
          <h2 className="mt-6 font-display text-lg font-bold text-ink">{t("ramLabel")}</h2>
          <p className="good-price mt-2">
            <span className="was font-mono text-xs text-dust line-through">
              {t("priceWasRam")}
            </span>
            <span className="now ml-2 font-display text-3xl font-extrabold tracking-tight text-g">
              {t("priceNowRam")}
            </span>
          </p>
        </aside>
      </div>

      {sent ? (
        <p
          className="rounded-xl border border-g/40 bg-g/10 px-4 py-3 text-lg text-ink"
          role="status"
        >
          {t("sentOk")}
        </p>
      ) : null}
      {err === "validation" ? (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-lg text-ink">
          {t("errorValidation")}
        </p>
      ) : null}
      {err === "config" ? (
        <p className="rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-lg text-ink">
          {t("errorConfig")}
        </p>
      ) : null}
      {err === "send" ? (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-lg text-ink">
          {t("errorSend")}
        </p>
      ) : null}

      <form action={submitVireForGood} className="mx-auto max-w-xl space-y-6">
        <input type="hidden" name="locale" value={locale} />
        <div>
          <label htmlFor="fg-reason" className="mb-2 block font-semibold text-ink">
            {t("fieldReason")}
          </label>
          <textarea
            id="fg-reason"
            name="reason"
            required
            rows={2}
            maxLength={2000}
            placeholder={t("fieldReasonPlaceholder")}
            className="w-full rounded-lg border border-em bg-sunken px-4 py-3 text-lg text-ink placeholder:text-dust focus:border-g focus:outline-none"
          />
          <p className="mt-2 text-base font-light text-fog">{t("fieldReasonHint")}</p>
        </div>
        <div>
          <label htmlFor="fg-contact" className="mb-2 block font-semibold text-ink">
            {t("fieldContact")}
          </label>
          <input
            id="fg-contact"
            name="contact"
            type="text"
            required
            maxLength={320}
            placeholder={t("fieldContactPlaceholder")}
            className="min-h-tap w-full rounded-lg border border-em bg-sunken px-4 py-3 text-lg text-ink placeholder:text-dust focus:border-g focus:outline-none"
          />
          <p className="mt-2 text-base font-light text-fog">{t("fieldContactHint")}</p>
        </div>
        <p className="rounded-lg border border-g/30 bg-g/[0.06] px-4 py-3 text-base text-ink">
          {t("callout")}
        </p>
        <button type="submit" className="vire-btn-primary w-full sm:w-auto">
          {t("submit")}
        </button>
      </form>

      <p>
        <Link href="/" className="text-g hover:underline">
          {t("backHome")}
        </Link>
      </p>
    </div>
  );
}
