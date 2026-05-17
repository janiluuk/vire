"use client";

import { memo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { dispatchBackgroundNavInteraction } from "@/lib/site/background-nav";
import { usePrefetchRoute } from "@/lib/site/route-prefetch";

const TABS = [
  { href: "/", key: "serviceTabOverview" as const, match: "mainPalvelu" as const },
  { href: "/tilaa", key: "ctaOrder" as const, match: "tilaa" as const },
  { href: "/palvelu/b2b", key: "serviceTabB2b" as const, match: "b2b" as const },
  { href: "/#yhteensopivuus", key: "koneet" as const, match: "koneet" as const },
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
      return pathname === "/";
    case "tilaa":
      return pathname === "/tilaa";
    case "b2b":
      return pathname === "/palvelu/b2b";
    case "koneet":
      return pathname.startsWith("/koneet/");
    case "care":
      return pathname === "/care" || pathname.startsWith("/care/");
    case "tilaus":
      return pathname === "/tilaus" || pathname.startsWith("/tilaus/");
    default:
      return false;
  }
}

const ServiceHubTab = memo(function ServiceHubTab({
  href,
  label,
  active,
  onNavClick,
  prefetchOnHover,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavClick: () => void;
  prefetchOnHover?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavClick}
      onMouseEnter={prefetchOnHover}
      onFocus={prefetchOnHover}
      className={tabClass(active)}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
});

export function ServiceHubTabs() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const prefetchOrder = usePrefetchRoute("/tilaa");
  const onNavClick = useCallback(() => {
    dispatchBackgroundNavInteraction();
  }, []);

  return (
    <nav
      aria-label={t("serviceSubNav")}
      className="flex flex-wrap gap-1 border-b border-edge bg-raised px-4 pt-1 sm:px-6"
    >
      {TABS.map(({ href, key, match }) => (
        <ServiceHubTab
          key={href}
          href={href}
          label={t(key)}
          active={isActive(pathname, match)}
          onNavClick={onNavClick}
          prefetchOnHover={href === "/tilaa" ? prefetchOrder : undefined}
        />
      ))}
    </nav>
  );
}
