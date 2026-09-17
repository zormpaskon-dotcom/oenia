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

const RESULT_LIMITS = { wines: 6, wineries: 5, regions: 5, varieties: 6 };

// Αφαιρεί τόνους/διαλυτικά μέσω Unicode NFD decomposition (χωρίς library,
// χωρίς DB extension) — ώστε "ασυρ"/"σαντορινη" να βρίσκουν "Ασύρτικο"/
// "Σαντορίνη". Η Postgres `contains` δεν κάνει accent folding χωρίς
// extension (π.χ. unaccent) ή νέο schema field, οπότε το κάνουμε σε JS.
function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function includesFold(haystack: string, foldedQuery: string): boolean {
  return fold(haystack).includes(foldedQuery);
}

/** Ταξινόμηση: ακριβής αντιστοιχία πρώτα, μετά "ξεκινάει με", μετά απλή
 * περιεχόμενη αντιστοιχία, με αλφαβητικό tie-break — ίδια λογική και για τα
 * 4 groups ώστε η αναζήτηση "Chardonnay" να δείχνει πρώτα την ίδια την
 * ποικιλία, όχι τυχαία ένα κρασί που απλώς την αναφέρει. Η σύγκριση γίνεται
 * σε folded strings ώστε ένα query χωρίς τόνο να μετράει σωστά ως "ξεκινάει
 * με" — το tie-break παραμένει στα αρχικά ονόματα για σωστή ελληνική σειρά. */
function rank(name: string, foldedQuery: string): number {
  const n = fold(name);
  if (n === foldedQuery) return 0;
  if (n.startsWith(foldedQuery)) return 1;
  return 2;
}

function sortByRank<T>(items: T[], foldedQuery: string, getName: (item: T) => string): T[] {
  return [...items].sort((a, b) => {
    const ra = rank(getName(a), foldedQuery);
    const rb = rank(getName(b), foldedQuery);
    if (ra !== rb) return ra - rb;
    return getName(a).localeCompare(getName(b), "el");
  });
}

export async function searchSite(query: string): Promise<SearchResult> {
  const raw = query.trim();
  if (raw.length < 2) return EMPTY;
  const q = fold(raw);

  // Accent/case-insensitive matching δεν καλύπτεται από την Postgres
  // `contains` χωρίς extension ή νέο field — και τα δύο εκτός scope εδώ. Τα
  // 4 datasets είναι μικρά (≤400 γραμμές το καθένα σήμερα), οπότε φέρνουμε
  // το ήδη status-filtered, bounded σύνολο μία φορά και κάνουμε το πραγματικό
  // matching/ranking σε JS, πριν κόψουμε στα ίδια όρια αποτελεσμάτων με πριν.
  const [wines, wineries, regions, varieties] = await Promise.all([
    prisma.wine.findMany({
      where: { status: ContentStatus.PUBLISHED },
      select: {
        slug: true,
        name: true,
        winery: { select: { name: true } },
        region: { select: { name: true } },
        varieties: { select: { variety: { select: { name: true } } } },
      },
    }),
    prisma.winery.findMany({
      where: { status: ContentStatus.PUBLISHED },
      select: { slug: true, name: true, region: { select: { name: true, macroRegion: true } } },
    }),
    prisma.region.findMany({
      select: { slug: true, name: true, macroRegion: true },
    }),
    prisma.variety.findMany({
      select: { slug: true, name: true, nameLatin: true, type: true, originRegion: true },
    }),
  ]);

  // Wine: name, winery name, ή όνομα οποιασδήποτε ποικιλίας μέσω της
  // πραγματικής σχέσης VarietyOnWine — όχι μόνο αν η λέξη τύχει να είναι
  // και στο όνομα του ίδιου του κρασιού.
  const matchedWines = wines.filter(
    (w) =>
      includesFold(w.name, q) ||
      includesFold(w.winery.name, q) ||
      w.varieties.some((vow) => includesFold(vow.variety.name, q))
  );
  // Winery: name ή το όνομα της region του — ώστε "Σαντορίνη" να βρίσκει και
  // τα wineries που εδρεύουν εκεί, όχι μόνο την ίδια την περιοχή.
  const matchedWineries = wineries.filter((w) => includesFold(w.name, q) || includesFold(w.region.name, q));
  const matchedRegions = regions.filter((r) => includesFold(r.name, q));
  // Variety: name, nameLatin, ή originRegion — ίδια κάλυψη με το δικό του
  // list filter στο /poikilies, ώστε να μη διαφέρει τι θεωρείται "searchable".
  const matchedVarieties = varieties.filter(
    (v) =>
      includesFold(v.name, q) ||
      (v.nameLatin && includesFold(v.nameLatin, q)) ||
      (v.originRegion && includesFold(v.originRegion, q))
  );

  return {
    wines: sortByRank(
      matchedWines.map((w) => ({ slug: w.slug, name: w.name, wineryName: w.winery.name, regionName: w.region.name })),
      q,
      (w) => w.name
    ).slice(0, RESULT_LIMITS.wines),
    wineries: sortByRank(
      matchedWineries.map((w) => ({
        slug: w.slug,
        name: w.name,
        regionName: w.region.name,
        macroRegionLabel: MACRO_REGION_LABEL[w.region.macroRegion] ?? w.region.macroRegion,
      })),
      q,
      (w) => w.name
    ).slice(0, RESULT_LIMITS.wineries),
    regions: sortByRank(
      matchedRegions.map((r) => ({
        slug: r.slug,
        name: r.name,
        macroRegionLabel: MACRO_REGION_LABEL[r.macroRegion] ?? r.macroRegion,
      })),
      q,
      (r) => r.name
    ).slice(0, RESULT_LIMITS.regions),
    varieties: sortByRank(
      matchedVarieties.map((v) => ({
        slug: v.slug,
        name: v.name,
        typeLabel: v.type === VarietyType.WHITE ? "Λευκή ποικιλία" : "Κόκκινη ποικιλία",
        originRegion: v.originRegion,
      })),
      q,
      (v) => v.name
    ).slice(0, RESULT_LIMITS.varieties),
  };
}
