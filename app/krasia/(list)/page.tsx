import type { Metadata } from "next";
import Link from "next/link";
import { ContentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import WineCard from "@/components/WineCard";
import WineFilterDrawer from "@/components/WineFilterDrawer";
import SortSelect from "@/components/SortSelect";
import Pagination from "@/components/Pagination";
import { SITE_URL } from "@/lib/site";
import { facetSeo } from "@/lib/facet-seo";
import {
  COLOR_ENUM,
  COLOR_LABELS,
  COLOR_SLUG_BY_ENUM,
  PAGE_SIZE,
  STYLE_ENUM,
  STYLE_LABELS,
  STYLE_SLUG_BY_ENUM,
  hrefFor,
  hrefForPage,
  toList,
  toggleValue,
  type FilterState,
} from "../filters";

const TITLE = "Όλες οι ετικέτες | Oenia";
const DESCRIPTION = "Εξερεύνησε ελληνικές ετικέτες κρασιού με φίλτρα ανά χρώμα, περιοχή, ποικιλία, οινοποιείο και στυλ.";

type SearchParams = { [key: string]: string | string[] | undefined };

// SEO FIX PASS 2: "color" και "style" είναι χαμηλής πληθικότητας (4/4 τιμές),
// γνήσιες discovery κατηγορίες ("Λευκά", "Γλυκά" κρασιά) — μένουν αυτόνομα
// indexable ΜΟΝΟ όταν είναι το ΜΟΝΟ ενεργό query param. "region"/"variety"/
// "winery" έχουν ήδη το δικό τους canonical hub (/perioches, /poikilies,
// /oinopoieia [slug]) και υψηλή πληθικότητα (41/51/92 τιμές) — δεν μένουν
// indexable εδώ. sort/page/search είναι πάντα utility. Κάθε συνδυασμός
// (2+ params) παίρνει noindex+canonical στην καθαρή βάση — βλ. lib/facet-seo.ts.
const MEANINGFUL_FILTER_KEYS = ["color", "style"] as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const key of ["color", "region", "variety", "winery", "style", "sort", "page"]) {
    const value = sp[key];
    if (typeof value === "string" && value) params.set(key, value);
  }
  const qs = params.toString();
  const { indexable } = facetSeo([...params.keys()], MEANINGFUL_FILTER_KEYS);
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/krasia${indexable && qs ? `?${qs}` : ""}` },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
  };
}

const ORDER_BY: Record<string, Prisma.WineOrderByWithRelationInput | undefined> = {
  featured: undefined,
  rating: { avgRating: "desc" },
  reviews: { reviewCount: "desc" },
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
};

export default async function KrasiaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const rawPage = sp.page ? Number(sp.page) : 1;

  const state: FilterState = {
    color: toList(sp.color),
    region: toList(sp.region),
    variety: toList(sp.variety),
    winery: toList(sp.winery),
    style: typeof sp.style === "string" ? sp.style : undefined,
    sort: typeof sp.sort === "string" ? sp.sort : undefined,
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
  };
  // Χωρίς το page — χρησιμοποιείται στα hrefFor() των φίλτρων, που σκόπιμα
  // δεν πρέπει ποτέ να το γράφουν (κάθε αλλαγή filter γυρνάει σε σελίδα 1).
  const linkState: Omit<FilterState, "page"> = {
    color: state.color,
    region: state.region,
    variety: state.variety,
    winery: state.winery,
    style: state.style,
    sort: state.sort,
  };

  const wineWhere: Prisma.WineWhereInput = {
    status: ContentStatus.PUBLISHED,
    ...(state.color.length
      ? { color: { in: state.color.map((c) => COLOR_ENUM[c]).filter(Boolean) } }
      : {}),
    ...(state.region.length ? { region: { slug: { in: state.region } } } : {}),
    ...(state.variety.length
      ? { varieties: { some: { variety: { slug: { in: state.variety } } } } }
      : {}),
    ...(state.winery.length ? { winery: { slug: { in: state.winery } } } : {}),
    ...(state.style && STYLE_ENUM[state.style] ? { style: STYLE_ENUM[state.style] } : {}),
  };

  const orderBy = ORDER_BY[state.sort ?? "featured"] ?? ORDER_BY.featured;

  const [colorGroups, styleGroups, regions, varieties, wineries, totalCount] = await Promise.all([
    prisma.wine.groupBy({
      by: ["color"],
      where: { status: ContentStatus.PUBLISHED },
      _count: { _all: true },
    }),
    prisma.wine.groupBy({
      by: ["style"],
      where: { status: ContentStatus.PUBLISHED },
      _count: { _all: true },
    }),
    prisma.region.findMany({
      where: { wines: { some: { status: ContentStatus.PUBLISHED } } },
      select: {
        slug: true,
        name: true,
        _count: { select: { wines: { where: { status: ContentStatus.PUBLISHED } } } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.variety.findMany({
      where: { wines: { some: { wine: { status: ContentStatus.PUBLISHED } } } },
      select: {
        slug: true,
        name: true,
        _count: { select: { wines: { where: { wine: { status: ContentStatus.PUBLISHED } } } } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.winery.findMany({
      where: { wines: { some: { status: ContentStatus.PUBLISHED } } },
      select: {
        slug: true,
        name: true,
        _count: { select: { wines: { where: { status: ContentStatus.PUBLISHED } } } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.wine.count({ where: wineWhere }),
  ]);

  // clamp πρέπει να ξέρει το total πριν ζητήσουμε τη σελίδα των κρασιών, γι'
  // αυτό αυτό το query τρέχει ξεχωριστά, μετά το Promise.all παραπάνω.
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, state.page), pageCount);

  const paginatedWines = await prisma.wine.findMany({
    where: wineWhere,
    orderBy,
    take: PAGE_SIZE,
    skip: (currentPage - 1) * PAGE_SIZE,
    include: {
      winery: { select: { name: true, slug: true } },
      region: { select: { name: true, slug: true } },
      varieties: { include: { variety: { select: { name: true } } } },
    },
  });

  const colorOptions = colorGroups.map((g) => {
    const slug = COLOR_SLUG_BY_ENUM[g.color];
    return {
      value: slug,
      label: COLOR_LABELS[slug] ?? slug,
      count: g._count._all,
      active: state.color.includes(slug),
      href: hrefFor({ ...linkState, color: toggleValue(state.color, slug) }),
    };
  });

  const styleOptions = styleGroups.map((g) => {
    const slug = STYLE_SLUG_BY_ENUM[g.style];
    return {
      value: slug,
      label: STYLE_LABELS[slug] ?? slug,
      count: g._count._all,
      active: state.style === slug,
      href: hrefFor({ ...linkState, style: state.style === slug ? undefined : slug }),
    };
  });

  const regionOptions = regions.map((r) => ({
    value: r.slug,
    label: r.name,
    count: r._count.wines,
    active: state.region.includes(r.slug),
    href: hrefFor({ ...linkState, region: toggleValue(state.region, r.slug) }),
  }));

  const varietyOptions = varieties.map((v) => ({
    value: v.slug,
    label: v.name,
    count: v._count.wines,
    active: state.variety.includes(v.slug),
    href: hrefFor({ ...linkState, variety: toggleValue(state.variety, v.slug) }),
  }));

  const wineryOptions = wineries.map((w) => ({
    value: w.slug,
    label: w.name,
    count: w._count.wines,
    active: state.winery.includes(w.slug),
    href: hrefFor({ ...linkState, winery: toggleValue(state.winery, w.slug) }),
  }));

  const hasActiveFilters =
    state.color.length > 0 ||
    state.region.length > 0 ||
    state.variety.length > 0 ||
    state.winery.length > 0 ||
    !!state.style;

  const clearHref = state.sort ? `/krasia?sort=${state.sort}` : "/krasia";

  const activeChips: { label: string; href: string }[] = [
    ...state.color.map((c) => ({
      label: COLOR_LABELS[c] ?? c,
      href: hrefFor({ ...linkState, color: toggleValue(state.color, c) }),
    })),
    ...state.region.map((r) => ({
      label: regions.find((rg) => rg.slug === r)?.name ?? r,
      href: hrefFor({ ...linkState, region: toggleValue(state.region, r) }),
    })),
    ...state.variety.map((v) => ({
      label: varieties.find((vv) => vv.slug === v)?.name ?? v,
      href: hrefFor({ ...linkState, variety: toggleValue(state.variety, v) }),
    })),
    ...state.winery.map((w) => ({
      label: wineries.find((ww) => ww.slug === w)?.name ?? w,
      href: hrefFor({ ...linkState, winery: toggleValue(state.winery, w) }),
    })),
    ...(state.style
      ? [{ label: STYLE_LABELS[state.style] ?? state.style, href: hrefFor({ ...linkState, style: undefined }) }]
      : []),
  ];

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <>
      <div className="wrap-wide krasia-intro">
        <p className="kicker">ΕΞΕΡΕΥΝΗΣΗ</p>
        <h1>Όλες οι ετικέτες</h1>
        <p className="result-count">{totalCount} ετικέτες</p>
      </div>

      <div className="wrap-wide krasia-toolbar">
        <WineFilterDrawer
          colorOptions={colorOptions}
          regionOptions={regionOptions}
          varietyOptions={varietyOptions}
          wineryOptions={wineryOptions}
          styleOptions={styleOptions}
          clearHref={clearHref}
          hasActiveFilters={hasActiveFilters}
          resultsCount={totalCount}
        />
        <SortSelect current={state.sort ?? "featured"} />
      </div>

      {activeChips.length > 0 && (
        <div className="wrap-wide active-chips krasia-chips">
          {activeChips.map((chip) => (
            <span className="active-chip" key={chip.label}>
              {chip.label}
              <Link href={chip.href} aria-label="Αφαίρεση φίλτρου">
                ×
              </Link>
            </span>
          ))}
          <Link href={clearHref} className="krasia-chips-clear">
            Καθαρισμός
          </Link>
        </div>
      )}

      <div className="wrap-wide">
        {paginatedWines.length === 0 ? (
          <div className="krasia-empty">
            <p>Δεν βρέθηκαν ετικέτες</p>
            <Link href={clearHref} className="link-arrow">
              Καθαρισμός φίλτρων
            </Link>
          </div>
        ) : (
          <div className="wine-grid">
            {paginatedWines.map((wine) => (
              <WineCard key={wine.id} wine={wine} />
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
        />
      </div>
    </>
  );
}
