"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { dispatchBackgroundNavInteraction } from "@/lib/site/background-nav";

function BrandMark({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower === "vire") {
    return (
      <span className="font-display text-2xl font-extrabold tracking-tight">
        <span className="text-g">Vi</span>
        <span className="text-ink">re</span>
      </span>
    );
  }
  return (
    <span className="font-display text-2xl font-extrabold tracking-tight text-g">
      {name}
    </span>
  );
}

function navLinkClass(active: boolean) {
  return `min-h-tap rounded-lg px-3 py-2 text-sm font-normal transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g ${
    active
      ? "text-g"
      : "text-fog hover:bg-g/[0.06] hover:text-ink"
  }`;
}

function subMenuLinkClass() {
  return "vire-sub-menu-link block rounded-md px-3 py-[7px] text-[13px] text-fog transition-colors duration-150 hover:bg-g/[0.08] hover:text-g focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g";
}

export function NavBar({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const onNavClick = () => dispatchBackgroundNavInteraction();

  const palveluActive =
    pathname === "/palvelu" || pathname.startsWith("/palvelu/");
  const itseActive = pathname === "/itse" || pathname.startsWith("/itse/");
  const tukiActive = pathname === "/tuki" || pathname.startsWith("/tuki/");
  const infoHubActive =
    pathname === "/tietoa" ||
    pathname.startsWith("/tietoa/") ||
    pathname === "/info" ||
    pathname.startsWith("/info/") ||
    pathname === "/sovellukset" ||
    pathname.startsWith("/sovellukset/");
  const koneetActive =
    pathname === "/koneet" || pathname.startsWith("/koneet/");
  const aboutHubActive =
    pathname === "/about" ||
    pathname.startsWith("/about/") ||
    pathname === "/meista" ||
    pathname.startsWith("/meista/") ||
    pathname === "/yhteiso" ||
    pathname.startsWith("/yhteiso/");

  const infoLinks = [
    { href: "/tietoa", key: "infoHubOverview" as const },
    { href: "/tietoa/hyodyt", key: "infoBenefits" as const },
    { href: "/tietoa/linux", key: "infoLinux" as const },
    { href: "/tietoa/vakaus", key: "infoStability" as const },
    { href: "/tietoa/huolia", key: "infoFaq" as const },
    { href: "/tietoa/sovellukset/windows", key: "infoAppsWin" as const },
    { href: "/tietoa/sovellukset/mac", key: "infoAppsMac" as const },
  ];

  const aboutLinks = [
    { href: "/meista", key: "aboutCompany" as const },
    { href: "/meista/yhteiso", key: "aboutCommunity" as const },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-edge bg-[rgba(8,12,10,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-12 sm:py-5">
        <Link
          href="/"
          onClick={onNavClick}
          className="flex min-h-tap items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
        >
          <BrandMark name={t("brand")} />
        </Link>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <nav
            aria-label={t("mainNav")}
            className="flex flex-wrap items-center gap-1 sm:gap-2"
          >
            <Link
              href="/palvelu"
              onClick={onNavClick}
              className={navLinkClass(palveluActive)}
            >
              {t("service")}
            </Link>

            <div className="flex items-stretch">
              <Link
                href="/tietoa"
                onClick={onNavClick}
                className={`${navLinkClass(infoHubActive)} rounded-r-none pr-2`}
              >
                {t("infoHub")}
              </Link>
              <details className="vire-nav-disclosure group relative">
                <summary
                  className={`${navLinkClass(false)} list-none cursor-pointer rounded-l-none border-l border-edge/60 pl-1 pr-2 [&::-webkit-details-marker]:hidden`}
                  aria-label={t("infoHubSubmenu")}
                >
                  <span className="text-[10px] opacity-70" aria-hidden>
                    ▾
                  </span>
                </summary>
                <ul
                  className="vire-sub-menu flex flex-col absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-[10px] border border-em bg-card p-2 shadow-none"
                  role="menu"
                >
                  {infoLinks.map(({ href, key }) => (
                    <li key={key} role="none">
                      <Link
                        role="menuitem"
                        href={href}
                        onClick={onNavClick}
                        className={subMenuLinkClass()}
                      >
                        {t(key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </div>

            <Link
              href="/itse"
              onClick={onNavClick}
              className={navLinkClass(itseActive)}
            >
              {t("diy")}
            </Link>

            <Link
              href="/koneet"
              onClick={onNavClick}
              className={navLinkClass(koneetActive)}
            >
              {t("koneet")}
            </Link>

            <details className="vire-nav-disclosure group relative">
              <summary
                className={`${navLinkClass(aboutHubActive)} cursor-pointer`}
              >
                <span className="inline-flex items-center gap-1">
                  {t("aboutHub")}
                  <span className="text-[10px] opacity-70" aria-hidden>
                    ▾
                  </span>
                </span>
              </summary>
              <ul
                className="vire-sub-menu flex flex-col absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-[10px] border border-em bg-card p-2 shadow-none"
                role="menu"
              >
                {aboutLinks.map(({ href, key }) => (
                  <li key={key} role="none">
                    <Link
                      role="menuitem"
                      href={href}
                      onClick={onNavClick}
                      className={subMenuLinkClass()}
                    >
                      {t(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>

            <Link
              href="/tuki"
              onClick={onNavClick}
              className={navLinkClass(tukiActive)}
            >
              {t("support")}
            </Link>
          </nav>

          <Link
            href="/palvelu#palvelu-tilaa"
            onClick={onNavClick}
            className="inline-flex min-h-tap shrink-0 items-center justify-center rounded-lg bg-g px-5 py-2.5 text-sm font-bold tracking-tight text-canvas transition-opacity duration-150 hover:opacity-[0.85] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
          >
            {t("ctaOrder")}
          </Link>

          <div className="flex gap-1 rounded-lg border border-em bg-sunken/80 p-1">
            <Link
              href={pathname}
              locale="fi"
              onClick={onNavClick}
              className={`min-h-tap rounded-md px-3 py-2 text-sm font-semibold tracking-wide transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g ${
                locale === "fi"
                  ? "bg-g text-canvas"
                  : "text-fog hover:text-ink"
              }`}
              hrefLang="fi"
            >
              FI
            </Link>
            <Link
              href={pathname}
              locale="en"
              onClick={onNavClick}
              className={`min-h-tap rounded-md px-3 py-2 text-sm font-semibold tracking-wide transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g ${
                locale === "en"
                  ? "bg-g text-canvas"
                  : "text-fog hover:text-ink"
              }`}
              hrefLang="en"
            >
              EN
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
