"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ComputerLookupResult } from "@/lib/orders/computer-lookup";
import {
  buildComputerSpecRows,
  canProceedFromComputerStep,
  computerStepNeedsYear,
} from "@/lib/wizard/computer-spec-rows";
import { buildWizardPrefillQuery } from "@/lib/wizard/wizard-prefill";
import { COMPUTER_LOOKUP_DEBOUNCE_MS } from "@/lib/wizard/computer-lookup-client";
import { ORDER_WIZARD_PATH } from "@/lib/site/order-wizard-path";
import { usePrefetchRouteHandlers } from "@/lib/site/route-prefetch";
import { ComputerLookupSpecsSkeleton } from "@/components/wizard/ComputerLookupSpecsSkeleton";
import { KONEET_SECTION_ID } from "@/components/koneet/koneet-section-id";

type Props = {
  locale: string;
  initialDescription?: string;
};

export function HomeCompatibilityChecker({
  locale,
  initialDescription = "",
}: Props) {
  const t = useTranslations("koneet");
  const w = useTranslations("palvelu.wizard");
  const router = useRouter();
  const orderPrefetch = usePrefetchRouteHandlers(ORDER_WIZARD_PATH);

  const [description, setDescription] = useState(initialDescription);
  const [lookup, setLookup] = useState<ComputerLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const trimmed = description.trim();
  const loc = locale === "en" ? "en" : "fi";

  useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription]);

  useEffect(() => {
    if (trimmed.length < 3) {
      setLookup(null);
      return;
    }
    const ac = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      void fetch("/api/public/computer-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: trimmed,
          locale: loc,
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
          if (data.ok && data.result) setLookup(data.result);
          else setLookup(null);
        })
        .catch(() => {
          if (!ac.signal.aborted) setLookup(null);
        })
        .finally(() => {
          if (!ac.signal.aborted) setLoading(false);
        });
    }, COMPUTER_LOOKUP_DEBOUNCE_MS);
    return () => {
      ac.abort();
      window.clearTimeout(timer);
    };
  }, [trimmed, loc, selectedYear, selectedMatchId]);

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

  const showYearPicker = computerStepNeedsYear(lookup);
  const noVerifiedMatch =
    trimmed.length >= 3 && !loading && lookup != null && lookup.matches.length === 0;
  const canContinue = canProceedFromComputerStep(
    description,
    lookup,
    selectedYear,
    selectedMatchId,
  );

  function goToOrder() {
    if (!canContinue) return;
    const query = buildWizardPrefillQuery({
      computer: trimmed,
      matchId: selectedMatchId,
      year: selectedYear,
      step: 1,
    });
    router.push(`${ORDER_WIZARD_PATH}?${query}`);
  }

  return (
    <section
      id={KONEET_SECTION_ID}
      aria-labelledby="home-compat-title"
      className="scroll-mt-28"
      data-testid="home-compatibility-checker"
    >
      <header>
        <h2
          id="home-compat-title"
          className="font-display text-3xl font-extrabold tracking-section text-ink"
        >
          {t("title")}
        </h2>
        <p className="mt-4 max-w-3xl text-lg font-light leading-relaxed text-fog">
          {t("homeIntro")}
        </p>
      </header>

      <div className="mt-8 space-y-4">
        <label htmlFor="home-compat-computer" className="block font-semibold text-ink">
          {w("computerLabel")}
        </label>
        <textarea
          id="home-compat-computer"
          rows={3}
          className="sparkki-input w-full resize-y rounded-lg border border-em bg-sunken px-4 py-3 text-lg font-light text-ink placeholder:text-dust"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setSelectedMatchId(null);
            setSelectedYear(null);
          }}
          placeholder={w("computerPlaceholder")}
          maxLength={2000}
        />
        <p className="text-base font-light leading-relaxed text-fog">
          {w("computerHint")}
        </p>
      </div>

      {loading && trimmed.length >= 3 ? (
        <ComputerLookupSpecsSkeleton className="mt-6" />
      ) : null}

      {!loading && lookup && lookup.matches.length > 1 ? (
        <div className="mt-6 space-y-2">
          <p className="text-sm font-semibold text-ink">{w("specsPickModel")}</p>
          <ul className="space-y-2" role="listbox" aria-label={w("specsPickModel")}>
            {lookup.matches.slice(0, 8).map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedMatchId === m.id}
                  onClick={() => setSelectedMatchId(m.id)}
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
        <div className="mt-6 space-y-2">
          <label htmlFor="home-compat-year" className="block text-sm font-semibold text-ink">
            {w("specsYearLabel")}
          </label>
          <select
            id="home-compat-year"
            className="sparkki-input min-h-tap w-full max-w-xs rounded-lg border border-em bg-sunken px-4 text-ink"
            value={selectedYear ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedYear(v ? Number(v) : null);
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
        <div className="mt-6 overflow-x-auto rounded-xl border border-edge">
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
      ) : null}

      {noVerifiedMatch ? (
        <p
          className="mt-4 rounded-lg border border-amber/30 bg-amber/[0.06] px-4 py-3 text-sm text-ink"
          role="status"
          data-testid="home-no-match-notice"
        >
          {t("homeNoMatchSupport")}
        </p>
      ) : null}

      {!loading && lookup?.webSpecs?.summary ? (
        <div
          className="mt-4 rounded-lg border border-edge bg-sunken/40 px-4 py-3 text-sm text-ink"
          data-testid="home-web-specs-hint"
        >
          <p className="font-semibold text-fog">{t("homeWebSpecsLabel")}</p>
          <p className="mt-2 whitespace-pre-wrap font-light leading-relaxed">
            {lookup.webSpecs.summary}
          </p>
          {lookup.webSpecs.specUrl ? (
            <p className="mt-2">
              <a
                href={lookup.webSpecs.specUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-g underline-offset-2 hover:underline"
              >
                {t("homeWebSpecsLink")}
              </a>
            </p>
          ) : null}
        </div>
      ) : null}

      {!loading && lookup?.compatibility ? (
        <p className="mt-4 rounded-lg border border-g/25 bg-g/[0.06] px-4 py-3 text-sm text-ink">
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

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {noVerifiedMatch ? (
          <a
            href={`mailto:${t("homeSupportEmail")}`}
            className="min-h-tap rounded-lg border border-em px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-g hover:text-g focus-visible:outline focus-visible:outline-2 focus-visible:outline-g"
            data-testid="home-contact-support"
          >
            {t("homeContactSupport")}
          </a>
        ) : null}
        <button
          type="button"
          className="min-h-tap rounded-lg bg-g px-6 py-3 text-sm font-semibold text-canvas hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canContinue}
          onClick={goToOrder}
          {...orderPrefetch}
        >
          {t("homeContinueCta")}
        </button>
      </div>
    </section>
  );
}
