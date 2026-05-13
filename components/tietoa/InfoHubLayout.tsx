"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

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

export function InfoHubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("tietoa");

  return (
    <div className="grid min-h-[560px] md:grid-cols-[220px_1fr]">
      <aside
        className="border-b border-edge bg-raised md:border-b-0 md:border-r md:border-edge py-6 md:py-0"
        aria-label={t("sidebarAria")}
      >
        <nav className="flex flex-row gap-1 overflow-x-auto px-4 md:flex-col md:px-0 md:py-6">
          {NAV.map(({ href, key }) => {
            const active = navItemActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 border-l-2 border-transparent px-5 py-2.5 text-sm transition-colors duration-150 md:px-5 ${
                  active
                    ? "border-g bg-g/[0.05] font-medium text-g"
                    : "text-fog hover:bg-g/[0.03] hover:text-ink"
                } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g`}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="bg-canvas px-6 py-8 md:px-9 md:py-8">{children}</div>
    </div>
  );
}
