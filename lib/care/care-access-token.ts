import crypto from "node:crypto";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function signingSecret(): string | null {
  const s =
    process.env.CARE_ACCESS_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "";
  return s.length > 0 ? s : null;
}

export function createCareAccessToken(email: string): string | null {
  const secret = signingSecret();
  if (!secret) return null;
  const payload = {
    e: email.trim().toLowerCase(),
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyCareAccessToken(
  token: string,
): { email: string } | null {
  const secret = signingSecret();
  if (!secret) return null;
  const parts = token.trim().split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64url");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as { e?: string; exp?: number };
    if (typeof parsed.e !== "string" || !parsed.e.includes("@")) return null;
    if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    return { email: parsed.e };
  } catch {
    return null;
  }
}

export function careDashboardUrl(
  locale: "fi" | "en",
  email: string,
): string | null {
  const token = createCareAccessToken(email);
  if (!token) return null;
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  if (!base) return null;
  return `${base}/${locale}/oma-sparkki?token=${encodeURIComponent(token)}`;
}
