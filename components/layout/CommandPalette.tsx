"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

/**
 * Phase 6 — ⌘K / Ctrl+K quick jump to main public routes (no extra dependencies).
 */
export function CommandPalette() {
  const tNav = useTranslations("nav");
  const tPal = useTranslations("commandPalette");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () =>
      [
        { href: "/", label: tPal("home") },
        { href: "/palvelu", label: tNav("service") },
        { href: "/palvelu/b2b", label: tNav("serviceTabB2b") },
        { href: "/care", label: tNav("serviceTabCare") },
        { href: "/tilaus", label: tNav("serviceTabTrack") },
        { href: "/koneet", label: tNav("koneet") },
        { href: "/tietoa", label: tNav("infoHub") },
        { href: "/itse", label: tNav("diy") },
        { href: "/meista", label: tNav("aboutHub") },
        { href: "/yhteiso", label: tNav("aboutCommunity") },
        { href: "/tuki", label: tNav("support") },
        { href: "/tietosuoja", label: tPal("privacy") },
        { href: "/vire-for-good", label: tPal("forGood") },
        { href: "/palvelu#palvelu-tilaa", label: tNav("ctaOrder") },
      ] as const,
    [tNav, tPal],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => it.label.toLowerCase().includes(s));
  }, [items, q]);

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
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-fog">{tPal("noResults")}</p>
          ) : (
            <ul className="space-y-0.5">
              {filtered.map((it) => (
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
          )}
        </nav>
        <p className="border-t border-edge px-4 py-2 text-center text-xs text-fog">
          {tPal("closeHint")}
        </p>
      </div>
    </div>
  );
}
