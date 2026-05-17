/** Focus the most relevant control when entering a wizard step. */
export function focusWizardStepContent(step: number, root: HTMLElement | null) {
  if (!root) return;

  const region = root.querySelector<HTMLElement>(`#wizard-step-${step}-region`);
  if (!region) return;

  const selectors = [
    "#wiz-computer",
    "#wiz-contact",
    "#wiz-year",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "h3",
    "button:not([disabled])",
  ];

  for (const sel of selectors) {
    const el = region.querySelector<HTMLElement>(sel);
    if (!el) continue;
    if (el.tagName === "H3") {
      el.tabIndex = -1;
    }
    if (el.offsetParent !== null || el === document.activeElement) {
      el.focus({ preventScroll: false });
      return;
    }
  }
}
