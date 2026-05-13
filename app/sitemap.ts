import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/db/prisma";
import { getSiteUrl } from "@/lib/site/site-url";
import { computerModelSlug } from "@/lib/site/computer-model-slug";

const STATIC_PATHS = [
  "",
  "/palvelu",
  "/palvelu/b2b",
  "/itse",
  "/sovellukset",
  "/tuki",
  "/info",
  "/about",
  "/tietosuoja",
  "/tilaus",
  "/yhteiso",
  "/tietoa",
  "/tietoa/hyodyt",
  "/tietoa/linux",
  "/tietoa/vakaus",
  "/tietoa/huolia",
  "/tietoa/sovellukset/windows",
  "/tietoa/sovellukset/mac",
  "/care",
  "/care/kiitos",
  "/koneet",
  "/vire-for-good",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const p of STATIC_PATHS) {
      entries.push({
        url: `${base}/${locale}${p}`,
        lastModified: new Date(),
        changeFrequency: p === "" ? "weekly" : "monthly",
        priority: p === "" ? 1 : 0.8,
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
