const STORAGE_KEY = "sparkki-palette-recent-v1";
const MAX = 6;

export function readRecentRoutes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

/** Remember locale-free path + optional hash (e.g. `/palvelu#palvelu-tilaa`). Skips `/admin`. */
export function recordRecentRoute(pathWithOptionalHash: string): void {
  if (typeof window === "undefined") return;
  const p = pathWithOptionalHash.trim() || "/";
  if (p.startsWith("/admin")) return;
  try {
    let list = readRecentRoutes().filter((x) => x !== p);
    list.unshift(p);
    list = list.slice(0, MAX);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* private mode / quota */
  }
}
