"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { usePathname } from "@/i18n/navigation";

function primaryRouteSegment(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[0] ?? "";
}

/**
 * Phase 4 — lightweight route enter motion (CSS `sparkki-page-enter`).
 * Phase 17 — **contextual** enter (`sparkki-context-enter`) when only the
 * sub-path changes inside the same top segment (e.g. hub tabs).
 * No extra JS animation library; respects `prefers-reduced-motion` via CSS.
 */
export function LocaleMainMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const prevRef = useRef<string | null>(null);

  const prev = prevRef.current;
  let enterKind: "page" | "context" = "page";
  if (prev !== null && prev !== pathname) {
    const a = primaryRouteSegment(prev);
    const b = primaryRouteSegment(pathname);
    enterKind = a !== "" && a === b ? "context" : "page";
  }
  prevRef.current = pathname;

  const motionClass =
    enterKind === "context" ? "sparkki-context-enter" : "sparkki-page-enter";

  return (
    <div key={pathname} className={`${motionClass} flex min-h-0 flex-1 flex-col`}>
      {children}
    </div>
  );
}
