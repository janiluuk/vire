import type { ComputerLookupResult } from "@/lib/orders/computer-lookup";

export type ComputerSpecRow = { label: string; value: string };

export type ComputerSpecRowLabels = {
  specsRowModel: string;
  specsRowYears: string;
  specsRowSsdSlot: string;
  specsRowMaxRam: string;
  specsRowVerdict: string;
  specsRowCpu: string;
  specsRowRam: string;
  specsRowStorage: string;
  specsRowGpu: string;
  specsRowDisplay: string;
  specsRowWeight: string;
};

export function buildComputerSpecRows(
  lookup: ComputerLookupResult | null,
  labels: ComputerSpecRowLabels,
  selectedMatchId: string | null,
): ComputerSpecRow[] {
  if (!lookup) return [];
  const rows: ComputerSpecRow[] = [];
  const primary =
    lookup.matches.find((m) => m.id === selectedMatchId) ?? lookup.matches[0];
  if (primary) {
    rows.push({
      label: labels.specsRowModel,
      value: `${primary.make} ${primary.model}`,
    });
    if (primary.yearFrom != null || primary.yearTo != null) {
      rows.push({
        label: labels.specsRowYears,
        value: `${primary.yearFrom ?? "—"} – ${primary.yearTo ?? "—"}`,
      });
    }
    if (primary.ssdSlot) {
      rows.push({ label: labels.specsRowSsdSlot, value: primary.ssdSlot });
    }
    if (primary.maxRamGb != null) {
      rows.push({
        label: labels.specsRowMaxRam,
        value: `${primary.maxRamGb} GB`,
      });
    }
    if (primary.verdict) {
      rows.push({ label: labels.specsRowVerdict, value: primary.verdict });
    }
  }
  const ref = lookup.reference;
  if (ref?.cpu) rows.push({ label: labels.specsRowCpu, value: ref.cpu });
  if (ref?.ram) rows.push({ label: labels.specsRowRam, value: ref.ram });
  if (ref?.storage) {
    rows.push({ label: labels.specsRowStorage, value: ref.storage });
  }
  if (ref?.gpu) rows.push({ label: labels.specsRowGpu, value: ref.gpu });
  if (ref?.display) {
    rows.push({ label: labels.specsRowDisplay, value: ref.display });
  }
  if (ref?.weight) {
    rows.push({ label: labels.specsRowWeight, value: ref.weight });
  }
  return rows;
}

export function computerStepNeedsYear(
  lookup: ComputerLookupResult | null,
): boolean {
  if (!lookup) return false;
  return lookup.needsYearChoice || lookup.yearOptions.length > 1;
}

export function canProceedFromComputerStep(
  description: string,
  lookup: ComputerLookupResult | null,
  selectedYear: number | null,
  selectedMatchId: string | null,
): boolean {
  const trimmed = description.trim();
  if (trimmed.length < 3) return false;
  if (computerStepNeedsYear(lookup) && selectedYear == null) return false;
  if (lookup && lookup.matches.length > 1 && selectedMatchId == null) {
    return false;
  }
  return true;
}
