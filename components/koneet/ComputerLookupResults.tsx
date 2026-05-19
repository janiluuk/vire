"use client";

import { useMemo, useState } from "react";
import type { ComputerLookupResult } from "@/lib/orders/computer-lookup";
import {
  compatVisualForStatus,
  matchCompatTone,
} from "@/lib/koneet/compat-visual";
import { laptopCategoryVisual } from "@/lib/koneet/laptop-category-visual";
import {
  buildLookupSpecChips,
  type LookupSpecChipLabels,
} from "@/lib/koneet/lookup-spec-chips";
import { computerStepNeedsYear } from "@/lib/wizard/computer-spec-rows";

type Props = {
  lookup: ComputerLookupResult;
  selectedMatchId: string | null;
  onSelectMatch: (id: string) => void;
  selectedYear: number | null;
  onSelectYear: (year: number | null) => void;
  loading: boolean;
  noVerifiedMatch: boolean;
  labels: LookupSpecChipLabels & {
    specsPickModel: string;
    specsYearLabel: string;
    specsYearPlaceholder: string;
    specsYearHint: string;
    specsCompatLabel: string;
    specsTableCaption: string;
    compatStatus_compatible: string;
    compatStatus_potentially_good: string;
    compatStatus_borderline: string;
    compatStatus_incompatible: string;
    lookupImageAlt: string;
    lookupCategoryFallback: string;
  };
  webSpecsLabel?: string;
  webSpecsLinkLabel?: string;
  homeNoMatchSupport?: string;
};

function toneBorder(tone: string) {
  if (tone === "accent") return "border-g/35";
  if (tone === "danger") return "border-danger/35";
  if (tone === "amber") return "border-amber/35";
  return "border-edge";
}

