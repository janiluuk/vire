"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { dispatchBackgroundNavInteraction } from "@/lib/site/background-nav";

const NAV = [
  { href: "/tietoa", key: "navHub" },
  { href: "/tietoa/hyodyt", key: "navBenefits" },
  { href: "/tietoa/linux", key: "navLinux" },
  { href: "/tietoa/vakaus", key: "navStability" },
  { href: "/tietoa/huolia", key: "navConcerns" },
  { href: "/tietoa/sovellukset/windows", key: "navAppsWin" },
  { href: "/tietoa/sovellukset/mac", key: "navAppsMac" },
] as const;

function navItemActive(pathname: string | null, href: string) {
  if (href === "/tietoa") return pathname === "/tietoa";
  return pathname === href || pathname?.startsWith(`${href}/`) === true;
}

function tabClass(active: boolean) {
  return `min-h-tap shrink-0 rounded-t-lg border-b-2 px-4 py-3 text-sm font-normal transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g ${
    active
      ? "border-g text-g"
      : "border-transparent text-fog hover:border-edge hover:text-ink"
  }`;
}

export function InfoHubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("tietoa");
  const onNavClick = () => dispatchBackgroundNavInteraction();

  return (
    <div className="flex min-h-[560px] flex-col">
      <nav
        aria-label={t("sidebarAria")}
        className="flex flex-wrap gap-1 border-b border-edge bg-raised px-4 pt-1 sm:px-6"
      >
        {NAV.map(({ href, key }) => {
          const active = navItemActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={tabClass(active)}
              aria-current={active ? "page" : undefined}
            >
              {t(key)}
            </Link>
          );
        })}
      </nav>
      <div className="flex-1 bg-canvas px-6 py-8 md:px-9 md:py-8">{children}</div>
    </div>
  );
}
