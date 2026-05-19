"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { ComputerLookupResult } from "@/lib/orders/computer-lookup";
import { COMPUTER_LOOKUP_DEBOUNCE_MS } from "@/lib/wizard/computer-lookup-client";
import { ComputerLookupSpecsSkeleton } from "@/components/wizard/ComputerLookupSpecsSkeleton";
import { ComputerPhotoAttach } from "@/components/koneet/ComputerPhotoAttach";
import { ComputerLookupResults } from "@/components/koneet/ComputerLookupResults";

type Props = {
  locale: string;
  description: string;
  onDescriptionChange: (v: string) => void;
  onBlur: () => void;
  showComputerErr: boolean;
  selectedYear: number | null;
  onSelectedYearChange: (y: number | null) => void;
  selectedMatchId: string | null;
  onSelectedMatchIdChange: (id: string | null) => void;
  onLookupChange?: (lookup: ComputerLookupResult | null) => void;
};

export function WizardComputerStep({
  locale,
  description,
  onDescriptionChange,
  onBlur,
  showComputerErr,
  selectedYear,
  onSelectedYearChange,
  selectedMatchId,
  onSelectedMatchIdChange,
  onLookupChange,
}: Props) {
  const w = useTranslations("palvelu.wizard");
  const tk = useTranslations("koneet");
  const [lookup, setLookup] = useState<ComputerLookupResult | null>(null);
  const [loading, setLoading] = useState(false);

  const trimmed = description.trim();

  useEffect(() => {
    if (trimmed.length < 3) {
      setLookup(null);
      onLookupChange?.(null);
      return;
    }
    const ac = new AbortController();
    const t = window.setTimeout(() => {
      setLoading(true);
      void fetch("/api/public/computer-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: trimmed,
          locale: locale === "en" ? "en" : "fi",
          selectedYear,
          selectedMatchId,
          includeWebSpecs: true,
        }),
        signal: ac.signal,
      })
        .then(async (res) => {
          const data = (await res.json()) as {
            ok?: boolean;
            result?: ComputerLookupResult | null;
          };
          if (data.ok && data.result) {
            setLookup(data.result);
            onLookupChange?.(data.result);
          } else {
            setLookup(null);
            onLookupChange?.(null);
          }
        })
        .catch(() => {
          if (!ac.signal.aborted) {
            setLookup(null);
            onLookupChange?.(null);
          }
        })
        .finally(() => {
          if (!ac.signal.aborted) setLoading(false);
        });
    }, COMPUTER_LOOKUP_DEBOUNCE_MS);
    return () => {
      ac.abort();
      window.clearTimeout(t);
    };
  }, [trimmed, locale, selectedYear, selectedMatchId, onLookupChange]);

  const lookupLabels = useMemo(
    () => ({
      specsRowYears: w("specsRowYears"),
      specsRowSsdSlot: w("specsRowSsdSlot"),
      specsRowMaxRam: w("specsRowMaxRam"),
      specsRowCpu: w("specsRowCpu"),
      specsRowRam: w("specsRowRam"),
      specsRowStorage: w("specsRowStorage"),
      specsRowGpu: w("specsRowGpu"),
      specsRowDisplay: w("specsRowDisplay"),
      specsRowWeight: w("specsRowWeight"),
      specsSpeedGain: w("specsSpeedGain"),
      specsPickModel: w("specsPickModel"),
      specsYearLabel: w("specsYearLabel"),
      specsYearPlaceholder: w("specsYearPlaceholder"),
      specsYearHint: w("specsYearHint"),
      specsCompatLabel: w("specsCompatLabel"),
      specsTableCaption: w("specsTableCaption"),
      compatStatus_compatible: w("compatStatus_compatible"),
      compatStatus_potentially_good: w("compatStatus_potentially_good"),
      compatStatus_borderline: w("compatStatus_borderline"),
      compatStatus_incompatible: w("compatStatus_incompatible"),
      lookupImageAlt: tk("lookupImageAlt"),
      lookupCategoryFallback: tk("lookupCategoryFallback"),
    }),
    [w, tk],
  );

  const noVerifiedMatch =
    trimmed.length >= 3 && !loading && lookup != null && lookup.matches.length === 0;

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-ink">{w("step1Title")}</h3>
      <div>
        <label htmlFor="wiz-computer" className="mb-2 block font-semibold">
          {w("computerLabel")}
        </label>
        <textarea
          id="wiz-computer"
          rows={4}
          aria-required="true"
          aria-invalid={showComputerErr}
          aria-describedby={
            ["wiz-computer-hint", showComputerErr ? "wiz-computer-err" : ""]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`sparkki-input w-full resize-y rounded-lg border bg-sunken px-4 py-3 text-ink placeholder:text-dust ${
            showComputerErr ? "border-danger" : "border-em"
          }`}
          value={description}
          onChange={(e) => {
            onDescriptionChange(e.target.value);
            onSelectedMatchIdChange(null);
            onSelectedYearChange(null);
          }}
          onBlur={onBlur}
          placeholder={w("computerPlaceholder")}
          maxLength={2000}
        />
        <p
          id="wiz-computer-hint"
          className="mt-2 text-base font-light leading-relaxed text-fog"
        >
          {w("computerHint")}
        </p>
        {showComputerErr ? (
          <p
            id="wiz-computer-err"
            role="alert"
            className="mt-2 text-base text-danger"
          >
            {w("validationComputerShort")}
          </p>
        ) : null}

        <ComputerPhotoAttach
          locale={locale}
          disabled={loading}
          onApplyDescription={(text) => {
            onDescriptionChange(text);
            onSelectedMatchIdChange(null);
            onSelectedYearChange(null);
          }}
        />
      </div>

      {loading && trimmed.length >= 3 ? (
        <ComputerLookupSpecsSkeleton className="mt-4" />
      ) : null}

      {!loading && lookup ? (
        <ComputerLookupResults
          lookup={lookup}
          selectedMatchId={selectedMatchId}
          onSelectMatch={onSelectedMatchIdChange}
          selectedYear={selectedYear}
          onSelectYear={onSelectedYearChange}
          loading={loading}
          noVerifiedMatch={noVerifiedMatch}
          labels={lookupLabels}
        />
      ) : trimmed.length >= 3 && !loading ? (
        <p className="text-sm text-fog">{w("specsNoMatch")}</p>
      ) : null}
    </div>
  );
}
