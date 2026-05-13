"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { dispatchBackgroundNavInteraction } from "@/lib/site/background-nav";

const TABS = [
  { href: "/palvelu", key: "serviceTabOverview" as const, match: "mainPalvelu" as const },
  { href: "/palvelu/b2b", key: "serviceTabB2b" as const, match: "b2b" as const },
  { href: "/koneet", key: "koneet" as const, match: "koneet" as const },
  { href: "/care", key: "serviceTabCare" as const, match: "care" as const },
  { href: "/tilaus", key: "serviceTabTrack" as const, match: "tilaus" as const },
] as const;

function tabClass(active: boolean) {
  return `min-h-tap shrink-0 rounded-t-lg border-b-2 px-4 py-3 text-sm font-normal transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g ${
    active
      ? "border-g text-g"
      : "border-transparent text-fog hover:border-edge hover:text-ink"
  }`;
}

function isActive(
  pathname: string | null,
  match: (typeof TABS)[number]["match"],
): boolean {
  if (!pathname) return false;
  switch (match) {
    case "mainPalvelu":
      if (!pathname.startsWith("/palvelu")) return false;
      return pathname !== "/palvelu/b2b";
    case "b2b":
      return pathname === "/palvelu/b2b";
    case "koneet":
      return pathname === "/koneet" || pathname.startsWith("/koneet/");
    case "care":
      return pathname === "/care" || pathname.startsWith("/care/");
    case "tilaus":
      return pathname === "/tilaus" || pathname.startsWith("/tilaus/");
    default:
      return false;
  }
}

export function ServiceHubTabs() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const onNavClick = () => dispatchBackgroundNavInteraction();

  return (
    <nav
      aria-label={t("serviceSubNav")}
      className="flex flex-wrap gap-1 border-b border-edge bg-raised px-4 pt-1 sm:px-6"
    >
      {TABS.map(({ href, key, match }) => {
        const active = isActive(pathname, match);
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
