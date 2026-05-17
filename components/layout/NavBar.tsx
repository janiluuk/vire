"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { dispatchBackgroundNavInteraction } from "@/lib/site/background-nav";
import {
  isMainNavClusterActive,
  MAIN_NAV_ITEMS,
} from "@/lib/site/main-nav";
import { ORDER_WIZARD_PATH } from "@/lib/site/order-wizard-path";
import { usePrefetchRouteHandlers } from "@/lib/site/route-prefetch";
import { feedbackPrimaryCTA } from "@/lib/site/ui-feedback";

function BrandMark({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower === "sparkki") {
    return (
      <span className="font-display text-2xl font-extrabold tracking-tight">
        <span className="text-g">Spark</span>
        <span className="text-ink">ki</span>
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
  return `min-h-tap rounded-md px-3 py-2 text-sm font-semibold tracking-wide transition-[color,background-color,transform,box-shadow] duration-hover ease-out-soft active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g ${
    active
      ? "bg-g text-canvas shadow-elevation-xs"
      : "text-fog hover:text-ink hover:-translate-y-px motion-reduce:hover:translate-none"
  }`;
}

const MobileNavLink = memo(function MobileNavLink({
  href,
  active,
  children,
  onPick,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
  onPick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={() => {
        onPick();
        dispatchBackgroundNavInteraction();
      }}
      className={`min-h-12 rounded-lg px-4 py-3 text-base font-semibold transition-[colors,transform] active:scale-[0.99] motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g md:min-h-tap ${
        active ? "bg-g text-canvas" : "text-ink hover:bg-sunken"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
});

const MainNavTab = memo(function MainNavTab({
  href,
  active,
  label,
  onNav,
}: {
  href: string;
  active: boolean;
  label: string;
  onNav: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNav}
      className={topTabClass(active)}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
});

export function NavBar({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const tPal = useTranslations("commandPalette");
  const pathname = usePathname();
  const orderPrefetch = usePrefetchRouteHandlers(ORDER_WIZARD_PATH);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileSheetRef = useRef<HTMLDivElement>(null);

  const onNavClick = useCallback(() => {
    dispatchBackgroundNavInteraction();
  }, []);
  const closeMobileSheet = useCallback(() => {
    setMobileOpen(false);
  }, []);
  const openMobileSheet = useCallback(() => {
    setMobileOpen(true);
  }, []);

  const onOrderCta = useCallback(() => {
    feedbackPrimaryCTA();
    dispatchBackgroundNavInteraction();
  }, []);

  const closeMobileAndNav = useCallback(() => {
    setMobileOpen(false);
    dispatchBackgroundNavInteraction();
  }, []);

  const onMobileOrderCta = useCallback(() => {
    onOrderCta();
    closeMobileSheet();
  }, [onOrderCta, closeMobileSheet]);

  useEffect(() => {
    if (!mobileOpen) return;

    const returnFocusTo = document.activeElement as HTMLElement | null;
    const root = mobileSheetRef.current;

    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      root
        ? Array.from(
            root.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])',
            ),
          )
        : [];

    function onTabTrap(e: KeyboardEvent) {
      if (e.key !== "Tab" || !root) return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0]!;
      const last = list[list.length - 1]!;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onTabTrap);
    const raf = requestAnimationFrame(() => {
      focusables()[0]?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onEsc);
      document.removeEventListener("keydown", onTabTrap);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(raf);
      returnFocusTo?.focus?.();
    };
  }, [mobileOpen]);

  return (
    <header className="surface-header-scrim sparkki-header-reactive sticky top-0 z-30 border-b border-edge pt-safe backdrop-blur-spark-xl">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-12 sm:py-5">
        <Link
          href="/"
          onClick={onNavClick}
          className="flex min-h-tap items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
        >
          <BrandMark name={t("brand")} />
        </Link>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <p className="hidden xl:block text-[10px] font-medium uppercase tracking-wider text-fog">
            {tPal("shortcutHint")}
          </p>

          <nav
            aria-label={t("mainNav")}
            className="hidden flex-wrap items-center gap-1 rounded-lg border border-em bg-sunken/80 p-1 md:flex"
          >
            {MAIN_NAV_ITEMS.map((item) => {
              const active = isMainNavClusterActive(item.cluster, pathname);
              return (
                <MainNavTab
                  key={item.href}
                  href={item.href}
                  active={active}
                  label={t(item.labelKey)}
                  onNav={onNavClick}
                />
              );
            })}
          </nav>

          <button
            type="button"
            className="inline-flex min-h-tap min-w-12 items-center justify-center rounded-lg border border-em bg-sunken/80 px-3 py-2 text-ink md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-g"
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            aria-controls="site-mobile-nav"
            onClick={openMobileSheet}
          >
            <span className="sr-only">{tPal("openMobileMenu")}</span>
            <span className="flex flex-col gap-1.5" aria-hidden>
              <span className="block h-0.5 w-5 rounded-full bg-ink" />
              <span className="block h-0.5 w-5 rounded-full bg-ink" />
              <span className="block h-0.5 w-5 rounded-full bg-ink" />
            </span>
          </button>

          <div
            role="group"
            aria-label={t("headerActionsLabel")}
            className="flex shrink-0 items-center gap-2 sm:gap-3"
          >
            <Link
              href={ORDER_WIZARD_PATH}
              onClick={onOrderCta}
              {...orderPrefetch}
              className="sparkki-pressable inline-flex min-h-tap shrink-0 items-center justify-center rounded-lg bg-g px-5 py-2.5 text-sm font-bold tracking-tight text-canvas transition-opacity duration-150 hover:opacity-[0.85] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
            >
              {t("ctaOrder")}
            </Link>

            <div
              className="flex gap-1 rounded-lg border border-em bg-sunken/80 p-1"
              role="group"
              aria-label={t("localeSwitcher")}
            >
              <Link
                href={pathname}
                locale="fi"
                onClick={onNavClick}
                aria-label={
                  locale === "fi" ? t("localeActiveFi") : t("localeSwitchToFi")
                }
                aria-current={locale === "fi" ? true : undefined}
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
                aria-label={
                  locale === "en" ? t("localeActiveEn") : t("localeSwitchToEn")
                }
                aria-current={locale === "en" ? true : undefined}
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
      </div>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="sparkki-modal-backdrop fixed inset-0 z-[45] md:hidden"
            aria-hidden
            onClick={closeMobileSheet}
          />
          <div
            ref={mobileSheetRef}
            id="site-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label={tPal("mobileMenuTitle")}
            className="sparkki-mobile-sheet fixed inset-x-0 bottom-0 z-[46] flex max-h-[min(88dvh,28rem)] flex-col rounded-t-2xl border border-b-0 border-edge bg-canvas shadow-elevation-md md:hidden"
          >
            <div className="flex shrink-0 flex-col items-center border-b border-edge px-4 pb-2 pt-1">
              <span
                className="h-1 w-10 shrink-0 rounded-full bg-em/80"
                aria-hidden
              />
              <div className="mt-3 flex w-full items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-fog">
                  {tPal("mobileMenuTitle")}
                </span>
                <button
                  type="button"
                  className="min-h-tap min-w-12 rounded-lg border border-em px-3 text-lg text-ink hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-g"
                  onClick={closeMobileSheet}
                >
                  <span className="sr-only">{tPal("closeMobileMenu")}</span>
                  <span aria-hidden>×</span>
                </button>
              </div>
            </div>
            <nav
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-y-contain p-3 touch-pan-y"
              aria-label={t("mainNav")}
            >
              <div role="group" aria-labelledby="mobile-nav-hubs-heading">
                <p
                  id="mobile-nav-hubs-heading"
                  className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-fog"
                >
                  {tPal("mobileHubsHeading")}
                </p>
                <div className="flex flex-col gap-1">
                  {MAIN_NAV_ITEMS.map((item) => (
                    <MobileNavLink
                      key={item.href}
                      href={item.href}
                      active={isMainNavClusterActive(item.cluster, pathname)}
                      onPick={closeMobileSheet}
                    >
                      {t(item.labelKey)}
                    </MobileNavLink>
                  ))}
                </div>
              </div>
              <div
                role="group"
                aria-labelledby="mobile-nav-order-heading"
                className="border-t border-edge pt-3"
              >
                <p
                  id="mobile-nav-order-heading"
                  className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-fog"
                >
                  {tPal("mobileOrderHeading")}
                </p>
                <Link
                  href={ORDER_WIZARD_PATH}
                  onClick={onMobileOrderCta}
                  {...orderPrefetch}
                  className="sparkki-pressable inline-flex min-h-tap w-full items-center justify-center rounded-lg bg-g px-4 py-3 text-sm font-bold text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-g"
                >
                  {t("ctaOrder")}
                </Link>
              </div>
            </nav>
            <div className="border-t border-edge p-3 pb-safe">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fog">
                {tPal("language")}
              </p>
              <div
                className="flex gap-1 rounded-lg border border-em bg-sunken/80 p-1"
                role="group"
                aria-label={t("localeSwitcher")}
              >
                <Link
                  href={pathname}
                  locale="fi"
                  onClick={closeMobileAndNav}
                  aria-label={
                    locale === "fi" ? t("localeActiveFi") : t("localeSwitchToFi")
                  }
                  aria-current={locale === "fi" ? true : undefined}
                  className={`min-h-tap flex-1 rounded-md py-2 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
                    locale === "fi" ? "bg-g text-canvas" : "text-fog hover:text-ink"
                  }`}
                  hrefLang="fi"
                >
                  FI
                </Link>
                <Link
                  href={pathname}
                  locale="en"
                  onClick={closeMobileAndNav}
                  aria-label={
                    locale === "en" ? t("localeActiveEn") : t("localeSwitchToEn")
                  }
                  aria-current={locale === "en" ? true : undefined}
                  className={`min-h-tap flex-1 rounded-md py-2 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
                    locale === "en" ? "bg-g text-canvas" : "text-fog hover:text-ink"
                  }`}
                  hrefLang="en"
                >
                  EN
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
