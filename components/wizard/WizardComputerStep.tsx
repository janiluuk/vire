"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { ComputerLookupResult } from "@/lib/orders/computer-lookup";
import {
  buildComputerSpecRows,
  computerStepNeedsYear,
} from "@/lib/wizard/computer-spec-rows";
import { COMPUTER_LOOKUP_DEBOUNCE_MS } from "@/lib/wizard/computer-lookup-client";
import { ComputerLookupSpecsSkeleton } from "@/components/wizard/ComputerLookupSpecsSkeleton";

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

  const showYearPicker = useMemo(
    () => computerStepNeedsYear(lookup),
    [lookup],
  );

  const specLabels = useMemo(
    () => ({
      specsRowModel: w("specsRowModel"),
      specsRowYears: w("specsRowYears"),
      specsRowSsdSlot: w("specsRowSsdSlot"),
      specsRowMaxRam: w("specsRowMaxRam"),
      specsRowVerdict: w("specsRowVerdict"),
      specsRowCpu: w("specsRowCpu"),
      specsRowRam: w("specsRowRam"),
      specsRowStorage: w("specsRowStorage"),
      specsRowGpu: w("specsRowGpu"),
      specsRowDisplay: w("specsRowDisplay"),
      specsRowWeight: w("specsRowWeight"),
    }),
    [w],
  );

  const tableRows = useMemo(
    () => buildComputerSpecRows(lookup, specLabels, selectedMatchId),
    [lookup, specLabels, selectedMatchId],
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
      </div>

      {loading && trimmed.length >= 3 ? (
        <ComputerLookupSpecsSkeleton className="mt-4" />
      ) : null}

      {!loading && lookup && lookup.matches.length > 1 ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-ink">{w("specsPickModel")}</p>
          <ul className="space-y-2" role="listbox" aria-label={w("specsPickModel")}>
            {lookup.matches.slice(0, 8).map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedMatchId === m.id}
                  onClick={() => onSelectedMatchIdChange(m.id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    selectedMatchId === m.id
                      ? "border-g bg-g/[0.08]"
                      : "border-edge bg-card hover:border-em"
                  }`}
                >
                  <span className="font-semibold text-ink">
                    {m.make} {m.model}
                  </span>
                  {(m.yearFrom != null || m.yearTo != null) && (
                    <span className="mt-1 block font-mono text-xs text-fog">
                      {m.yearFrom ?? "—"} – {m.yearTo ?? "—"}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!loading && showYearPicker ? (
        <div className="space-y-2">
          <label htmlFor="wiz-year" className="block text-sm font-semibold text-ink">
            {w("specsYearLabel")}
          </label>
          <select
            id="wiz-year"
            className="sparkki-input min-h-tap w-full max-w-xs rounded-lg border border-em bg-sunken px-4 text-ink"
            value={selectedYear ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              onSelectedYearChange(v ? Number(v) : null);
            }}
          >
            <option value="">{w("specsYearPlaceholder")}</option>
            {lookup?.yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <p className="text-sm text-fog">{w("specsYearHint")}</p>
        </div>
      ) : null}

      {!loading && tableRows.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-edge">
          <table className="w-full min-w-[280px] border-collapse text-left text-sm">
            <caption className="sr-only">{w("specsTableCaption")}</caption>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.label} className="border-b border-edge last:border-0">
                  <th
                    scope="row"
                    className="w-[38%] bg-sunken/60 px-4 py-3 font-semibold text-ink"
                  >
                    {row.label}
                  </th>
                  <td className="px-4 py-3 text-ink">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : trimmed.length >= 3 && !loading ? (
        <p className="text-sm text-fog">{w("specsNoMatch")}</p>
      ) : null}

      {!loading && lookup?.compatibility ? (
        <p className="rounded-lg border border-g/25 bg-g/[0.06] px-4 py-3 text-sm text-ink">
          <span className="font-semibold">{w("specsCompatLabel")}: </span>
          {noVerifiedMatch
            ? w("compatStatus_potentially_good")
            : w(
                `compatStatus_${lookup.compatibility.status}` as "compatStatus_compatible",
              )}
          {!noVerifiedMatch &&
          lookup.compatibility.speedGainEstimate !== "—" ? (
            <span className="text-fog">
              {" "}
              · {w("specsSpeedGain")}: {lookup.compatibility.speedGainEstimate}
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
