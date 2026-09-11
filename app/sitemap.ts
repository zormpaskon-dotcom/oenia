import type { MetadataRoute } from "next";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { FOOD_PROFILES } from "@/lib/pairing-engine/foodProfiles";

// Τα 8 category slugs προκύπτουν απευθείας από το FOOD_PROFILES (ίδιο
// single source of truth με τα dish pages) — καμία επιπλέον DB query,
// καμία πιθανότητα να μπει umbrella/test-only/duplicate URL, αφού αυτά
// δομικά δεν υπάρχουν στο FOOD_PROFILES.
const FOOD_CATEGORY_SLUGS = [...new Set(FOOD_PROFILES.map((d) => d.categorySlug))];

const STATIC_ROUTES = [
  "",
  "/krasia",
  "/oinopoieia",
  "/poikilies",
  "/perioches",
  "/arthra",
  "/chartis",
  "/tairiasma",
  "/sygkrisi",
  "/diavatirio",
  "/pos-leitourgoume",
  "/gia-oinopoieia",
  "/politiki-aporritou",
  "/oroi-xrisis",
  "/politiki-moderation",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [wines, wineries, varieties, regions, articles] = await Promise.all([
    prisma.wine.findMany({ where: { status: ContentStatus.PUBLISHED }, select: { slug: true, updatedAt: true } }),
    prisma.winery.findMany({ where: { status: ContentStatus.PUBLISHED }, select: { slug: true, updatedAt: true } }),
    prisma.variety.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.region.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.article.findMany({
      where: { status: ContentStatus.PUBLISHED, publishedAt: { not: null } },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...wines.map((w) => ({ url: `${SITE_URL}/krasia/${w.slug}`, lastModified: w.updatedAt, priority: 0.8 })),
    ...wineries.map((w) => ({ url: `${SITE_URL}/oinopoieia/${w.slug}`, lastModified: w.updatedAt, priority: 0.7 })),
    ...varieties.map((v) => ({ url: `${SITE_URL}/poikilies/${v.slug}`, lastModified: v.updatedAt, priority: 0.6 })),
    ...regions.map((r) => ({ url: `${SITE_URL}/perioches/${r.slug}`, lastModified: r.updatedAt, priority: 0.6 })),
    ...articles.map((a) => ({ url: `${SITE_URL}/arthra/${a.slug}`, lastModified: a.updatedAt, priority: 0.5 })),
    ...FOOD_CATEGORY_SLUGS.map((slug) => ({ url: `${SITE_URL}/tairiasma/${slug}`, priority: 0.6 })),
    ...FOOD_PROFILES.map((d) => ({ url: `${SITE_URL}/tairiasma/${d.slug}`, priority: 0.6 })),
  ];

  return [...staticEntries, ...dynamicEntries];
}
