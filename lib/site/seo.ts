import type { Metadata } from "next";

/** Path without locale prefix, e.g. "" for home, "/palvelu", "/itse/guide-slug". */
export function localePathAlternates(
  locale: string,
  path: string,
): Pick<Metadata, "alternates"> {
  const suffix =
    path === "" || path === "/"
      ? ""
      : path.startsWith("/")
        ? path
        : `/${path}`;
  return {
    alternates: {
      canonical: `/${locale}${suffix}`,
      languages: {
        fi: `/fi${suffix}`,
        en: `/en${suffix}`,
      },
    },
  };
}
