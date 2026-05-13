"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function AppOsTabs() {
  const t = useTranslations("tietoa.apps");
  const pathname = usePathname();
  const win = pathname.includes("/sovellukset/mac") ? false : true;

  return (
    <div className="mb-6 flex flex-wrap gap-1.5">
      <Link
        href="/tietoa/sovellukset/windows"
        className={`flex min-h-tap items-center gap-2 rounded-lg border px-5 py-2 font-mono text-[13px] transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
          win
            ? "border-g bg-g/10 text-g"
            : "border-em text-fog hover:border-em hover:text-ink"
        }`}
      >
        <span aria-hidden>🪟</span>
        {t("tabWindows")}
      </Link>
      <Link
        href="/tietoa/sovellukset/mac"
        className={`flex min-h-tap items-center gap-2 rounded-lg border px-5 py-2 font-mono text-[13px] transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
          !win
            ? "border-g bg-g/10 text-g"
            : "border-em text-fog hover:border-em hover:text-ink"
        }`}
      >
        <span aria-hidden>🍎</span>
        {t("tabMac")}
      </Link>
    </div>
  );
}
