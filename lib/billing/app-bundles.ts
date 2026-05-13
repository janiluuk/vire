/**
 * Curated software bundles at checkout (Phase 5). IDs persist on `Order.appBundles`.
 */
export const APP_BUNDLE_IDS = [
  "local_ai",
  "media_creator",
  "music_production",
  "dev_essentials",
] as const;

export type AppBundleId = (typeof APP_BUNDLE_IDS)[number];

export const APP_BUNDLE_CENTS: Record<AppBundleId, number> = {
  local_ai: 29_00,
  media_creator: 19_00,
  music_production: 19_00,
  dev_essentials: 15_00,
};

const ID_SET = new Set<string>(APP_BUNDLE_IDS);

export function isAppBundleId(id: string): id is AppBundleId {
  return ID_SET.has(id);
}

/** Dedupes and keeps catalog order. */
export function normalizeAppBundleIds(raw: string[] | undefined): AppBundleId[] {
  if (!raw?.length) return [];
  const picked = new Set<AppBundleId>();
  for (const id of APP_BUNDLE_IDS) {
    if (raw.includes(id)) picked.add(id);
  }
  return APP_BUNDLE_IDS.filter((id) => picked.has(id));
}

export function appBundlesTotalCents(ids: readonly AppBundleId[]): number {
  let sum = 0;
  for (const id of ids) sum += APP_BUNDLE_CENTS[id];
  return sum;
}
