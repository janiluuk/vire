"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { WizardLiveTotal } from "@/lib/wizard/wizard-live-total";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { formatWizardPriceEuro, WizardPrice } from "@/components/wizard/WizardPrice";

const LIVE_TOTAL_ANNOUNCE_MS = 650;

type Props = {
  live: WizardLiveTotal;
  compact?: boolean;
};

export function WizardLiveTotalBar({ live, compact = false }: Props) {
  const w = useTranslations("palvelu.wizard");

  const announceSignature = useMemo(
    () =>
      live.show
        ? `${live.complete ? "c" : "p"}:${live.totalCents}`
        : "",
    [live.show, live.complete, live.totalCents],
  );
  const debouncedSignature = useDebouncedValue(
    announceSignature,
    LIVE_TOTAL_ANNOUNCE_MS,
  );

  const srAnnouncement =
    live.show && debouncedSignature
      ? w("liveTotalSrAnnounce", {
          price: formatWizardPriceEuro(live.totalCents, { decimals: 2 }),
        })
      : "";

  if (!live.show) return null;

  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>
      <aside
        className={
          compact
            ? "shrink-0 text-right"
            : "mx-auto mt-4 flex w-full flex-wrap items-end justify-between gap-3 rounded-xl border border-g/25 bg-g/[0.06] px-4 py-3"
        }
        data-testid="wizard-live-total"
      >
        <div className={compact ? "text-right" : "min-w-0"}>
          <p
            className={
              compact
                ? "text-[10px] font-semibold uppercase tracking-wide text-fog"
                : "text-xs font-semibold uppercase tracking-wide text-fog"
            }
          >
            {w("liveTotalLabel")}
          </p>
          {!live.complete ? (
            <p className="mt-0.5 text-[11px] font-light leading-snug text-fog">
              {w("liveTotalIncomplete")}
            </p>
          ) : (
            <p className="mt-0.5 text-[11px] font-light text-fog">
              {w("liveTotalVatNote")}
            </p>
          )}
        </div>
        <WizardPrice
          variant={compact ? "card" : "total"}
          cents={live.totalCents}
          decimals={2}
          className={compact ? "text-2xl" : "shrink-0"}
        />
      </aside>
    </>
  );
}
