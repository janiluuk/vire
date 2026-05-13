/**
 * Primary hub links shared by header, mobile sheet, and command palette (Phase 5 IA).
 * Keep hrefs and active-path rules in one place to avoid drift.
 */
export type MainNavCluster =
  | "palvelu"
  | "tietoa"
  | "itse"
  | "meista"
  | "tuki";

export type MainNavItem = {
  href: string;
  /** `nav` namespace key */
  labelKey: "service" | "infoHub" | "diy" | "aboutHub" | "support";
  cluster: MainNavCluster;
};

export const MAIN_NAV_ITEMS: readonly MainNavItem[] = [
  { href: "/palvelu", labelKey: "service", cluster: "palvelu" },
  { href: "/tietoa", labelKey: "infoHub", cluster: "tietoa" },
  { href: "/itse", labelKey: "diy", cluster: "itse" },
  { href: "/meista", labelKey: "aboutHub", cluster: "meista" },
  { href: "/tuki", labelKey: "support", cluster: "tuki" },
] as const;

export function isMainNavClusterActive(
  cluster: MainNavCluster,
  pathname: string,
): boolean {
  switch (cluster) {
    case "palvelu":
      return (
        pathname.startsWith("/palvelu") ||
        pathname.startsWith("/care") ||
        pathname.startsWith("/koneet") ||
        pathname.startsWith("/tilaus")
      );
    case "tietoa":
      return (
        pathname === "/tietoa" ||
        pathname.startsWith("/tietoa/") ||
        pathname === "/info" ||
        pathname.startsWith("/info/") ||
        pathname === "/sovellukset" ||
        pathname.startsWith("/sovellukset/")
      );
    case "itse":
      return pathname === "/itse" || pathname.startsWith("/itse/");
    case "meista":
      return (
        pathname === "/about" ||
        pathname.startsWith("/about/") ||
        pathname === "/meista" ||
        pathname.startsWith("/meista/") ||
        pathname === "/yhteiso" ||
        pathname.startsWith("/yhteiso/")
      );
    case "tuki":
      return pathname === "/tuki" || pathname.startsWith("/tuki/");
    default:
      return false;
  }
}
