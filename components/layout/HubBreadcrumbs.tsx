"use client";

import { Fragment, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { dispatchBackgroundNavInteraction } from "@/lib/site/background-nav";

export type BreadcrumbItem = { href?: string; label: string };

export function Breadcrumbs({
  items,
  ariaLabel,
}: {
  items: BreadcrumbItem[];
  ariaLabel: string;
}) {
  if (items.length < 2) return null;

  return (
    <nav aria-label={ariaLabel} className="sparkki-breadcrumb">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0 text-sm text-fog">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={`${item.label}-${i}`}>
              {i > 0 ? (
                <li aria-hidden className="select-none text-dust">
                  <span className="px-0.5">/</span>
                </li>
              ) : null}
              <li className="flex min-h-9 items-center">
                {last || !item.href ? (
                  <span
                    className="font-medium text-ink"
                    aria-current={last ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => dispatchBackgroundNavInteraction()}
                    className="rounded-md text-fog transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

const TIETOA_NAV: readonly {
  href: string;
  key:
    | "navHub"
    | "navBenefits"
    | "navGallery"
    | "navLinux"
    | "navStability"
    | "navConcerns"
    | "navAppsWin"
    | "navAppsMac";
}[] = [
  { href: "/tietoa", key: "navHub" },
  { href: "/tietoa/hyodyt", key: "navBenefits" },
  { href: "/tietoa/galleria", key: "navGallery" },
  { href: "/tietoa/linux", key: "navLinux" },
  { href: "/tietoa/vakaus", key: "navStability" },
  { href: "/tietoa/huolia", key: "navConcerns" },
  { href: "/tietoa/sovellukset/windows", key: "navAppsWin" },
  { href: "/tietoa/sovellukset/mac", key: "navAppsMac" },
] as const;

function resolveTietoaKey(pathname: string | null): (typeof TIETOA_NAV)[number]["key"] {
  if (!pathname || pathname === "/tietoa") return "navHub";
  const match = [...TIETOA_NAV]
    .filter((n) => n.href !== "/tietoa")
    .sort((a, b) => b.href.length - a.href.length)
    .find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
  return match?.key ?? "navHub";
}

function InfoHubBreadcrumbs() {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tTietoa = useTranslations("tietoa");
  const tHome = useTranslations("commandPalette");

  const items = useMemo(() => {
    const leafKey = resolveTietoaKey(pathname);
    return [
      { href: "/", label: tHome("home") },
      { href: "/tietoa", label: tNav("infoHub") },
      { label: tTietoa(leafKey) },
    ];
  }, [pathname, tHome, tNav, tTietoa]);

  return <Breadcrumbs ariaLabel={tNav("breadcrumbAria")} items={items} />;
}

const KONEET_DETAIL = /^\/koneet\/[^/]+$/;

function ServiceHubBreadcrumbs() {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tHome = useTranslations("commandPalette");

  const items = useMemo(() => {
    if (!pathname || KONEET_DETAIL.test(pathname)) return null;

    const home = { href: "/", label: tHome("home") } as const;
    const hub = { href: "/", label: tNav("service") } as const;

    if (pathname === "/tilaa") {
      return [home, hub, { label: tNav("ctaOrder") }];
    }
    if (pathname === "/palvelu/b2b") {
      return [home, hub, { label: tNav("serviceTabB2b") }];
    }
    if (pathname.startsWith("/koneet")) {
      return [home, hub, { label: tNav("koneet") }];
    }
    if (pathname.startsWith("/care")) {
      return [home, hub, { label: tNav("serviceTabCare") }];
    }
    if (pathname.startsWith("/tilaus")) {
      return [home, hub, { label: tNav("serviceTabTrack") }];
    }
    return [home, hub, { label: tNav("serviceTabOverview") }];
  }, [pathname, tHome, tNav]);

  if (!items) return null;

  return <Breadcrumbs ariaLabel={tNav("breadcrumbAria")} items={items} />;
}

function isCommunityPath(pathname: string | null) {
  return (
    pathname === "/meista/yhteiso" ||
    pathname === "/yhteiso" ||
    pathname?.startsWith("/yhteiso/") === true
  );
}

function AboutHubBreadcrumbs() {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tHome = useTranslations("commandPalette");

  const items = useMemo(() => {
    const home = { href: "/", label: tHome("home") } as const;
    const hub = { href: "/meista", label: tNav("aboutHub") } as const;
    const community = isCommunityPath(pathname);
    return [
      home,
      hub,
      {
        label: community ? tNav("aboutCommunity") : tNav("aboutCompany"),
      },
    ];
  }, [pathname, tHome, tNav]);

  return <Breadcrumbs ariaLabel={tNav("breadcrumbAria")} items={items} />;
}

/** Phase 11 — contextual crumbs for major hubs (mounted from locale layout). */
export function AutoHubBreadcrumbs() {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;

  if (pathname.startsWith("/tietoa")) {
    return <InfoHubBreadcrumbs />;
  }

  if (
    pathname.startsWith("/palvelu") ||
    pathname === "/tilaa" ||
    pathname.startsWith("/koneet") ||
    pathname.startsWith("/care") ||
    pathname.startsWith("/tilaus")
  ) {
    return <ServiceHubBreadcrumbs />;
  }

  if (
    pathname.startsWith("/meista") ||
    pathname === "/about" ||
    pathname.startsWith("/about/") ||
    pathname.startsWith("/yhteiso")
  ) {
    return <AboutHubBreadcrumbs />;
  }

  return null;
}

export function KoneetDetailBreadcrumbs({
  make,
  model,
}: {
  make: string;
  model: string;
}) {
  const tNav = useTranslations("nav");
  const tHome = useTranslations("commandPalette");

  const items = useMemo(
    () => [
      { href: "/", label: tHome("home") },
      { href: "/", label: tNav("service") },
      { href: "/#yhteensopivuus", label: tNav("koneet") },
      { label: `${make} ${model}` },
    ],
    [make, model, tHome, tNav],
  );

  return <Breadcrumbs ariaLabel={tNav("breadcrumbAria")} items={items} />;
}
