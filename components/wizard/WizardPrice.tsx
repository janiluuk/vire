/** Shared price typography inside the order wizard. */

const VARIANT_CLASS = {
  card: "mt-3 font-display text-xl font-extrabold tabular-nums leading-none tracking-tight text-ink",
  addon: "mt-2 block font-display text-base font-bold tabular-nums leading-snug text-ink",
  line: "mt-2 block font-display text-base font-bold tabular-nums leading-snug text-ink",
  total:
    "font-display text-3xl font-extrabold tabular-nums leading-none tracking-tight text-ink",
} as const;

export type WizardPriceVariant = keyof typeof VARIANT_CLASS;

export function formatWizardPriceEuro(
  cents: number,
  options?: { prefix?: "+" | ""; decimals?: 0 | 2 },
): string {
  const euros = cents / 100;
  const amount =
    options?.decimals === 2
      ? euros.toFixed(2).replace(".", ",")
      : String(Math.round(euros));
  return `${options?.prefix ?? ""}${amount} €`;
}

type WizardPriceProps = {
  variant?: WizardPriceVariant;
  /** Price in EUR cents — preferred for computed amounts. */
  cents?: number;
  /** Preformatted label (e.g. from i18n: `12,90 €/kk`). */
  text?: string;
  prefix?: "+" | "";
  decimals?: 0 | 2;
  className?: string;
};

export function WizardPrice({
  variant = "card",
  cents,
  text,
  prefix = "",
  decimals = 0,
  className = "",
}: WizardPriceProps) {
  const display =
    text ??
    (cents != null ? formatWizardPriceEuro(cents, { prefix, decimals }) : null);
  if (display == null) return null;

  return (
    <span className={`${VARIANT_CLASS[variant]} ${className}`.trim()}>
      {display}
    </span>
  );
}
