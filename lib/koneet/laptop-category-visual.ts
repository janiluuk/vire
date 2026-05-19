import type { CompatTone } from "@/lib/koneet/compat-visual";

export type LaptopCategoryVisual = {
  icon: string;
  tone: CompatTone;
  /** Short label for placeholder (FI/EN caller supplies display name). */
  kind: "laptop" | "gaming" | "ultrabook" | "workstation" | "convertible" | "desktop";
};

export function laptopCategoryVisual(
  category: string | null | undefined,
  make?: string | null,
): LaptopCategoryVisual {
  const c = (category ?? "").toLowerCase();
  const m = (make ?? "").toLowerCase();

  if (/gaming|game/i.test(c)) {
    return { icon: "▣", tone: "accent", kind: "gaming" };
  }
  if (/ultra|thin|light/i.test(c)) {
    return { icon: "◇", tone: "neutral", kind: "ultrabook" };
  }
  if (/workstation|mobile workstation|creator/i.test(c)) {
    return { icon: "⬡", tone: "amber", kind: "workstation" };
  }
  if (/2-in-1|convert|detach|tablet/i.test(c)) {
    return { icon: "↻", tone: "neutral", kind: "convertible" };
  }
  if (/desktop|tower|mini pc|nuc/i.test(c) || /imac|mac mini|mac studio/i.test(m)) {
    return { icon: "▭", tone: "neutral", kind: "desktop" };
  }
  return { icon: "▤", tone: "neutral", kind: "laptop" };
}
