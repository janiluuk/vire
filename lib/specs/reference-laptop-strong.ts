import type { ComputerLookupReference } from "@/lib/orders/computer-lookup";
import type { LaptopReferenceSpec } from "@prisma/client";

/** Enough catalog data to show CPU/RAM/storage without calling SearXNG/LLM. */
export function hasStrongReferenceFromFields(
  fields: Pick<LaptopReferenceSpec, "cpu" | "ram" | "storage"> | null | undefined,
): boolean {
  if (!fields) return false;
  const cpu = fields.cpu?.trim();
  const ram = fields.ram?.trim();
  const storage = fields.storage?.trim();
  return Boolean(cpu && (ram || storage));
}

export function hasStrongLookupReference(
  reference: ComputerLookupReference | null | undefined,
): boolean {
  if (!reference) return false;
  const cpu = reference.cpu?.trim();
  const ram = reference.ram?.trim();
  const storage = reference.storage?.trim();
  return Boolean(cpu && (ram || storage));
}
