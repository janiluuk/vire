/** Dedicated consumer checkout route (no hash scroll). */
export const ORDER_WIZARD_PATH = "/tilaa" as const;

export const ORDER_WIZARD_HASH = "palvelu-tilaa" as const;

/** True when the app router pathname is the order wizard (locale prefix stripped by next-intl). */
export function isOrderWizardRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const normalized = pathname.replace(/\/$/, "") || "/";
  return (
    normalized === ORDER_WIZARD_PATH ||
    normalized.endsWith(ORDER_WIZARD_PATH)
  );
}