function LookupImage({
  imageUrl,
  alt,
  fallbackIcon,
  fallbackTone,
}: {
  imageUrl: string | null | undefined;
  alt: string;
  fallbackIcon: string;
  fallbackTone: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(imageUrl?.trim()) && !failed;

  if (showPhoto) {
    return (
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-edge bg-sunken sm:size-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl!}
          alt={alt}
          className="size-full object-cover object-center"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex size-24 shrink-0 items-center justify-center rounded-xl border bg-canvas/80 font-display text-4xl sm:size-28 ${toneBorder(fallbackTone)}`}
      aria-hidden
    >
      {fallbackIcon}
    </div>
  );
}

export function ComputerLookupResults({
  lookup,
  selectedMatchId,
  onSelectMatch,
  selectedYear,
  onSelectYear,
  loading,
  noVerifiedMatch,
  labels,
  webSpecsLabel,
  webSpecsLinkLabel,
  homeNoMatchSupport,
}: Props) {
  const primary =
    lookup.matches.find((m) => m.id === selectedMatchId) ?? lookup.matches[0];

  const displayMake = primary?.make ?? lookup.coerced.make;
  const displayModel = primary?.model ?? lookup.coerced.model;

  const compatStatus = noVerifiedMatch
    ? "potentially_good"
    : (lookup.compatibility?.status ?? "borderline");

  const compatLabel =
    labels[
      `compatStatus_${compatStatus}` as keyof Pick<
        Props["labels"],
        | "compatStatus_compatible"
        | "compatStatus_potentially_good"
        | "compatStatus_borderline"
        | "compatStatus_incompatible"
      >
    ];

  const compatVisual = compatVisualForStatus(compatStatus);
  const categoryVisual = laptopCategoryVisual(lookup.category, displayMake);

  const chips = useMemo(
    () => buildLookupSpecChips(lookup, labels, selectedMatchId),
    [lookup, labels, selectedMatchId],
  );

  const showYearPicker = computerStepNeedsYear(lookup);
  const heroImageUrl =
    lookup.imageUrl ?? primary?.imageUrl ?? lookup.webSpecs?.imageUrl ?? null;

  return (
    <>
      {!loading && lookup.matches.length > 1 ? (
        <div className="mt-6 space-y-2">
          <p className="text-sm font-semibold text-ink">{labels.specsPickModel}</p>
          <ul className="space-y-2" role="listbox" aria-label={labels.specsPickModel}>
            {lookup.matches.slice(0, 8).map((m) => {
              const tone = matchCompatTone(m.compatible);
              const dotClass =
                tone === "accent"
                  ? "bg-g"
                  : tone === "danger"
                    ? "bg-danger"
                    : "bg-amber";
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedMatchId === m.id}
                    onClick={() => onSelectMatch(m.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition-colors sm:px-4 ${
                      selectedMatchId === m.id
                        ? "border-g bg-g/[0.08]"
                        : "border-edge bg-card hover:border-em"
                    }`}
                  >
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${dotClass}`}
                      aria-hidden
                    />
                    {m.imageUrl ? (
                      <span className="relative size-10 shrink-0 overflow-hidden rounded-md border border-edge bg-sunken">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.imageUrl}
                          alt=""
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      </span>
                    ) : (
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-md border border-edge bg-sunken/80 text-lg text-g"
                        aria-hidden
                      >
                        ▤
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">
                        {m.make} {m.model}
                      </span>
                      {(m.yearFrom != null || m.yearTo != null) && (
                        <span className="mt-0.5 block font-mono text-xs text-fog">
                          {m.yearFrom ?? "—"} – {m.yearTo ?? "—"}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {!loading && showYearPicker ? (
        <div className="mt-6 space-y-2">
          <label htmlFor="lookup-compat-year" className="block text-sm font-semibold text-ink">
            {labels.specsYearLabel}
          </label>
          <select
            id="lookup-compat-year"
            className="sparkki-input min-h-tap w-full max-w-xs rounded-lg border border-em bg-sunken px-4 text-ink"
            value={selectedYear ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              onSelectYear(v ? Number(v) : null);
            }}
          >
            <option value="">{labels.specsYearPlaceholder}</option>
            {lookup.yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <p className="text-sm text-fog">{labels.specsYearHint}</p>
        </div>
      ) : null}

      {!loading &&
      (chips.length > 0 || primary || lookup.reference?.summary || lookup.reference?.cpu) ? (
        <article
          className="mt-6 overflow-hidden rounded-xl border border-edge bg-card/60"
          aria-label={labels.specsTableCaption}
          data-testid="computer-lookup-visual"
        >
          <div className="flex flex-col gap-5 border-b border-edge p-5 sm:flex-row sm:items-start sm:p-6">
            <LookupImage
              imageUrl={heroImageUrl}
              alt={labels.lookupImageAlt.replace("{model}", `${displayMake} ${displayModel}`.trim())}
              fallbackIcon={categoryVisual.icon}
              fallbackTone={categoryVisual.tone}
            />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-start gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wide ${compatVisual.pillClass}`}
                >
                  <span aria-hidden>{compatVisual.icon}</span>
                  {compatLabel}
                </span>
                {lookup.category ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-edge bg-sunken/60 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-fog">
                    {lookup.category}
                  </span>
                ) : null}
              </div>
              <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
                {displayMake} {displayModel}
              </h3>
              {primary?.verdict ? (
                <p className="text-sm font-light leading-relaxed text-fog">{primary.verdict}</p>
              ) : null}
            </div>
          </div>

          {chips.length > 0 ? (
            <ul className="grid gap-2 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
              {chips.map((c) => (
                <li key={c.id}>
                  <SpecChip chip={c} />
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ) : null}

      {noVerifiedMatch && homeNoMatchSupport ? (
        <p
          className="mt-4 rounded-lg border border-amber/30 bg-amber/[0.06] px-4 py-3 text-sm text-ink"
          role="status"
          data-testid="home-no-match-notice"
        >
          {homeNoMatchSupport}
        </p>
      ) : null}

      {!loading &&
      lookup.webSpecs &&
      (lookup.webSpecs.summary || lookup.webSpecs.specUrl) ? (
        <div className="mt-4 rounded-lg border border-edge bg-sunken/40 px-4 py-3 text-sm text-ink" data-testid="home-web-specs-hint">
          {webSpecsLabel ? (
            <p className="font-semibold text-fog">{webSpecsLabel}</p>
          ) : null}
          {lookup.webSpecs.summary ? (
            <p className="mt-2 whitespace-pre-wrap font-light leading-relaxed">
              {lookup.webSpecs.summary}
            </p>
          ) : null}
          {lookup.webSpecs.specUrl && webSpecsLinkLabel ? (
            <p className="mt-2">
              <a
                href={lookup.webSpecs.specUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-g underline-offset-2 hover:underline"
              >
                {webSpecsLinkLabel}
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function SpecChip({ chip }: { chip: { icon: string; label: string; value: string; tone: string } }) {
  const chipSurface =
    chip.tone === "accent"
      ? "border-g/30 bg-g/[0.06]"
      : chip.tone === "danger"
        ? "border-danger/30 bg-danger/[0.06]"
        : chip.tone === "amber"
          ? "border-amber/30 bg-amber/[0.06]"
          : "border-edge bg-card/70";
  return (
    <div className={`flex gap-3 rounded-lg border px-3 py-3 ${chipSurface}`}>
      <span className="mt-0.5 shrink-0 font-display text-lg text-g" aria-hidden>
        {chip.icon}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-dust">
          {chip.label}
        </p>
        <p className="mt-1 text-sm font-medium leading-snug text-ink">{chip.value}</p>
      </div>
    </div>
  );
}

