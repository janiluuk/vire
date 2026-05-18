/** Protects `/api/cron/*` — set `CRON_SECRET` in production and send `Authorization: Bearer <secret>`. */
export function verifyCronRequest(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization")?.trim();
  return auth === `Bearer ${secret}`;
}
