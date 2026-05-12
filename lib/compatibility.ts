export type CompatibilityStatus = "compatible" | "borderline" | "incompatible";

export type DbVerdictInput = {
  compatible: boolean | null;
  verdict: string | null;
} | null;

export type CompatibilityResult = {
  status: CompatibilityStatus;
  reasons: string[];
  speedGainEstimate: string;
};

/**
 * Pure function: no I/O. Callers pass DB verdict when known.
 * `diskType` hints from user wizard; `ramGb` optional.
 */
export function checkCompatibility(
  make: string,
  model: string,
  ramGb?: number | null,
  diskType?: "hdd" | "ssd" | "unknown" | null,
  dbVerdict?: DbVerdictInput,
): CompatibilityResult {
  const reasons: string[] = [];
  const m = `${make} ${model}`.toLowerCase();

  if (dbVerdict?.compatible === true && dbVerdict.verdict) {
    return {
      status: "compatible",
      reasons: [dbVerdict.verdict],
      speedGainEstimate: "3–8×",
    };
  }
  if (dbVerdict?.compatible === false && dbVerdict.verdict) {
    return {
      status: "incompatible",
      reasons: [dbVerdict.verdict],
      speedGainEstimate: "—",
    };
  }

  if (!make.trim() || !model.trim()) {
    return {
      status: "borderline",
      reasons: ["missing_make_or_model"],
      speedGainEstimate: "?",
    };
  }

  // Heuristic fallback when no DB row
  if (diskType === "ssd") {
    reasons.push("already_ssd");
    return {
      status: "borderline",
      reasons,
      speedGainEstimate: "1.2–1.8×",
    };
  }

  if (ramGb != null && ramGb < 4) {
    reasons.push("low_ram");
  }

  if (/(chromebook|surface go|atom)/i.test(m)) {
    return {
      status: "borderline",
      reasons: [...reasons, "limited_hardware_class"],
      speedGainEstimate: "1.5–2.5×",
    };
  }

  if (diskType === "hdd" || diskType === "unknown" || diskType == null) {
    reasons.push("ssd_upgrade_strongly_recommended");
    return {
      status: "compatible",
      reasons,
      speedGainEstimate: "3–10×",
    };
  }

  return {
    status: "compatible",
    reasons: ["generic_ok"],
    speedGainEstimate: "3–8×",
  };
}
