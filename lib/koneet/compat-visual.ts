export type CompatTone = "accent" | "amber" | "danger" | "neutral";

export type CompatVisual = {
  tone: CompatTone;
  icon: string;
  pillClass: string;
  chipClass: string;
};

const TONE_CLASS: Record<CompatTone, { pill: string; chip: string }> = {
  accent: {
    pill: "border-g/40 bg-g/[0.1] text-g",
    chip: "border-g/30 bg-g/[0.06] text-ink",
  },
  amber: {
    pill: "border-amber/40 bg-amber/[0.08] text-amber",
    chip: "border-amber/30 bg-amber/[0.06] text-ink",
  },
  danger: {
    pill: "border-danger/40 bg-danger/[0.08] text-danger",
    chip: "border-danger/30 bg-danger/[0.06] text-ink",
  },
  neutral: {
    pill: "border-edge bg-sunken/60 text-fog",
    chip: "border-edge bg-card/70 text-ink",
  },
};

export function compatVisualForStatus(status: string): CompatVisual {
  switch (status) {
    case "compatible":
      return {
        tone: "accent",
        icon: "✓",
        pillClass: TONE_CLASS.accent.pill,
        chipClass: TONE_CLASS.accent.chip,
      };
    case "incompatible":
      return {
        tone: "danger",
        icon: "✕",
        pillClass: TONE_CLASS.danger.pill,
        chipClass: TONE_CLASS.danger.chip,
      };
    case "potentially_good":
      return {
        tone: "accent",
        icon: "◆",
        pillClass: TONE_CLASS.accent.pill,
        chipClass: TONE_CLASS.accent.chip,
      };
    default:
      return {
        tone: "amber",
        icon: "◇",
        pillClass: TONE_CLASS.amber.pill,
        chipClass: TONE_CLASS.amber.chip,
      };
  }
}

export function matchCompatTone(
  compatible: boolean | null | undefined,
): CompatTone {
  if (compatible === true) return "accent";
  if (compatible === false) return "danger";
  return "amber";
}
