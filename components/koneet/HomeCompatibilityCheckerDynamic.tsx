"use client";

import dynamic from "next/dynamic";

export const HomeCompatibilityCheckerDynamic = dynamic(
  () =>
    import("./HomeCompatibilityChecker").then((mod) => ({
      default: mod.HomeCompatibilityChecker,
    })),
  { ssr: false },
);
