export const VIRE_BG_NAV_EVENT = "vire-bg-navigate";

export type VireBgNavDetail = { strength?: number };

export function dispatchBackgroundNavInteraction(
  detail: VireBgNavDetail = {},
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<VireBgNavDetail>(VIRE_BG_NAV_EVENT, {
      bubbles: true,
      detail,
    }),
  );
}
