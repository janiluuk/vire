"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const links = [
  { href: "/", key: "home" as const },
  { href: "/palvelu", key: "service" as const },
  { href: "/itse", key: "diy" as const },
  { href: "/sovellukset", key: "apps" as const },
  { href: "/tuki", key: "support" as const },
  { href: "/yhteiso", key: "community" as const },
];

export function NavBar({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="text-xl font-bold text-verso-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verso-green min-h-tap flex items-center"
        >
          {t("brand")}
        </Link>
        <nav aria-label={t("mainNav")} className="flex flex-wrap gap-2">
          {links.map(({ href, key }) => (
            <Link
              key={key}
              href={href}
              className={`min-h-tap rounded-lg px-3 py-2 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verso-green ${
                pathname === href
                  ? "bg-verso-green/15 text-gray-900"
                  : "text-gray-900 hover:bg-gray-100"
              }`}
            >
              {t(key)}
            </Link>
          ))}
        </nav>
        <div className="flex gap-2">
          <Link
            href={pathname}
            locale="fi"
            className={`min-h-tap rounded-lg px-3 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-verso-green ${
              locale === "fi" ? "bg-verso-green text-white" : "bg-gray-100"
            }`}
            hrefLang="fi"
          >
            FI
          </Link>
          <Link
            href={pathname}
            locale="en"
            className={`min-h-tap rounded-lg px-3 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-verso-green ${
              locale === "en" ? "bg-verso-green text-white" : "bg-gray-100"
            }`}
            hrefLang="en"
          >
            EN
          </Link>
        </div>
      </div>
    </header>
  );
}
