"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { dispatchBackgroundNavInteraction } from "@/lib/site/background-nav";

const TABS = [
  { href: "/meista", key: "aboutCompany" as const },
  { href: "/meista/yhteiso", key: "aboutCommunity" as const },
] as const;

function tabClass(active: boolean) {
  return `min-h-tap shrink-0 rounded-t-lg border-b-2 px-4 py-3 text-sm font-normal transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g ${
    active
      ? "border-g text-g"
      : "border-transparent text-fog hover:border-edge hover:text-ink"
  }`;
}

function isCompanyTab(pathname: string | null) {
  return (
    pathname === "/meista" ||
    pathname === "/about" ||
    pathname?.startsWith("/about/") === true
  );
}

function isCommunityTab(pathname: string | null) {
  return (
    pathname === "/meista/yhteiso" ||
    pathname === "/yhteiso" ||
    pathname?.startsWith("/yhteiso/") === true
  );
}

export function AboutHubTabs() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const onNavClick = () => dispatchBackgroundNavInteraction();

  return (
    <nav
      aria-label={t("aboutSubNav")}
      className="flex flex-wrap gap-1 border-b border-edge bg-raised/70 px-4 pt-1 backdrop-blur-lg sm:px-6"
    >
      {TABS.map(({ href, key }) => {
        const active =
          key === "aboutCompany" ? isCompanyTab(pathname) : isCommunityTab(pathname);
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
  );
}
