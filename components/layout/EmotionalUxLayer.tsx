"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import {
  BG_AMBIENT_PACE_BASE,
  BG_AMBIENT_PACE_NAV_PEAK,
  BG_NAV_ENERGY_BUMP,
  BG_NAV_ENERGY_DECAY,
  BG_NAV_ENERGY_MAX,
} from "@/lib/site/background-animation";
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
    e = Math.min(BG_NAV_ENERGY_MAX, e + BG_NAV_ENERGY_BUMP);
    energyRef.current = e;
    const norm = Math.min(1, e / BG_NAV_ENERGY_MAX);
    root.style.setProperty("--spark-nav-glow", String(norm));
    const pace =
      BG_AMBIENT_PACE_BASE +
      (BG_AMBIENT_PACE_NAV_PEAK - BG_AMBIENT_PACE_BASE) * norm;
    root.style.setProperty("--spark-ambient-pace", String(pace));

    const decay = () => {
      e *= BG_NAV_ENERGY_DECAY;
      energyRef.current = e;
      if (e < 0.028) {
        energyRef.current = 0;
        root.style.setProperty("--spark-nav-glow", "0");
        root.style.setProperty(
          "--spark-ambient-pace",
          String(BG_AMBIENT_PACE_BASE),
        );
        rafRef.current = 0;
        return;
      }
      const n = Math.min(1, e / BG_NAV_ENERGY_MAX);
      root.style.setProperty("--spark-nav-glow", String(n));
      root.style.setProperty(
        "--spark-ambient-pace",
        String(
          BG_AMBIENT_PACE_BASE +
            (BG_AMBIENT_PACE_NAV_PEAK - BG_AMBIENT_PACE_BASE) * n,
        ),
      );
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
    return () => {
      window.removeEventListener(SPARKKI_BG_NAV_EVENT, onNav);
      cancelAnimationFrame(rafRef.current);
      document.documentElement.style.removeProperty("--spark-nav-glow");
      document.documentElement.style.removeProperty("--spark-ambient-pace");
    };
  }, [pulseGlow]);

  return (
    <div
      className="sparkki-ambient-sheen pointer-events-none fixed inset-0 z-[1]"
      aria-hidden
    />
  );
}
