"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold text-ink">{t("title")}</h1>
      <p className="mt-4 text-lg leading-relaxed text-fog">{t("description")}</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="min-h-tap rounded-lg bg-sparkki-green px-6 py-3 font-semibold text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
        >
          {t("retry")}
        </button>
        <Link
          href="/"
          className="min-h-tap inline-flex items-center justify-center rounded-lg border border-em px-6 py-3 font-semibold text-ink hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
        >
          {t("home")}
        </Link>
        <Link
          href="/tuki"
          className="min-h-tap inline-flex items-center justify-center rounded-lg border border-em px-6 py-3 font-semibold text-ink hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
        >
          {t("support")}
        </Link>
      </div>
    </div>
  );
}
