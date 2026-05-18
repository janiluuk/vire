"use client";

import { useTranslations } from "next-intl";
import {
  DATA_MIGRATION_LARGE_CENTS,
  DATA_MIGRATION_STANDARD_CENTS,
} from "@/lib/billing/pricing";
import { WizardPrice } from "@/components/wizard/WizardPrice";

export type DataMigrationChoice = "none" | "standard" | "large";

type Props = {
  value: DataMigrationChoice;
  onChange: (value: DataMigrationChoice) => void;
};

export function WizardDataMigration({ value, onChange }: Props) {
  const w = useTranslations("palvelu.wizard");

  return (
    <div className="rounded-2xl border border-amber/25 bg-amber/[0.07] p-5 md:p-6">
      <h3
        id="wizard-migration-title"
        className="text-xl font-semibold text-ink"
      >
        {w("migrationTitle")}
      </h3>
      <p className="mt-2 text-base font-light leading-relaxed text-fog">
        {w("migrationIntro")}
      </p>
      <details className="mt-3 rounded-xl border border-edge/80 bg-sunken/30 p-4 text-fog">
        <summary className="cursor-pointer select-none text-sm font-semibold text-ink">
          {w("migrationIncludesToggle")}
        </summary>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-[13px] font-light leading-relaxed">
          <li>{w("migrationIncludes1")}</li>
          <li>{w("migrationIncludes2")}</li>
          <li>{w("migrationIncludes3")}</li>
        </ul>
      </details>
      <div
        className="mt-5 space-y-2.5"
        role="radiogroup"
        aria-labelledby="wizard-migration-title"
      >
        {(
          [
            ["none", "migrationNo", "migrationNoDesc", 0],
            [
              "standard",
              "migrationStandard",
              "migrationStandardDesc",
              DATA_MIGRATION_STANDARD_CENTS,
            ],
            [
              "large",
              "migrationLarge",
              "migrationLargeDesc",
              DATA_MIGRATION_LARGE_CENTS,
            ],
          ] as const
        ).map(([id, titleKey, descKey, cents]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={value === id}
            onClick={() => onChange(id)}
            className={`flex w-full min-h-tap items-start gap-3 rounded-[10px] border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
              value === id
                ? "border-g bg-g/[0.05]"
                : "border-edge bg-sunken hover:border-em"
            }`}
          >
            <span
              className={`mt-1 inline-flex size-4 shrink-0 rounded-full border-2 ${
                value === id ? "border-g bg-g" : "border-em"
              }`}
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">
                {w(titleKey)}
              </span>
              <span className="mt-1 block text-[13px] font-light leading-snug text-fog">
                {w(descKey)}
              </span>
              {cents > 0 ? (
                <WizardPrice
                  variant="addon"
                  cents={cents}
                  prefix="+"
                  className="mt-1"
                />
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}