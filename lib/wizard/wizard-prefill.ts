/** Query params for pre-filling `/tilaa` from the home compatibility checker. */

export const WIZARD_PREFILL_COMPUTER = "computer";
export const WIZARD_PREFILL_MATCH = "match";
export const WIZARD_PREFILL_YEAR = "year";
export const WIZARD_PREFILL_STEP = "step";

export type WizardPrefill = {
  computer: string;
  matchId?: string | null;
  year?: number | null;
  /** Wizard step index (0 = computer, 1 = tier + delivery, 2 = support & add-ons, …). */
  step?: number | null;
};

export function buildWizardPrefillQuery(prefill: WizardPrefill): string {
  const params = new URLSearchParams();
  params.set(WIZARD_PREFILL_COMPUTER, prefill.computer.trim());
  if (prefill.matchId) {
    params.set(WIZARD_PREFILL_MATCH, prefill.matchId);
  }
  if (prefill.year != null && !Number.isNaN(prefill.year)) {
    params.set(WIZARD_PREFILL_YEAR, String(prefill.year));
  }
  if (prefill.step != null && prefill.step > 0) {
    params.set(WIZARD_PREFILL_STEP, String(prefill.step));
  }
  return params.toString();
}

export function parseWizardPrefill(
  searchParams: URLSearchParams,
): WizardPrefill | null {
  const computer = searchParams.get(WIZARD_PREFILL_COMPUTER)?.trim();
  if (!computer || computer.length < 3) return null;
  const matchId = searchParams.get(WIZARD_PREFILL_MATCH);
  const yearRaw = searchParams.get(WIZARD_PREFILL_YEAR);
  const stepRaw = searchParams.get(WIZARD_PREFILL_STEP);
  const year = yearRaw != null ? Number(yearRaw) : null;
  const step = stepRaw != null ? Number(stepRaw) : null;
  return {
    computer,
    matchId: matchId || null,
    year: year != null && !Number.isNaN(year) ? year : null,
    step: step != null && !Number.isNaN(step) ? step : null,
  };
}
