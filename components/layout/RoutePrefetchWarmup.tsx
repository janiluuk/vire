"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

/** Order wizard first — highest-intent path; CTAs also prefetch on hover via `usePrefetchRouteHandlers`. */
const WARM_PATHS = ["/tilaa", "/", "/tietoa", "/tuki", "/itse", "/meista"] as const;

/**
 * Warm common navigations after paint (App Router RSC prefetch).
 */
export function RoutePrefetchWarmup() {
  const router = useRouter();

  useEffect(() => {
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const run = () => {
      for (const p of WARM_PATHS) router.prefetch(p);
    };

    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(run, { timeout: 2500 });
    } else {
      timeoutHandle = window.setTimeout(run, 1200) as unknown as number;
    }

    return () => {
      if (idleHandle != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle != null) window.clearTimeout(timeoutHandle);
    };
  }, [router]);

  return null;
}
