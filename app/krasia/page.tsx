import type { Metadata } from "next";
import Link from "next/link";
import { ContentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import WineCard from "@/components/WineCard";
import FilterSidebar from "@/components/FilterSidebar";
import SortSelect from "@/components/SortSelect";
import {
  COLOR_ENUM,
  COLOR_LABELS,
  COLOR_SLUG_BY_ENUM,
  PRICE_ENUM,
  PRICE_LABELS,
  hrefFor,
  toList,
  toggleValue,
  type FilterState,
} from "./filters";

export const metadata: Metadata = {
  title: "Όλες οι ετικέτες | Oenia",
  description: "Εξερεύνησε ελληνικές ετικέτες κρασιού με φίλτρα ανά χρώμα, περιοχή, ποικιλία και βαθμολογία.",
};

const ORDER_BY: Record<string, Prisma.WineOrderByWithRelationInput> = {
  popular: { reviewCount: "desc" },
  rating: { avgRating: "desc" },
  new: { createdAt: "desc" },
  name: { name: "asc" },
};

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function KrasiaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const state: FilterState = {
    color: toList(sp.color),
    region: toList(sp.region),
    variety: toList(sp.variety),
    minRating: sp.minRating ? Number(sp.minRating) : undefined,
    price: typeof sp.price === "string" ? sp.price : undefined,
    sort: typeof sp.sort === "string" ? sp.sort : undefined,
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
    ...(state.minRating ? { avgRating: { gte: state.minRating } } : {}),
    ...(state.price && PRICE_ENUM[state.price] ? { priceRange: PRICE_ENUM[state.price] } : {}),
  };

  const orderBy = ORDER_BY[state.sort ?? "popular"] ?? ORDER_BY.popular;

  const [colorGroups, regions, varieties, wines] = await Promise.all([
    prisma.wine.groupBy({
      by: ["color"],
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
    prisma.wine.findMany({
      where: wineWhere,
      orderBy,
      include: {
        winery: { select: { name: true, slug: true } },
        region: { select: { name: true, slug: true } },
        varieties: { include: { variety: { select: { name: true } } } },
      },
    }),
  ]);

  const colorOptions = colorGroups.map((g) => {
    const slug = COLOR_SLUG_BY_ENUM[g.color];
    return {
      value: slug,
      label: COLOR_LABELS[slug] ?? slug,
      count: g._count._all,
      active: state.color.includes(slug),
      href: hrefFor({ ...state, color: toggleValue(state.color, slug) }),
    };
  });

  const regionOptions = regions.map((r) => ({
    value: r.slug,
    label: r.name,
    count: r._count.wines,
    active: state.region.includes(r.slug),
    href: hrefFor({ ...state, region: toggleValue(state.region, r.slug) }),
  }));

  const varietyOptions = varieties.map((v) => ({
    value: v.slug,
    label: v.name,
    count: v._count.wines,
    active: state.variety.includes(v.slug),
    href: hrefFor({ ...state, variety: toggleValue(state.variety, v.slug) }),
  }));

  const ratingOptions = [4, 3].map((min) => ({
    label: `${min},0 και άνω`,
    active: state.minRating === min,
    href: hrefFor({ ...state, minRating: state.minRating === min ? undefined : min }),
  }));

  const priceOptions = (["budget", "mid", "premium"] as const).map((p) => ({
    label: PRICE_LABELS[p],
    active: state.price === p,
    href: hrefFor({ ...state, price: state.price === p ? undefined : p }),
  }));

  const hasActiveFilters =
    state.color.length > 0 ||
    state.region.length > 0 ||
    state.variety.length > 0 ||
    !!state.minRating ||
    !!state.price;

  const clearHref = state.sort ? `/krasia?sort=${state.sort}` : "/krasia";

  const activeChips: { label: string; href: string }[] = [
    ...state.color.map((c) => ({
      label: COLOR_LABELS[c] ?? c,
      href: hrefFor({ ...state, color: toggleValue(state.color, c) }),
    })),
    ...state.region.map((r) => ({
      label: regions.find((rg) => rg.slug === r)?.name ?? r,
      href: hrefFor({ ...state, region: toggleValue(state.region, r) }),
    })),
    ...state.variety.map((v) => ({
      label: varieties.find((vv) => vv.slug === v)?.name ?? v,
      href: hrefFor({ ...state, variety: toggleValue(state.variety, v) }),
    })),
    ...(state.minRating
      ? [{ label: `${state.minRating},0+ βαθμολογία`, href: hrefFor({ ...state, minRating: undefined }) }]
      : []),
    ...(state.price
      ? [{ label: PRICE_LABELS[state.price] ?? state.price, href: hrefFor({ ...state, price: undefined }) }]
      : []),
  ];

  return (
    <>
      <div className="wrap page-head">
        <p className="kicker">Εξερεύνηση</p>
        <h1>Όλες οι ετικέτες</h1>
        <p className="result-count">{wines.length} ετικέτες</p>
      </div>

      <div className="wrap layout">
        <FilterSidebar
          colorOptions={colorOptions}
          regionOptions={regionOptions}
          varietyOptions={varietyOptions}
          ratingOptions={ratingOptions}
          priceOptions={priceOptions}
          clearHref={clearHref}
          hasActiveFilters={hasActiveFilters}
        />

        <div>
          <div className="results-top">
            <div className="active-chips">
              {activeChips.map((chip) => (
                <span className="active-chip" key={chip.label}>
                  {chip.label}
                  <Link href={chip.href} aria-label="Αφαίρεση φίλτρου">
                    ×
                  </Link>
                </span>
              ))}
            </div>
            <SortSelect current={state.sort ?? "popular"} />
          </div>

          {wines.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>Καμία ετικέτα δεν ταιριάζει με αυτά τα φίλτρα.</p>
          ) : (
            <div className="wine-grid">
              {wines.map((wine) => (
                <WineCard key={wine.id} wine={wine} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
