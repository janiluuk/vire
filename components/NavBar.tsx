"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const links = [
  { href: "/", key: "home" as const },
  { href: "/palvelu", key: "service" as const },
  { href: "/itse", key: "diy" as const },
  { href: "/sovellukset", key: "apps" as const },
  { href: "/tuki", key: "support" as const },
  { href: "/info", key: "info" as const },
  { href: "/about", key: "about" as const },
  { href: "/yhteiso", key: "community" as const },
];

export function NavBar({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/70 bg-white/75 shadow-sm shadow-slate-900/[0.04] backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:py-4">
        <Link
          href="/"
          className="flex min-h-tap items-center text-xl font-bold tracking-tight text-verso-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verso-green"
        >
          <span className="rounded-lg bg-verso-green/10 px-2 py-0.5 text-verso-green ring-1 ring-verso-green/15">
            {t("brand")}
          </span>
        </Link>
        <nav
          aria-label={t("mainNav")}
          className="flex flex-wrap gap-1 sm:gap-2"
        >
          {links.map(({ href, key }) => (
            <Link
              key={key}
              href={href}
              className={`min-h-tap rounded-xl px-3 py-2 text-[1.05rem] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verso-green ${
                pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-800 hover:bg-gray-100/90"
              }`}
            >
              {t(key)}
            </Link>
          ))}
        </nav>
        <div className="flex gap-1.5 rounded-xl bg-gray-100/80 p-1 ring-1 ring-gray-200/80">
          <Link
            href={pathname}
            locale="fi"
            className={`min-h-tap rounded-lg px-3 py-2 text-sm font-semibold tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-verso-green ${
              locale === "fi"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            hrefLang="fi"
          >
            FI
          </Link>
          <Link
            href={pathname}
            locale="en"
            className={`min-h-tap rounded-lg px-3 py-2 text-sm font-semibold tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-verso-green ${
              locale === "en"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
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
