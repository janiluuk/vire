"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "@/i18n/navigation";

/** Prefetch an App Router path once (e.g. on CTA hover/focus). */
export function usePrefetchRoute(path: string) {
  const router = useRouter();
  const doneRef = useRef(false);

  return useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    router.prefetch(path);
  }, [router, path]);
}

/** Spread on links/buttons that should warm a route before navigation. */
export function usePrefetchRouteHandlers(path: string) {
  const prefetch = usePrefetchRoute(path);
  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  } as const;
}
