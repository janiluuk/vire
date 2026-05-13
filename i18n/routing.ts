import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fi", "en"],
  defaultLocale: "fi",
  /** Without this, `Accept-Language` can send first-time visitors to `/en`. */
  localeDetection: false,
  localePrefix: "always",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  },
});
