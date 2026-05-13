/** Vire Care subscription (FEATURES.md #2) — €7.90 / month default product. */
export const CARE_BASIC_MONTHLY_CENTS = 790;

export function getCareMonthlyStripePriceId(): string | undefined {
  const v = process.env.STRIPE_PRICE_CARE_MONTHLY;
  return v && v.length > 0 ? v : undefined;
}
