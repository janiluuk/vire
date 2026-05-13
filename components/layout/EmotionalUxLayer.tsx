"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { SPARKKI_BG_NAV_EVENT } from "@/lib/site/background-nav";

/**
 * Phase 10 — ambient marketing-shell polish: soft sheen + header glow tied to nav
 * (same events as BackgroundCanvas). Skipped when reduced motion is preferred.
 */
export function EmotionalUxLayer() {
  const pathname = usePathname();
  const skipPathBumpRef = useRef(true);
  const energyRef = useRef(0);
  const rafRef = useRef(0);

  const pulseGlow = useCallback(() => {
    if (typeof document === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    let e = energyRef.current;
    e = Math.min(1, e + 0.38);
    energyRef.current = e;
    root.style.setProperty("--spark-nav-glow", String(e));

    const decay = () => {
      e *= 0.9;
      energyRef.current = e;
      if (e < 0.028) {
        energyRef.current = 0;
        root.style.setProperty("--spark-nav-glow", "0");
        rafRef.current = 0;
        return;
      }
      root.style.setProperty("--spark-nav-glow", String(e));
      rafRef.current = requestAnimationFrame(decay);
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(decay);
  }, []);

  useEffect(() => {
    if (skipPathBumpRef.current) {
      skipPathBumpRef.current = false;
      return;
    }
    pulseGlow();
  }, [pathname, pulseGlow]);

  useEffect(() => {
    const onNav = () => pulseGlow();
    window.addEventListener(SPARKKI_BG_NAV_EVENT, onNav);
    window.addEventListener("hashchange", onNav);
    return () => {
      window.removeEventListener(SPARKKI_BG_NAV_EVENT, onNav);
      window.removeEventListener("hashchange", onNav);
      cancelAnimationFrame(rafRef.current);
      document.documentElement.style.removeProperty("--spark-nav-glow");
    };
  }, [pulseGlow]);

  return (
    <div
      className="sparkki-ambient-sheen pointer-events-none fixed inset-0 z-[1]"
      aria-hidden
    />
  );
}
