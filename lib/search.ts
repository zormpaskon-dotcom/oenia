"use server";

import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SearchResult = {
  wines: { slug: string; name: string; wineryName: string; regionName: string }[];
  wineries: { slug: string; name: string; regionName: string }[];
  varieties: { slug: string; name: string }[];
};

const EMPTY: SearchResult = { wines: [], wineries: [], varieties: [] };

export async function searchSite(query: string): Promise<SearchResult> {
  const q = query.trim();
  if (q.length < 2) return EMPTY;

  const [wines, wineries, varieties] = await Promise.all([
    prisma.wine.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        OR: [{ name: { contains: q, mode: "insensitive" } }, { winery: { name: { contains: q, mode: "insensitive" } } }],
      },
      select: { slug: true, name: true, winery: { select: { name: true } }, region: { select: { name: true } } },
      orderBy: { name: "asc" },
      take: 6,
    }),
    prisma.winery.findMany({
      where: { status: ContentStatus.PUBLISHED, name: { contains: q, mode: "insensitive" } },
      select: { slug: true, name: true, region: { select: { name: true } } },
      orderBy: { name: "asc" },
      take: 5,
    }),
    prisma.variety.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
      take: 5,
    }),
  ]);

  return {
    wines: wines.map((w) => ({ slug: w.slug, name: w.name, wineryName: w.winery.name, regionName: w.region.name })),
    wineries: wineries.map((w) => ({ slug: w.slug, name: w.name, regionName: w.region.name })),
    varieties: varieties.map((v) => ({ slug: v.slug, name: v.name })),
  };
}
