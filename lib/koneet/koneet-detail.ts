import type { ComputerModel } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { computerModelSlug } from "@/lib/site/computer-model-slug";

/** Default post-SSD boot time shown when admin has not set `estimatedBootSec`. */
export const DEFAULT_BOOT_AFTER_SSD_SEC = 14;

export function bootTimeLabel(
  seconds: number | null | undefined,
  locale: "fi" | "en",
): string | null {
  if (seconds == null || seconds <= 0) return null;
  return locale === "en"
    ? `~${seconds} s after SSD upgrade`
    : `~${seconds} s SSD-päivityksen jälkeen`;
}

export function compatibilityBadgeKey(
  compatible: boolean | null,
): "compatYes" | "compatNo" | "compatUnknown" {
  if (compatible === true) return "compatYes";
  if (compatible === false) return "compatNo";
  return "compatUnknown";
}

export function buildKoneetDetailDescription(
  m: Pick<
    ComputerModel,
    "make" | "model" | "compatible" | "verdict" | "ssdSlot" | "recommendedSsd"
  >,
  locale: "fi" | "en",
): string {
  const name = `${m.make} ${m.model}`.trim();
  if (locale === "en") {
    const verdict =
      m.verdict?.trim() ||
      (m.compatible === true
        ? "Sparkki has verified compatibility for upgrades."
        : m.compatible === false
          ? "Not recommended for our standard upgrade path."
          : "Compatibility review in progress.");
    const parts = [
      `Sparkki verified ${name}.`,
      verdict,
      m.ssdSlot ? `SSD slot: ${m.ssdSlot}.` : null,
      m.recommendedSsd ? `Recommended SSD: ${m.recommendedSsd}.` : null,
    ];
    return parts.filter(Boolean).join(" ");
  }
  const verdict =
    m.verdict?.trim() ||
    (m.compatible === true
      ? "Sparkki on tarkistanut yhteensopivuuden päivitykselle."
      : m.compatible === false
        ? "Ei suositella tavalliseen SSD-palveluun."
        : "Yhteensopivuustarkistus kesken.");
  const parts = [
    `Sparkki on tarkistanut ${name}:n.`,
    verdict,
    m.ssdSlot ? `SSD-paikka: ${m.ssdSlot}.` : null,
    m.recommendedSsd ? `Suositeltu SSD: ${m.recommendedSsd}.` : null,
  ];
  return parts.filter(Boolean).join(" ");
}

export async function incrementComputerModelView(id: string): Promise<void> {
  try {
    await prisma.computerModel.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    /* non-blocking */
  }
}

export async function findRelatedComputerModels(
  current: Pick<ComputerModel, "id" | "make" | "model">,
  limit = 4,
): Promise<ComputerModel[]> {
  const make = current.make.trim();
  if (!make) return [];

  const rows = await prisma.computerModel.findMany({
    where: {
      id: { not: current.id },
      make: { equals: make, mode: "insensitive" },
      status: { in: ["APPROVED", "IN_REVIEW", "REJECTED"] },
    },
    orderBy: [{ compatible: "desc" }, { updatedAt: "desc" }],
    take: limit + 4,
  });

  return rows
    .filter((r) => computerModelSlug(r.make, r.model) !== computerModelSlug(current.make, current.model))
    .slice(0, limit);
}
