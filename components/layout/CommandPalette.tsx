"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { MAIN_NAV_ITEMS } from "@/lib/site/main-nav";
import {
  readRecentRoutes,
  recordRecentRoute,
} from "@/lib/site/palette-recent-routes";

type PaletteEntry = { href: string; label: string; group: "hubs" | "service" | "more" };

/**
 * Phase 6 — ⌘K / Ctrl+K quick jump to main public routes (no extra dependencies).
 * Phase 5 — catalog is grouped when not searching; hubs mirror `MAIN_NAV_ITEMS`.
 */
function labelForHref(
  href: string,
  catalog: readonly { href: string; label: string }[],
): string {
  const hit = catalog.find((i) => i.href === href);
  if (hit) return hit.label;
  return href;
}

export function CommandPalette() {
  const tNav = useTranslations("nav");
  const tPal = useTranslations("commandPalette");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const paletteCatalog = useMemo((): readonly PaletteEntry[] => {
    const hubs: PaletteEntry[] = MAIN_NAV_ITEMS.map((it) => ({
      href: it.href,
      label: tNav(it.labelKey),
      group: "hubs",
    }));
    const service: PaletteEntry[] = [
      { href: "/palvelu/b2b", label: tNav("serviceTabB2b"), group: "service" },
      { href: "/care", label: tNav("serviceTabCare"), group: "service" },
      { href: "/tilaus", label: tNav("serviceTabTrack"), group: "service" },
      { href: "/koneet", label: tNav("koneet"), group: "service" },
      {
        href: "/palvelu#palvelu-tilaa",
        label: tNav("ctaOrder"),
        group: "service",
      },
    ];
    const more: PaletteEntry[] = [
      { href: "/", label: tPal("home"), group: "more" },
      { href: "/yhteiso", label: tNav("aboutCommunity"), group: "more" },
      { href: "/tietosuoja", label: tPal("privacy"), group: "more" },
      { href: "/vire-for-good", label: tPal("forGood"), group: "more" },
    ];
    return [...hubs, ...service, ...more];
  }, [tNav, tPal]);

  const searching = q.trim() !== "";

  const searchFiltered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [...paletteCatalog];
    return paletteCatalog.filter((it) =>
      it.label.toLowerCase().includes(s),
    );
  }, [paletteCatalog, q]);

  const recentSet = useMemo(() => new Set(recent), [recent]);

  const catalogItems = useMemo(() => {
    if (searching) return searchFiltered;
    return searchFiltered.filter((it) => !recentSet.has(it.href));
  }, [searchFiltered, recentSet, searching]);

  const groupedForBrowse = useMemo(() => {
    if (searching) return null;
    return {
      hubs: catalogItems.filter((i) => i.group === "hubs"),
      service: catalogItems.filter((i) => i.group === "service"),
      more: catalogItems.filter((i) => i.group === "more"),
    };
  }, [catalogItems, searching]);

  useEffect(() => {
    const path = !pathname || pathname === "" ? "/" : pathname;
    const h = typeof window !== "undefined" ? window.location.hash : "";
    recordRecentRoute(`${path}${h}`);
  }, [pathname]);

  useEffect(() => {
    function onHash() {
      const path = !pathname || pathname === "" ? "/" : pathname;
      recordRecentRoute(`${path}${window.location.hash}`);
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [pathname]);

  useEffect(() => {
    if (open) setRecent(readRecentRoutes());
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [router, close],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (prev) setQ("");
          return !prev;
        });
        return;
      }
      if (open && e.key === "Escape") {
        e.preventDefault();
        close();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = "";
      cancelAnimationFrame(id);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = panelRef.current;
    if (!root) return;

    const focusables = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
        ),
      );

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
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

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh] sm:pt-[18vh]">
      <button
        type="button"
        className="sparkki-modal-backdrop absolute inset-0"
        aria-hidden
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={tPal("title")}
        className="sparkki-wizard-full relative z-[1] w-full max-w-lg overflow-hidden rounded-2xl border border-edge bg-canvas shadow-elevation-md"
      >
        <div className="border-b border-edge px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-fog">
            {tPal("title")}
          </p>
          <input
            ref={inputRef}
            type="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tPal("searchPlaceholder")}
            className="sparkki-input mt-2 w-full rounded-lg border border-em bg-sunken px-3 py-2.5 text-lg text-ink placeholder:text-dust"
          />
        </div>
        <nav
          className="max-h-[min(50vh,22rem)] overflow-y-auto p-2"
          aria-label={tPal("title")}
        >
          {(() => {
            const showRecent = !searching && recent.length > 0;
            if (searching && catalogItems.length === 0) {
              return (
                <p className="px-3 py-6 text-center text-fog">{tPal("noResults")}</p>
              );
            }
            return (
              <>
                {showRecent ? (
                  <div className="mb-2 border-b border-edge pb-2" role="group">
                    <p
                      id="cmd-palette-recent-lbl"
                      className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-fog"
                    >
                      {tPal("recentHeading")}
                    </p>
                    <ul
                      className="space-y-0.5"
                      aria-labelledby="cmd-palette-recent-lbl"
                    >
                      {recent.map((href) => {
                        const label = labelForHref(href, paletteCatalog);
                        const known = paletteCatalog.some((i) => i.href === href);
                        return (
                          <li key={`recent:${href}`}>
                            <button
                              type="button"
                              onClick={() => go(href)}
                              className="flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-g"
                            >
                              <span className="text-base text-ink">{label}</span>
                              {!known ? (
                                <span className="mt-0.5 truncate font-mono text-xs text-fog">
                                  {href}
                                </span>
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}

                {searching ? (
                  catalogItems.length > 0 ? (
                    <ul className="space-y-0.5">
                      {catalogItems.map((it) => (
                        <li key={it.href}>
                          <button
                            type="button"
                            onClick={() => go(it.href)}
                            className="flex w-full rounded-lg px-3 py-2.5 text-left text-base text-ink transition-colors hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-g"
                          >
                            {it.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null
                ) : groupedForBrowse ? (
                  <div className="space-y-3">
                    {groupedForBrowse.hubs.length > 0 ? (
                      <div role="group" aria-labelledby="cmd-pal-hubs">
                        <p
                          id="cmd-pal-hubs"
                          className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-fog"
                        >
                          {tPal("groupMainHubs")}
                        </p>
                        <ul className="space-y-0.5">
                          {groupedForBrowse.hubs.map((it) => (
                            <li key={it.href}>
                              <button
                                type="button"
                                onClick={() => go(it.href)}
                                className="flex w-full rounded-lg px-3 py-2.5 text-left text-base text-ink transition-colors hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-g"
                              >
                                {it.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {groupedForBrowse.service.length > 0 ? (
                      <div role="group" aria-labelledby="cmd-pal-service">
                        <p
                          id="cmd-pal-service"
                          className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-fog"
                        >
                          {tPal("groupServiceExtra")}
                        </p>
                        <ul className="space-y-0.5">
                          {groupedForBrowse.service.map((it) => (
                            <li key={it.href}>
                              <button
                                type="button"
                                onClick={() => go(it.href)}
                                className="flex w-full rounded-lg px-3 py-2.5 text-left text-base text-ink transition-colors hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-g"
                              >
                                {it.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {groupedForBrowse.more.length > 0 ? (
                      <div role="group" aria-labelledby="cmd-pal-more">
                        <p
                          id="cmd-pal-more"
                          className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-fog"
                        >
                          {tPal("groupSiteMore")}
                        </p>
                        <ul className="space-y-0.5">
                          {groupedForBrowse.more.map((it) => (
                            <li key={it.href}>
                              <button
                                type="button"
                                onClick={() => go(it.href)}
                                className="flex w-full rounded-lg px-3 py-2.5 text-left text-base text-ink transition-colors hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-g"
                              >
                                {it.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
            );
          })()}
        </nav>
        <p className="border-t border-edge px-4 py-2 pb-safe text-center text-xs text-fog sm:pb-2">
          {tPal("closeHint")}
        </p>
      </div>
    </div>
  );
}
