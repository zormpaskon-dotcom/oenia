"use server";

import { ContentStatus, VarietyType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MACRO_REGION_LABEL } from "@/lib/labels";

export type SearchResult = {
  wines: { slug: string; name: string; wineryName: string; regionName: string }[];
  wineries: { slug: string; name: string; regionName: string; macroRegionLabel: string }[];
  regions: { slug: string; name: string; macroRegionLabel: string }[];
  varieties: { slug: string; name: string; typeLabel: string; originRegion: string | null }[];
};

const EMPTY: SearchResult = { wines: [], wineries: [], regions: [], varieties: [] };

/** Ταξινόμηση: ακριβής αντιστοιχία πρώτα, μετά "ξεκινάει με", μετά απλή
 * περιεχόμενη αντιστοιχία, με αλφαβητικό tie-break — ίδια λογική και για τα
 * 4 groups ώστε η αναζήτηση "Chardonnay" να δείχνει πρώτα την ίδια την
 * ποικιλία, όχι τυχαία ένα κρασί που απλώς την αναφέρει. */
function rank(name: string, q: string): number {
  const n = name.toLowerCase();
  const query = q.toLowerCase();
  if (n === query) return 0;
  if (n.startsWith(query)) return 1;
  return 2;
}

function sortByRank<T>(items: T[], q: string, getName: (item: T) => string): T[] {
  return [...items].sort((a, b) => {
    const ra = rank(getName(a), q);
    const rb = rank(getName(b), q);
    if (ra !== rb) return ra - rb;
    return getName(a).localeCompare(getName(b), "el");
  });
}

export async function searchSite(query: string): Promise<SearchResult> {
  const q = query.trim();
  if (q.length < 2) return EMPTY;

  const [wines, wineries, regions, varieties] = await Promise.all([
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
      select: { slug: true, name: true, region: { select: { name: true, macroRegion: true } } },
      orderBy: { name: "asc" },
      take: 5,
    }),
    prisma.region.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { slug: true, name: true, macroRegion: true },
      orderBy: { name: "asc" },
      take: 5,
    }),
    prisma.variety.findMany({
      where: {
        OR: [{ name: { contains: q, mode: "insensitive" } }, { nameLatin: { contains: q, mode: "insensitive" } }],
      },
      select: { slug: true, name: true, type: true, originRegion: true },
      orderBy: { name: "asc" },
      take: 6,
    }),
  ]);

  return {
    wines: sortByRank(
      wines.map((w) => ({ slug: w.slug, name: w.name, wineryName: w.winery.name, regionName: w.region.name })),
      q,
      (w) => w.name
    ),
    wineries: sortByRank(
      wineries.map((w) => ({
        slug: w.slug,
        name: w.name,
        regionName: w.region.name,
        macroRegionLabel: MACRO_REGION_LABEL[w.region.macroRegion] ?? w.region.macroRegion,
      })),
      q,
      (w) => w.name
    ),
    regions: sortByRank(
      regions.map((r) => ({
        slug: r.slug,
        name: r.name,
        macroRegionLabel: MACRO_REGION_LABEL[r.macroRegion] ?? r.macroRegion,
      })),
      q,
      (r) => r.name
    ),
    varieties: sortByRank(
      varieties.map((v) => ({
        slug: v.slug,
        name: v.name,
        typeLabel: v.type === VarietyType.WHITE ? "Λευκή ποικιλία" : "Κόκκινη ποικιλία",
        originRegion: v.originRegion,
      })),
      q,
      (v) => v.name
    ),
  };
}
