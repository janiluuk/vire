"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Phase 4 — lightweight route enter motion (CSS `sparkki-page-enter`).
 * No extra JS animation library; respects `prefers-reduced-motion` via CSS.
 */
export function LocaleMainMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="sparkki-page-enter flex min-h-0 flex-1 flex-col">
      {children}
    </div>
  );
}
