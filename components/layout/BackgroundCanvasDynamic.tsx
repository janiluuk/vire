"use client";

import dynamic from "next/dynamic";

/**
 * Phase 8 — defer Three.js to a separate chunk and skip SSR (decorative only).
 */
export const BackgroundCanvasDynamic = dynamic(
  () =>
    import("./BackgroundCanvas").then((mod) => ({
      default: mod.BackgroundCanvas,
    })),
  { ssr: false, loading: () => null },
);
