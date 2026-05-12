/**
 * Public URLs for browser try-Linux (noVNC behind infra/try-linux proxy).
 * Set NEXT_PUBLIC_TRY_LINUX_PROXY_BASE (no trailing slash), e.g. http://192.168.2.100:8080
 */
export function tryLinuxNovncUrls():
  | { mint: string; fedora: string }
  | null {
  const base = process.env.NEXT_PUBLIC_TRY_LINUX_PROXY_BASE?.replace(/\/$/, "");
  if (!base) return null;
  return {
    mint: `${base}/try/mint/vnc_lite.html`,
    fedora: `${base}/try/fedora/vnc_lite.html`,
  };
}
