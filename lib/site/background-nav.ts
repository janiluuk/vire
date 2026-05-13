export const SPARKKI_BG_NAV_EVENT = "sparkki-bg-navigate";

export type SparkkiBgNavDetail = { strength?: number };

export function dispatchBackgroundNavInteraction(
  detail: SparkkiBgNavDetail = {},
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<SparkkiBgNavDetail>(SPARKKI_BG_NAV_EVENT, {
      bubbles: true,
      detail,
    }),
  );
}
