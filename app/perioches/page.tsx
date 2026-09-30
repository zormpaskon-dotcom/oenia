import type { Metadata } from "next";
import Link from "next/link";
import { Appellation, ContentStatus, MacroRegion, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { APPELLATION_LABEL, MACRO_REGION_LABEL } from "@/lib/labels";
import { SITE_URL } from "@/lib/site";
import { facetSeo } from "@/lib/facet-seo";
import { catalogSocialMeta } from "@/lib/catalog-seo";
import ListSearchInput from "@/components/ListSearchInput";
import ListSortSelect from "@/components/ListSortSelect";
import Pagination from "@/components/Pagination";
import RegionCard from "@/components/RegionCard";
import {
  PAGE_SIZE,
  SORT_OPTIONS,
  hrefFor,
  hrefForPage,
  isAppellationFilterValue,
  isMacroRegionValue,
  toList,
  toggleValue,
  type AppellationFilterValue,
  type FilterState,
} from "./filters";

const TITLE = "Περιοχές | Oenia";
const DESCRIPTION = "Οι ζώνες ΠΟΠ/ΠΓΕ του ελληνικού κρασιού.";
const NO_APPELLATION_LABEL = "Χωρίς ονομασία";

type SearchParams = { [key: string]: string | string[] | undefined };

// SEO FIX PASS 2: "macroRegion" (7 τιμές — Βόρεια Ελλάδα, Πελοπόννησος κ.λπ.)
// και "appellation" (3 τιμές — ΠΟΠ/ΠΓΕ/Τοπικός) είναι χαμηλής πληθικότητας,
// γνήσιες γεωγραφικές/νομικές κατηγορίες διερεύνησης — μένουν αυτόνομα
// indexable ΜΟΝΟ όταν είναι το ΜΟΝΟ ενεργό query param. search/sort utility.
const MEANINGFUL_FILTER_KEYS = ["macroRegion", "appellation"] as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const key of ["macroRegion", "appellation", "search", "sort", "page"]) {
    const value = sp[key];
    if (typeof value === "string" && value) params.set(key, value);
  }
  const qs = params.toString();
  const { indexable } = facetSeo([...params.keys()], MEANINGFUL_FILTER_KEYS);
  const path = `/perioches${indexable && qs ? `?${qs}` : ""}`;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}${path}` },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    ...catalogSocialMeta({ title: TITLE, description: DESCRIPTION, path, image: "/home/explore-regions.jpg" }),
  };
}

const ORDER_BY: Record<string, Prisma.RegionOrderByWithRelationInput> = {
  featured: { name: "asc" },
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
  wines: { wines: { _count: "desc" } },
  wineries: { wineries: { _count: "desc" } },
};

export default async function RegionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const rawPage = sp.page ? Number(sp.page) : 1;

  const state: FilterState = {
    macroRegion: toList(sp.macroRegion).filter(isMacroRegionValue),
    appellation: toList(sp.appellation).filter(isAppellationFilterValue),
    search: typeof sp.search === "string" ? sp.search : undefined,
    sort: typeof sp.sort === "string" ? sp.sort : undefined,
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
  };
  // Χωρίς το page — ίδιο σκεπτικό με το /oinopoieia: τα hrefFor() των φίλτρων
  // δεν το γράφουν ποτέ, κάθε αλλαγή filter/search/sort γυρνάει σε σελίδα 1.
  const linkState: Omit<FilterState, "page"> = {
    macroRegion: state.macroRegion,
    appellation: state.appellation,
    search: state.search,
    sort: state.sort,
  };

  const appellationEnumValues = state.appellation.filter((a): a is Appellation => a !== "NONE");
  const wantsNoAppellation = state.appellation.includes("NONE");

  const regionWhere: Prisma.RegionWhereInput = {
    ...(state.macroRegion.length ? { macroRegion: { in: state.macroRegion } } : {}),
    ...(state.appellation.length
      ? {
          OR: [
            ...(appellationEnumValues.length ? [{ appellation: { in: appellationEnumValues } }] : []),
            ...(wantsNoAppellation ? [{ appellation: null }] : []),
          ],
        }
      : {}),
    ...(state.search ? { name: { contains: state.search, mode: "insensitive" as const } } : {}),
  };

  const orderBy = ORDER_BY[state.sort ?? "featured"] ?? ORDER_BY.featured;

  // Facet counts είναι σκόπιμα global (δεν λαμβάνουν υπόψη τα υπόλοιπα ενεργά
  // φίλτρα) — ίδια απλοποίηση με /krasia, /oinopoieia. Μόνο 55 regions, άρα
  // ένα ανεξάρτητο, ελαφρύ query αρκεί.
  const [totalCount, allRegionsForFacets] = await Promise.all([
    prisma.region.count({ where: regionWhere }),
    prisma.region.findMany({ select: { macroRegion: true, appellation: true } }),
  ]);

  // clamp πρέπει να ξέρει το total πριν ζητήσουμε τη σελίδα των περιοχών,
  // γι' αυτό τρέχει ξεχωριστά, μετά το Promise.all παραπάνω — ίδιο σκεπτικό
  // με το /oinopoieia.
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, state.page), pageCount);

  const regions = await prisma.region.findMany({
    where: regionWhere,
    orderBy,
    take: PAGE_SIZE,
    skip: (currentPage - 1) * PAGE_SIZE,
    include: {
      _count: {
        select: {
          wines: { where: { status: ContentStatus.PUBLISHED } },
          wineries: { where: { status: ContentStatus.PUBLISHED } },
        },
      },
    },
  });

  const macroRegionCounts = new Map<MacroRegion, number>();
  const appellationCounts = new Map<AppellationFilterValue, number>();
  for (const r of allRegionsForFacets) {
    macroRegionCounts.set(r.macroRegion, (macroRegionCounts.get(r.macroRegion) ?? 0) + 1);
    const key: AppellationFilterValue = r.appellation ?? "NONE";
    appellationCounts.set(key, (appellationCounts.get(key) ?? 0) + 1);
  }

  const macroRegionOptions = Array.from(macroRegionCounts.entries())
    .sort((a, b) => (MACRO_REGION_LABEL[a[0]] ?? a[0]).localeCompare(MACRO_REGION_LABEL[b[0]] ?? b[0], "el"))
    .map(([mr, count]) => ({
      value: mr,
      label: MACRO_REGION_LABEL[mr] ?? mr,
      count,
      active: state.macroRegion.includes(mr),
      href: hrefFor({ ...linkState, macroRegion: toggleValue(state.macroRegion, mr) }),
    }));

  const APPELLATION_ORDER: AppellationFilterValue[] = ["PDO", "PGI", "TABLE", "NONE"];
  const appellationOptions = APPELLATION_ORDER.filter((a) => appellationCounts.has(a)).map((a) => ({
    value: a,
    label: a === "NONE" ? NO_APPELLATION_LABEL : APPELLATION_LABEL[a] ?? a,
    count: appellationCounts.get(a) ?? 0,
    active: state.appellation.includes(a),
    href: hrefFor({ ...linkState, appellation: toggleValue(state.appellation, a) }),
  }));

  const hasActiveFilters = state.macroRegion.length > 0 || state.appellation.length > 0 || !!state.search;
  const clearHref = "/perioches";

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <>
      <div className="wrap-wide page-intro">
        <p className="kicker">Εξερεύνηση</p>
        <h1>{totalCount} ελληνικές περιοχές.</h1>
        <p className="result-count">Από τα ηφαιστειογενή νησιά μέχρι τους ορεινούς αμπελώνες, κάθε ζώνη έχει τον δικό της χαρακτήρα.</p>
      </div>

      <div className="wrap-wide list-toolbar">
        <ListSearchInput
          key={state.search ?? ""}
          basePath="/perioches"
          defaultValue={state.search ?? ""}
          placeholder="Αναζήτηση περιοχής…"
        />
        <div>
          <ListSortSelect basePath="/perioches" current={state.sort ?? "featured"} options={SORT_OPTIONS} />
        </div>
      </div>

      <div className="wrap-wide" style={{ paddingTop: 24 }}>
        <div className="filter-row">
          {macroRegionOptions.map((opt) => (
            <Link key={opt.value} href={opt.href} className={`chip${opt.active ? " is-active" : ""}`}>
              {opt.label}
            </Link>
          ))}
        </div>
        <div className="filter-row" style={{ marginTop: 10 }}>
          {appellationOptions.map((opt) => (
            <Link key={opt.value} href={opt.href} className={`chip${opt.active ? " is-active" : ""}`}>
              {opt.label}
            </Link>
          ))}
          {hasActiveFilters && (
            <Link href={clearHref} className="list-chips-clear" style={{ alignSelf: "center" }}>
              Καθαρισμός
            </Link>
          )}
        </div>
      </div>

      <div className="wrap-wide">
        {regions.length === 0 ? (
          <div className="list-empty">
            <p>Καμία περιοχή δεν ταιριάζει με αυτά τα φίλτρα.</p>
            <Link href={clearHref} className="link-arrow">
              Καθαρισμός φίλτρων
            </Link>
          </div>
        ) : (
          <div className="entity-grid">
            {regions.map((r) => (
              <RegionCard key={r.id} region={r} />
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
          noun="περιοχές"
          variant="counter"
        />
      </div>
    </>
  );
}
