"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ComputerLookupResult } from "@/lib/orders/computer-lookup";
import { canProceedFromComputerStep } from "@/lib/wizard/computer-spec-rows";
import { ComputerLookupResults } from "@/components/koneet/ComputerLookupResults";
import { buildWizardPrefillQuery } from "@/lib/wizard/wizard-prefill";
import { COMPUTER_LOOKUP_DEBOUNCE_MS } from "@/lib/wizard/computer-lookup-client";
import { ORDER_WIZARD_PATH } from "@/lib/site/order-wizard-path";
import { usePrefetchRouteHandlers } from "@/lib/site/route-prefetch";
import { ComputerLookupSpecsSkeleton } from "@/components/wizard/ComputerLookupSpecsSkeleton";
import { KONEET_SECTION_ID } from "@/components/koneet/koneet-section-id";
import { ComputerPhotoAttach } from "@/components/koneet/ComputerPhotoAttach";

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
      lookupImageAlt: t("lookupImageAlt"),
      lookupCategoryFallback: t("lookupCategoryFallback"),
    }),
    [w, t],
  );

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
      className="sparkki-card scroll-mt-28 p-6 sm:p-8 lg:p-10"
      data-testid="home-compatibility-checker"
    >
      <header>
        <p className="sparkki-eyebrow">{t("homeCompatEyebrow")}</p>
        <h2
          id="home-compat-title"
          className="font-display text-3xl font-extrabold tracking-section text-ink md:text-4xl"
        >
          {t("homeCompatTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-base font-light leading-relaxed text-fog sm:text-lg">
          {t("homeCompatIntro")}
        </p>
      </header>

      <div className="mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
        {/* ── left: input ── */}
        <div className="space-y-4">
          <label htmlFor="home-compat-computer" className="block font-semibold text-ink">
            {w("computerLabel")}
          </label>
          <textarea
            id="home-compat-computer"
            rows={3}
            className="sparkki-input w-full resize-y rounded-lg border border-em bg-sunken px-4 py-3 text-lg font-light text-ink placeholder:text-dust lg:rows-4"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setSelectedMatchId(null);
              setSelectedYear(null);
            }}
            placeholder={w("computerPlaceholder")}
            maxLength={2000}
          />
          <p className="text-sm font-light leading-relaxed text-fog">
            {w("computerHint")}
          </p>
          <ComputerPhotoAttach
            locale={locale}
            disabled={loading}
            onApplyDescription={(text) => {
              setDescription(text);
              setSelectedMatchId(null);
              setSelectedYear(null);
            }}
          />
        </div>

        {/* ── right: results + CTA ── */}
        <div className="mt-6 lg:mt-0">
          {loading && trimmed.length >= 3 ? (
            <ComputerLookupSpecsSkeleton />
          ) : null}

          {!loading && lookup ? (
            <ComputerLookupResults
              lookup={lookup}
              selectedMatchId={selectedMatchId}
              onSelectMatch={setSelectedMatchId}
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
              loading={loading}
              noVerifiedMatch={noVerifiedMatch}
              labels={lookupLabels}
              webSpecsLabel={t("homeWebSpecsLabel")}
              webSpecsLinkLabel={t("homeWebSpecsLink")}
              homeNoMatchSupport={t("homeNoMatchSupport")}
            />
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
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
        </div>
      </div>
    </section>
  );
}
