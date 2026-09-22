import type { Metadata } from "next";
import Link from "next/link";
import { ContentStatus, MacroRegion, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MACRO_REGION_LABEL } from "@/lib/labels";
import { SITE_URL } from "@/lib/site";
import { facetSeo } from "@/lib/facet-seo";
import { catalogSocialMeta } from "@/lib/catalog-seo";
import WineFilterDrawer from "@/components/WineFilterDrawer";
import ListSearchInput from "@/components/ListSearchInput";
import ListSortSelect from "@/components/ListSortSelect";
import Pagination from "@/components/Pagination";
import {
  PAGE_SIZE,
  SORT_OPTIONS,
  hrefFor,
  hrefForPage,
  isMacroRegionValue,
  toList,
  toggleValue,
  type FilterState,
} from "./filters";

const TITLE = "Οινοποιεία | Oenia";
const DESCRIPTION = "Όλα τα οινοποιεία στο Oenia, ανά περιοχή.";

type SearchParams = { [key: string]: string | string[] | undefined };

// SEO FIX PASS 2: καμία meaningful κατηγορία εδώ — "region" (41 τιμές) και
// "variety" (51 τιμές) είναι ήδη καλυμμένα από το δικό τους canonical hub
// (/perioches/[slug], /poikilies/[slug]), οπότε ένα φιλτραρισμένο
// /oinopoieia;region=... θα ήταν απλά duplicate εκείνου του περιεχομένου.
// Μόνο η καθαρή βάση (χωρίς κανένα param) μένει indexable.
const MEANINGFUL_FILTER_KEYS: readonly string[] = [];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const key of ["region", "variety", "search", "sort", "page"]) {
    const value = sp[key];
    if (typeof value === "string" && value) params.set(key, value);
  }
  const qs = params.toString();
  const { indexable } = facetSeo([...params.keys()], MEANINGFUL_FILTER_KEYS);
  const path = `/oinopoieia${indexable && qs ? `?${qs}` : ""}`;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}${path}` },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    ...catalogSocialMeta({ title: TITLE, description: DESCRIPTION, path, image: "/home/explore-wineries.jpg" }),
  };
}

const ORDER_BY: Record<string, Prisma.WineryOrderByWithRelationInput> = {
  featured: { name: "asc" },
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
  wines: { wines: { _count: "desc" } },
};

export default async function WineriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const rawPage = sp.page ? Number(sp.page) : 1;

  const state: FilterState = {
    region: toList(sp.region).filter(isMacroRegionValue),
    variety: toList(sp.variety),
    search: typeof sp.search === "string" ? sp.search : undefined,
    sort: typeof sp.sort === "string" ? sp.sort : undefined,
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
  };
  // Χωρίς το page — ίδιο σκεπτικό με το /krasia: τα hrefFor() των φίλτρων δεν
  // το γράφουν ποτέ, κάθε αλλαγή filter/search/sort γυρνάει σε σελίδα 1.
  const linkState: Omit<FilterState, "page"> = {
    region: state.region,
    variety: state.variety,
    search: state.search,
    sort: state.sort,
  };

  const wineryWhere: Prisma.WineryWhereInput = {
    status: ContentStatus.PUBLISHED,
    ...(state.region.length ? { region: { macroRegion: { in: state.region } } } : {}),
    ...(state.variety.length
      ? {
          wines: {
            some: {
              status: ContentStatus.PUBLISHED,
              varieties: { some: { variety: { slug: { in: state.variety } } } },
            },
          },
        }
      : {}),
    ...(state.search
      ? {
          OR: [
            { name: { contains: state.search, mode: "insensitive" } },
            { subRegion: { contains: state.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy = ORDER_BY[state.sort ?? "featured"] ?? ORDER_BY.featured;

  // Facet counts είναι σκόπιμα global (δεν λαμβάνουν υπόψη τα υπόλοιπα ενεργά
  // φίλτρα) — ίδια απλοποίηση με το /krasia.
  const [wineriesForRegionFacet, varieties, totalCount] = await Promise.all([
    prisma.winery.findMany({
      where: { status: ContentStatus.PUBLISHED },
      select: { region: { select: { macroRegion: true } } },
    }),
    prisma.variety.findMany({
      where: { wines: { some: { wine: { status: ContentStatus.PUBLISHED, winery: { status: ContentStatus.PUBLISHED } } } } },
      select: {
        slug: true,
        name: true,
        _count: {
          select: {
            wines: { where: { wine: { status: ContentStatus.PUBLISHED, winery: { status: ContentStatus.PUBLISHED } } } },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.winery.count({ where: wineryWhere }),
  ]);

  // clamp πρέπει να ξέρει το total πριν ζητήσουμε τη σελίδα των οινοποιείων,
  // γι' αυτό τρέχει ξεχωριστά, μετά το Promise.all παραπάνω.
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, state.page), pageCount);

  const wineries = await prisma.winery.findMany({
    where: wineryWhere,
    orderBy,
    take: PAGE_SIZE,
    skip: (currentPage - 1) * PAGE_SIZE,
    include: {
      region: { select: { name: true, macroRegion: true } },
      _count: { select: { wines: { where: { status: ContentStatus.PUBLISHED } } } },
    },
  });

  const regionCounts = new Map<MacroRegion, number>();
  for (const w of wineriesForRegionFacet) {
    const mr = w.region.macroRegion;
    regionCounts.set(mr, (regionCounts.get(mr) ?? 0) + 1);
  }

  const regionOptions = Array.from(regionCounts.entries())
    .sort((a, b) => (MACRO_REGION_LABEL[a[0]] ?? a[0]).localeCompare(MACRO_REGION_LABEL[b[0]] ?? b[0], "el"))
    .map(([mr, count]) => ({
      value: mr,
      label: MACRO_REGION_LABEL[mr] ?? mr,
      count,
      active: state.region.includes(mr),
      href: hrefFor({ ...linkState, region: toggleValue(state.region, mr) }),
    }));

  const varietyOptions = varieties.map((v) => ({
    value: v.slug,
    label: v.name,
    count: v._count.wines,
    active: state.variety.includes(v.slug),
    href: hrefFor({ ...linkState, variety: toggleValue(state.variety, v.slug) }),
  }));

  const hasActiveFilters = state.region.length > 0 || state.variety.length > 0 || !!state.search;

  // Reset γυρνάει πάντα στο καθαρό /oinopoieia — σκόπιμη διαφορά από το
  // /krasia (που κρατάει το sort όταν κάνεις clear).
  const clearHref = "/oinopoieia";

  const activeChips: { label: string; href: string }[] = [
    ...(state.search
      ? [{ label: `«${state.search}»`, href: hrefFor({ ...linkState, search: undefined }) }]
      : []),
    ...state.region.map((r) => ({
      label: MACRO_REGION_LABEL[r] ?? r,
      href: hrefFor({ ...linkState, region: toggleValue(state.region, r) }),
    })),
    ...state.variety.map((v) => ({
      label: varieties.find((vv) => vv.slug === v)?.name ?? v,
      href: hrefFor({ ...linkState, variety: toggleValue(state.variety, v) }),
    })),
  ];

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <>
      <div className="wrap-wide page-intro">
        <p className="kicker">Εξερεύνηση</p>
        <h1>Οινοποιεία</h1>
        <p className="result-count">{totalCount} οινοποιεία</p>
      </div>

      <div className="wrap-wide list-toolbar">
        <ListSearchInput
          key={state.search ?? ""}
          basePath="/oinopoieia"
          defaultValue={state.search ?? ""}
          placeholder="Αναζήτηση οινοποιείου ή περιοχής…"
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <WineFilterDrawer
            colorOptions={[]}
            regionOptions={regionOptions}
            varietyOptions={varietyOptions}
            wineryOptions={[]}
            styleOptions={[]}
            clearHref={clearHref}
            hasActiveFilters={hasActiveFilters}
            resultsCount={totalCount}
          />
          <ListSortSelect basePath="/oinopoieia" current={state.sort ?? "featured"} options={SORT_OPTIONS} />
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="wrap-wide active-chips list-chips">
          {activeChips.map((chip) => (
            <span className="active-chip" key={chip.label}>
              {chip.label}
              <Link href={chip.href} aria-label="Αφαίρεση φίλτρου">
                ×
              </Link>
            </span>
          ))}
          <Link href={clearHref} className="list-chips-clear">
            Καθαρισμός
          </Link>
        </div>
      )}

      <div className="wrap-wide">
        {wineries.length === 0 ? (
          <div className="list-empty">
            <p>Κανένα οινοποιείο δεν ταιριάζει με αυτά τα φίλτρα.</p>
            <Link href={clearHref} className="link-arrow">
              Καθαρισμός φίλτρων
            </Link>
          </div>
        ) : (
          <div className="index-grid">
            {wineries.map((w) => (
              <Link key={w.id} href={`/oinopoieia/${w.slug}`} className="index-card reveal">
                <h3>{w.name}</h3>
                <p className="meta">
                  {w.region.name}
                  {w.subRegion ? `, ${w.subRegion}` : ""}
                  {w.foundedYear ? ` · Από το ${w.foundedYear}` : ""}
                </p>
                {w.description && <p>{w.description}</p>}
                <div className="badges">
                  {w.isVerified && <span className="badge-pill">Επαληθευμένο</span>}
                  {w.isOrganic && <span className="badge-pill">Βιολογικό</span>}
                  {w.acceptsVisitors && <span className="badge-pill">Δέχεται επισκέπτες</span>}
                  <span className="badge-pill">{w._count.wines} ετικέτες</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          pageCount={pageCount}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          total={totalCount}
          hrefForPage={(p) => hrefForPage(linkState, p)}
          noun="οινοποιεία"
        />
      </div>
    </>
  );
}
