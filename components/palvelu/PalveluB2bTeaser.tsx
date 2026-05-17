import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/** Compact B2B prompt — does not compete with the home compatibility checker primary CTA. */
export async function PalveluB2bTeaser() {
  const t = await getTranslations("palvelu");

  return (
    <aside
      aria-labelledby="b2b-teaser-title"
      className="rounded-xl border border-edge/70 bg-sunken/25 px-5 py-4 sm:px-6"
    >
      <p id="b2b-teaser-title" className="text-base leading-relaxed text-fog">
        <span className="font-semibold text-ink">{t("b2bBanner")} </span>
        <Link
          href="/palvelu/b2b"
          className="font-semibold text-g underline-offset-2 hover:underline"
        >
          {t("b2bCta")}
        </Link>
      </p>
    </aside>
  );
}
