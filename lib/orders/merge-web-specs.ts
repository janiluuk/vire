import type { LaptopSpecsInsight } from "@/lib/specs/laptop-specs";
import { hasStructuredSpecs } from "@/lib/specs/laptop-specs-structured";
import type {
  ComputerLookupReference,
  ComputerLookupWebSpecs,
} from "@/lib/orders/computer-lookup";

export function mergeReferenceFromWebInsight(
  reference: ComputerLookupReference | null,
  insight: LaptopSpecsInsight | null,
): ComputerLookupReference | null {
  if (!insight) return reference;
  const s = insight.specs;
  const base: ComputerLookupReference = reference ?? {
    cpu: null,
    ram: null,
    storage: null,
    gpu: null,
    display: null,
    weight: null,
    summary: null,
  };
  return {
    cpu: base.cpu ?? s.cpu,
    ram: base.ram ?? s.ram,
    storage: base.storage ?? s.storage,
    gpu: base.gpu ?? s.gpu,
    display: base.display ?? s.display,
    weight: base.weight ?? s.weight,
    summary: base.summary ?? insight.summary,
  };
}

export function webSpecsFromInsight(
  insight: LaptopSpecsInsight | null,
): ComputerLookupWebSpecs | null {
  if (!insight) return null;
  if (
    !insight.summary?.trim() &&
    !insight.specUrl?.trim() &&
    !hasStructuredSpecs(insight.specs)
  ) {
    return null;
  }
  return {
    summary: insight.summary,
    specUrl: insight.specUrl,
    specs: insight.specs,
  };
}
