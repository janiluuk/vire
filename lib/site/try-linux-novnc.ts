/**
 * Public URLs for browser try-Linux (noVNC behind infra/try-linux proxy).
 * Set NEXT_PUBLIC_TRY_LINUX_PROXY_BASE (no trailing slash), e.g. http://127.0.0.1:8080
 * Optional NEXT_PUBLIC_TRY_LINUX_ACCESS_TOKEN — same value as proxy TRY_LINUX_ACCESS_TOKEN; appended as ?access_token=
 */
function withAccessToken(url: string, token: string | undefined): string {
  const t = token?.trim();
  if (!t) return url;
  const u = new URL(url);
  u.searchParams.set("access_token", t);
  return u.toString();
}

export function tryLinuxNovncUrls():
  | { mint: string; fedora: string }
  | null {
  const base = process.env.NEXT_PUBLIC_TRY_LINUX_PROXY_BASE?.replace(/\/$/, "");
  if (!base) return null;
  const token = process.env.NEXT_PUBLIC_TRY_LINUX_ACCESS_TOKEN;
  return {
    mint: withAccessToken(`${base}/try/mint/vnc_lite.html`, token),
    fedora: withAccessToken(`${base}/try/fedora/vnc_lite.html`, token),
  };
}
