import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/db/prisma";
import { getSiteUrl } from "@/lib/site/site-url";
import { computerModelSlug } from "@/lib/site/computer-model-slug";

/**
 * Public HTML routes per locale (no `/admin`, no API, no redirect-only stubs).
 * See `docs/sitemap-routes.md` for full inventory vs robots rules.
 */
const STATIC_PATHS = [
  "",
  "/palvelu",
  "/palvelu/b2b",
  "/palvelu/kiitos",
  "/itse",
  "/itse/kiitos",
  "/tuki",
  "/tietosuoja",
  "/tilaus",
  "/tietoa",
  "/tietoa/hyodyt",
  "/tietoa/galleria",
  "/tietoa/linux",
  "/tietoa/vakaus",
  "/tietoa/huolia",
  "/tietoa/sovellukset/windows",
  "/tietoa/sovellukset/mac",
  "/care",
  "/care/kiitos",
  "/koneet",
  "/vire-for-good",
  "/meista",
  "/meista/yhteiso",
] as const;

function priorityFor(path: string): number {
  if (path === "") return 1;
  if (
    path === "/palvelu" ||
    path === "/tietoa" ||
    path === "/itse" ||
    path === "/koneet"
  ) {
    return 0.9;
  }
  if (path.endsWith("/kiitos")) return 0.45;
  return 0.75;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const p of STATIC_PATHS) {
      entries.push({
        url: `${base}/${locale}${p}`,
        lastModified: new Date(),
        changeFrequency: p === "" ? "weekly" : "monthly",
        priority: priorityFor(p),
      });
    }
  }

  let guides: { slug: string; updatedAt: Date }[] = [];
  try {
    guides = await prisma.guide.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    /* Docker image build and other no-DB contexts: ship static URLs only */
  }

  for (const locale of routing.locales) {
    for (const g of guides) {
      entries.push({
        url: `${base}/${locale}/itse/${g.slug}`,
        lastModified: g.updatedAt,
        changeFrequency: "monthly",
        priority: 0.65,
      });
    }
  }

  try {
    const models = await prisma.computerModel.findMany({
      select: { make: true, model: true, updatedAt: true },
    });
    for (const locale of routing.locales) {
      for (const m of models) {
        const slug = computerModelSlug(m.make, m.model);
        entries.push({
          url: `${base}/${locale}/koneet/${slug}`,
          lastModified: m.updatedAt,
          changeFrequency: "monthly",
          priority: 0.55,
        });
      }
    }
  } catch {
    /* no DB */
  }

  return entries;
}
