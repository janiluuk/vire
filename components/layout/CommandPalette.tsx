"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { MAIN_NAV_ITEMS } from "@/lib/site/main-nav";
import {
  readRecentRoutes,
  recordRecentRoute,
} from "@/lib/site/palette-recent-routes";

type PaletteEntry = {
  href: string;
  label: string;
  group: "hubs" | "service" | "more";
};

type PaletteRow =
  | { kind: "heading"; sectionKey: string; label: string }
  | { kind: "recentLink"; href: string; label: string; known: boolean }
  | { kind: "catalogLink"; href: string; label: string };

/**
 * Phase 6 — ⌘K / Ctrl+K quick jump to main public routes (no extra dependencies).
 * Phase 5 — catalog is grouped when not searching; hubs mirror `MAIN_NAV_ITEMS`.
 * Phase 18 — memoized row components + stable `go` callback for fewer list rerenders.
 * Phase 20 — ↑/↓ + Enter / Home / End; aria-activedescendant; hover syncs highlight.
 */
function labelForHref(
  href: string,
  catalog: readonly { href: string; label: string }[],
): string {
  const hit = catalog.find((i) => i.href === href);
  if (hit) return hit.label;
  return href;
}

const PALETTE_ROW_CLASS =
  "flex w-full rounded-lg px-3 py-2.5 text-left text-base text-ink transition-colors hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-g";

const PaletteCatalogRow = memo(function PaletteCatalogRow({
  href,
  label,
  onPick,
  id,
  selected,
  onHighlight,
}: {
  href: string;
  label: string;
  onPick: (h: string) => void;
  id: string;
  selected: boolean;
  onHighlight: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        id={id}
        onMouseEnter={onHighlight}
        onFocus={onHighlight}
        onClick={() => onPick(href)}
        className={`${PALETTE_ROW_CLASS}${selected ? " bg-sunken ring-1 ring-g/40" : ""}`}
      >
        {label}
      </button>
    </li>
  );
});

