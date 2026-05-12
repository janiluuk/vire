import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

const STATIC_PATHS = ["", "/palvelu", "/itse", "/sovellukset", "/tuki", "/info", "/about", "/yhteiso"] as const;

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

  const guides = await prisma.guide.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

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

  return entries;
}
