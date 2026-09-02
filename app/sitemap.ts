import type { MetadataRoute } from "next";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

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
  ];

  return [...staticEntries, ...dynamicEntries];
}
