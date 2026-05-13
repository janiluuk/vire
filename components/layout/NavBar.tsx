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

/** Segmented top nav — same affordance as locale switcher; not used for the order CTA. */
function topTabClass(active: boolean) {
  return `min-h-tap rounded-md px-3 py-2 text-sm font-semibold tracking-wide transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g ${
    active ? "bg-g text-canvas" : "text-fog hover:text-ink"
  }`;
}

export function NavBar({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const onNavClick = () => dispatchBackgroundNavInteraction();

  const palveluClusterActive =
    pathname.startsWith("/palvelu") ||
    pathname.startsWith("/care") ||
    pathname.startsWith("/koneet") ||
    pathname.startsWith("/tilaus");
  const itseActive = pathname === "/itse" || pathname.startsWith("/itse/");
  const tukiActive = pathname === "/tuki" || pathname.startsWith("/tuki/");
  const infoHubActive =
    pathname === "/tietoa" ||
    pathname.startsWith("/tietoa/") ||
    pathname === "/info" ||
    pathname.startsWith("/info/") ||
    pathname === "/sovellukset" ||
    pathname.startsWith("/sovellukset/");
  const aboutHubActive =
    pathname === "/about" ||
    pathname.startsWith("/about/") ||
    pathname === "/meista" ||
    pathname.startsWith("/meista/") ||
    pathname === "/yhteiso" ||
    pathname.startsWith("/yhteiso/");

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
            className="flex flex-wrap items-center gap-1 rounded-lg border border-em bg-sunken/80 p-1"
          >
            <Link
              href="/palvelu"
              onClick={onNavClick}
              className={topTabClass(palveluClusterActive)}
              aria-current={palveluClusterActive ? "page" : undefined}
            >
              {t("service")}
            </Link>

            <Link
              href="/tietoa"
              onClick={onNavClick}
              className={topTabClass(infoHubActive)}
              aria-current={infoHubActive ? "page" : undefined}
            >
              {t("infoHub")}
            </Link>

            <Link
              href="/itse"
              onClick={onNavClick}
              className={topTabClass(itseActive)}
              aria-current={itseActive ? "page" : undefined}
            >
              {t("diy")}
            </Link>

            <Link
              href="/meista"
              onClick={onNavClick}
              className={topTabClass(aboutHubActive)}
              aria-current={aboutHubActive ? "page" : undefined}
            >
              {t("aboutHub")}
            </Link>

            <Link
              href="/tuki"
              onClick={onNavClick}
              className={topTabClass(tukiActive)}
              aria-current={tukiActive ? "page" : undefined}
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