const PaletteRecentRow = memo(function PaletteRecentRow({
  href,
  label,
  known,
  onPick,
  id,
  selected,
  onHighlight,
}: {
  href: string;
  label: string;
  known: boolean;
  onPick: (h: string) => void;
  id: string;
  selected: boolean;
  onHighlight: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        id={id}
        onMouseEnter={onHighlight}
        onFocus={onHighlight}
        onClick={() => onPick(href)}
        className={`flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-g${selected ? " bg-sunken ring-1 ring-g/40" : ""}`}
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
});

export function CommandPalette() {
  const tNav = useTranslations("nav");
  const tPal = useTranslations("commandPalette");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
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
      { href: "/#yhteensopivuus", label: tNav("koneet"), group: "service" },
      {
        href: "/tilaa",
        label: tNav("ctaOrder"),
        group: "service",
      },
    ];
    const more: PaletteEntry[] = [
      { href: "/", label: tPal("home"), group: "more" },
      { href: "/yhteiso", label: tNav("aboutCommunity"), group: "more" },
      { href: "/tietosuoja", label: tPal("privacy"), group: "more" },
      { href: "/sparkki-for-good", label: tPal("forGood"), group: "more" },
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

  const { rows, linkCount } = useMemo(() => {
    const out: PaletteRow[] = [];
    if (searching) {
      if (catalogItems.length === 0) return { rows: out, linkCount: 0 };
      for (const it of catalogItems) {
        out.push({ kind: "catalogLink", href: it.href, label: it.label });
      }
      return { rows: out, linkCount: catalogItems.length };
    }
    if (recent.length > 0) {
      out.push({
        kind: "heading",
        sectionKey: "recent",
        label: tPal("recentHeading"),
      });
      for (const href of recent) {
        const known = paletteCatalog.some((i) => i.href === href);
        out.push({
          kind: "recentLink",
          href,
          label: labelForHref(href, paletteCatalog),
          known,
        });
      }
    }
    if (groupedForBrowse) {
      if (groupedForBrowse.hubs.length > 0) {
        out.push({
          kind: "heading",
          sectionKey: "hubs",
          label: tPal("groupMainHubs"),
        });
        for (const it of groupedForBrowse.hubs) {
          out.push({
            kind: "catalogLink",
            href: it.href,
            label: it.label,
          });
        }
      }
      if (groupedForBrowse.service.length > 0) {
        out.push({
          kind: "heading",
          sectionKey: "service",
          label: tPal("groupServiceExtra"),
        });
        for (const it of groupedForBrowse.service) {
          out.push({
            kind: "catalogLink",
            href: it.href,
            label: it.label,
          });
        }
      }
      if (groupedForBrowse.more.length > 0) {
        out.push({
          kind: "heading",
          sectionKey: "more",
          label: tPal("groupSiteMore"),
        });
        for (const it of groupedForBrowse.more) {
          out.push({
            kind: "catalogLink",
            href: it.href,
            label: it.label,
          });
        }
      }
    }
    const linkCount = out.filter(
      (r) => r.kind === "recentLink" || r.kind === "catalogLink",
    ).length;
    return { rows: out, linkCount };
  }, [
    searching,
    catalogItems,
    recent,
    groupedForBrowse,
    paletteCatalog,
    tPal,
  ]);

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
    setActiveIdx(0);
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [router, close],
  );

  useEffect(() => {
    if (open) setActiveIdx(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setActiveIdx(0);
  }, [q, open]);

  useEffect(() => {
    if (!open || linkCount === 0) return;
    setActiveIdx((i) => Math.min(i, linkCount - 1));
  }, [linkCount, open]);

  useEffect(() => {
    if (!open || linkCount === 0) return;
    document
      .getElementById(`cmd-pal-opt-${activeIdx}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, linkCount, open]);

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
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

  const onInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const n = linkCount;
      if (n === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => (i + 1) % n);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => (i - 1 + n) % n);
        return;
      }
      if (e.key === "Home") {
        e.preventDefault();
        setActiveIdx(0);
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        setActiveIdx(n - 1);
        return;
      }
      if (e.key === "Enter") {
        let walk = 0;
        for (const r of rows) {
          if (r.kind !== "recentLink" && r.kind !== "catalogLink") continue;
          if (walk === activeIdx) {
            e.preventDefault();
            go(r.href);
            return;
          }
          walk += 1;
        }
      }
    },
    [activeIdx, go, linkCount, rows],
  );

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

    function onKeyDown(e: globalThis.KeyboardEvent) {
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

  const paletteList = useMemo((): ReactNode => {
    if (rows.length === 0) return null;

    const renderLink = (
      link: Extract<PaletteRow, { kind: "recentLink" | "catalogLink" }>,
      myOpt: number,
      keyPrefix: string,
    ) => {
      const id = `cmd-pal-opt-${myOpt}`;
      const selected = activeIdx === myOpt;
      const onHighlight = () => setActiveIdx(myOpt);
      if (link.kind === "recentLink") {
        return (
          <PaletteRecentRow
            key={`${keyPrefix}:${link.href}:${myOpt}`}
            href={link.href}
            label={link.label}
            known={link.known}
            onPick={go}
            id={id}
            selected={selected}
            onHighlight={onHighlight}
          />
        );
      }
      return (
        <PaletteCatalogRow
          key={`${keyPrefix}:${link.href}:${myOpt}`}
          href={link.href}
          label={link.label}
          onPick={go}
          id={id}
          selected={selected}
          onHighlight={onHighlight}
        />
      );
    };

    if (rows[0]?.kind !== "heading") {
      let opt = 0;
      return (
        <ul className="m-0 list-none space-y-0.5 p-0">
          {rows.map((row) => {
            if (row.kind !== "catalogLink") return null;
            const node = renderLink(row, opt, "search");
            opt += 1;
            return node;
          })}
        </ul>
      );
    }

    let opt = 0;
    const blocks: ReactNode[] = [];
    let i = 0;
    while (i < rows.length) {
      const row = rows[i]!;
      if (row.kind === "heading") {
        const { sectionKey, label } = row;
        i += 1;
        const links: Extract<PaletteRow, { kind: "recentLink" | "catalogLink" }>[] =
          [];
        while (i < rows.length && rows[i]!.kind !== "heading") {
          const ln = rows[i]!;
          if (ln.kind === "recentLink" || ln.kind === "catalogLink") {
            links.push(ln);
          }
          i += 1;
        }
        const listItems = links.map((link) => {
          const myOpt = opt;
          opt += 1;
          return renderLink(link, myOpt, sectionKey);
        });
        const headingId = `cmd-pal-h-${sectionKey}`;
        blocks.push(
          <div
            key={`grp-${sectionKey}`}
            role="group"
            className="mb-2 border-b border-edge pb-2 last:mb-0 last:border-b-0 last:pb-0"
            aria-labelledby={headingId}
          >
            <p
              id={headingId}
              className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-fog"
            >
              {label}
            </p>
            <ul className="m-0 list-none space-y-0.5 p-0">{listItems}</ul>
          </div>,
        );
        continue;
      }
      i += 1;
    }

    return <>{blocks}</>;
  }, [activeIdx, go, rows]);

  if (!open) return null;

  const showEmptySearch = searching && catalogItems.length === 0;

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
            onKeyDown={onInputKeyDown}
            placeholder={tPal("searchPlaceholder")}
            role="combobox"
            aria-autocomplete="list"
            aria-controls="cmd-palette-listbox"
            aria-expanded={linkCount > 0}
            aria-activedescendant={
              linkCount > 0 ? `cmd-pal-opt-${activeIdx}` : undefined
            }
            className="sparkki-input mt-2 w-full rounded-lg border border-em bg-sunken px-3 py-2.5 text-lg text-ink placeholder:text-dust"
          />
        </div>
        <nav
          id="cmd-palette-listbox"
          aria-label={tPal("title")}
          className="max-h-[min(50vh,22rem)] overflow-y-auto p-2"
        >
          {showEmptySearch ? (
            <p className="px-3 py-6 text-center text-fog">{tPal("noResults")}</p>
          ) : (
            paletteList
          )}
        </nav>
        <p className="border-t border-edge px-4 py-2 pb-safe text-center text-xs text-fog sm:pb-2">
          {tPal("closeHint")}
        </p>
      </div>
    </div>
  );
}
