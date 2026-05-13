/**
 * Sparkki-prefixed environment variables with legacy **`VIRE_*`** fallbacks
 * (**Phase 23** — ops can migrate names without a flag day).
 */

export function resolveForGoodNotifyEmail(): string | undefined {
  const sparkki = process.env.SPARKKI_FOR_GOOD_NOTIFY_EMAIL?.trim();
  if (sparkki) return sparkki;
  const legacy = process.env.VIRE_FOR_GOOD_NOTIFY_EMAIL?.trim();
  if (legacy) return legacy;
  return undefined;
}
