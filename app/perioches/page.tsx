import type { Metadata } from "next";
import Link from "next/link";
import { Appellation, ContentStatus, MacroRegion, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { APPELLATION_LABEL, MACRO_REGION_LABEL } from "@/lib/labels";
import { SITE_URL } from "@/lib/site";
import { facetSeo } from "@/lib/facet-seo";
import ListSearchInput from "@/components/ListSearchInput";
import ListSortSelect from "@/components/ListSortSelect";
import {
  SORT_OPTIONS,
  hrefFor,
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
  for (const key of ["macroRegion", "appellation", "search", "sort"]) {
    const value = sp[key];
    if (typeof value === "string" && value) params.set(key, value);
  }
  const qs = params.toString();
  const { indexable } = facetSeo([...params.keys()], MEANINGFUL_FILTER_KEYS);
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/perioches${indexable && qs ? `?${qs}` : ""}` },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
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

  const state: FilterState = {
    macroRegion: toList(sp.macroRegion).filter(isMacroRegionValue),
    appellation: toList(sp.appellation).filter(isAppellationFilterValue),
    search: typeof sp.search === "string" ? sp.search : undefined,
    sort: typeof sp.sort === "string" ? sp.sort : undefined,
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
  // φίλτρα) — ίδια απλοποίηση με /krasia, /oinopoieia. Μόνο 53 regions, άρα
  // ένα ανεξάρτητο, ελαφρύ query αρκεί.
  const [regions, allRegionsForFacets] = await Promise.all([
    prisma.region.findMany({
      where: regionWhere,
      orderBy,
      include: {
        _count: {
          select: {
            wines: { where: { status: ContentStatus.PUBLISHED } },
            wineries: { where: { status: ContentStatus.PUBLISHED } },
          },
        },
      },
    }),
    prisma.region.findMany({ select: { macroRegion: true, appellation: true } }),
  ]);

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
      href: hrefFor({ ...state, macroRegion: toggleValue(state.macroRegion, mr) }),
    }));

  const APPELLATION_ORDER: AppellationFilterValue[] = ["PDO", "PGI", "TABLE", "NONE"];
  const appellationOptions = APPELLATION_ORDER.filter((a) => appellationCounts.has(a)).map((a) => ({
    value: a,
    label: a === "NONE" ? NO_APPELLATION_LABEL : APPELLATION_LABEL[a] ?? a,
    count: appellationCounts.get(a) ?? 0,
    active: state.appellation.includes(a),
    href: hrefFor({ ...state, appellation: toggleValue(state.appellation, a) }),
  }));

  const hasActiveFilters = state.macroRegion.length > 0 || state.appellation.length > 0 || !!state.search;
  const clearHref = "/perioches";

  return (
    <>
      <div className="wrap-wide page-intro">
        <p className="kicker">Εξερεύνηση</p>
        <h1>Περιοχές</h1>
        <p className="result-count">{regions.length} περιοχές</p>
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
          <div className="index-grid">
            {regions.map((r) => (
              <Link key={r.id} href={`/perioches/${r.slug}`} className="index-card reveal">
                <h3>{r.name}</h3>
                <p className="meta">
                  {MACRO_REGION_LABEL[r.macroRegion] ?? r.macroRegion}
                  {r.appellation ? ` · ${APPELLATION_LABEL[r.appellation]}` : ""}
                  {r.recognizedYear ? ` · Από το ${r.recognizedYear}` : ""}
                </p>
                {r.description && <p>{r.description}</p>}
                <div className="badges">
                  <span className="badge-pill">{r._count.wines} ετικέτες</span>
                  <span className="badge-pill">{r._count.wineries} οινοποιεία</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
