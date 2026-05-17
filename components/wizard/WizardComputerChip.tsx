"use client";

import { useTranslations } from "next-intl";

type Props = {
  description: string;
  onEdit: () => void;
};

export function WizardComputerChip({ description, onEdit }: Props) {
  const w = useTranslations("palvelu.wizard");
  const trimmed = description.trim();
  if (!trimmed) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-xl border border-edge bg-sunken/50 px-3 py-2"
      data-testid="wizard-computer-chip"
    >
      <span className="text-sm text-fog">{w("computerChipLabel")}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
        {trimmed}
      </span>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-lg border border-em px-3 py-1.5 text-xs font-semibold text-g hover:border-g focus-visible:outline focus-visible:outline-2 focus-visible:outline-g"
      >
        {w("summaryEdit")}
      </button>
    </div>
  );
}
