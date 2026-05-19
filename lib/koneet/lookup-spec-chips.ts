import type { ComputerLookupResult } from "@/lib/orders/computer-lookup";
import type { CompatTone } from "@/lib/koneet/compat-visual";

export type LookupSpecChip = {
  id: string;
  icon: string;
  label: string;
  value: string;
  tone: CompatTone;
};

export type LookupSpecChipLabels = {
  specsRowYears: string;
  specsRowMaxRam: string;
  specsRowSsdSlot: string;
  specsRowCpu: string;
  specsRowRam: string;
  specsRowStorage: string;
  specsRowGpu: string;
  specsRowDisplay: string;
  specsRowWeight: string;
  specsSpeedGain: string;
};

function chip(
  id: string,
  icon: string,
  label: string,
  value: string,
  tone: CompatTone = "neutral",
): LookupSpecChip {
  return { id, icon, label, value, tone };
}

export function buildLookupSpecChips(
  lookup: ComputerLookupResult,
  labels: LookupSpecChipLabels,
  selectedMatchId: string | null,
): LookupSpecChip[] {
  const chips: LookupSpecChip[] = [];
  const primary =
    lookup.matches.find((m) => m.id === selectedMatchId) ?? lookup.matches[0];

  if (primary?.yearFrom != null || primary?.yearTo != null) {
    chips.push(
      chip(
        "years",
        "◎",
        labels.specsRowYears,
        `${primary.yearFrom ?? "—"} – ${primary.yearTo ?? "—"}`,
      ),
    );
  }

  if (primary?.maxRamGb != null) {
    chips.push(
      chip("maxRam", "◫", labels.specsRowMaxRam, `${primary.maxRamGb} GB`, "accent"),
    );
  }

  const ssdSlot = primary?.ssdSlot ?? lookup.discovered?.ssdSlot ?? null;
  if (ssdSlot) {
    chips.push(chip("ssd", "⊕", labels.specsRowSsdSlot, ssdSlot, "accent"));
  }

  const ref = lookup.reference;
  if (ref?.cpu) chips.push(chip("cpu", "⚡", labels.specsRowCpu, ref.cpu));
  if (ref?.ram) chips.push(chip("ram", "◫", labels.specsRowRam, ref.ram));
  if (ref?.storage) {
    chips.push(chip("storage", "▣", labels.specsRowStorage, ref.storage));
  }
  if (ref?.gpu) chips.push(chip("gpu", "◇", labels.specsRowGpu, ref.gpu));
  if (ref?.display) {
    chips.push(chip("display", "▭", labels.specsRowDisplay, ref.display));
  }
  if (ref?.weight) chips.push(chip("weight", "⚖", labels.specsRowWeight, ref.weight));

  if (
    lookup.compatibility?.speedGainEstimate &&
    lookup.compatibility.speedGainEstimate !== "—"
  ) {
    chips.push(
      chip(
        "speed",
        "↑",
        labels.specsSpeedGain,
        lookup.compatibility.speedGainEstimate,
        "accent",
      ),
    );
  }

  if (!primary?.maxRamGb && lookup.discovered?.maxRamGb != null) {
    chips.push(
      chip(
        "maxRamDisc",
        "◫",
        labels.specsRowMaxRam,
        `${lookup.discovered.maxRamGb} GB`,
        "amber",
      ),
    );
  }

  return chips;
}
