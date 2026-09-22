import type { Metadata } from "next";
import Link from "next/link";
import { Prisma, Variety, VarietyType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { facetSeo } from "@/lib/facet-seo";
import { catalogSocialMeta } from "@/lib/catalog-seo";
import ListSearchInput from "@/components/ListSearchInput";
import ListSortSelect from "@/components/ListSortSelect";
import { SORT_OPTIONS, TYPE_ENUM, hrefFor, isTypeFilterValue, type FilterState } from "./filters";

const TITLE = "Ποικιλίες | Oenia";
const DESCRIPTION = "Ελληνικές και διεθνείς ποικιλίες κρασιού που καλλιεργούνται στην Ελλάδα, λευκές και κόκκινες.";

type SearchParams = { [key: string]: string | string[] | undefined };

// SEO FIX PASS 2: "type" (2 τιμές — Λευκές/Κόκκινες ποικιλίες) είναι γνήσια
// discovery κατηγορία — μένει αυτόνομα indexable ΜΟΝΟ όταν είναι το ΜΟΝΟ
// ενεργό query param. search/sort utility.
const MEANINGFUL_FILTER_KEYS = ["type"] as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const key of ["type", "search", "sort"]) {
    const value = sp[key];
    if (typeof value === "string" && value) params.set(key, value);
  }
  const qs = params.toString();
  const { indexable } = facetSeo([...params.keys()], MEANINGFUL_FILTER_KEYS);
  const path = `/poikilies${indexable && qs ? `?${qs}` : ""}`;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}${path}` },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    ...catalogSocialMeta({ title: TITLE, description: DESCRIPTION, path, image: "/home/explore-grapes.jpg" }),
  };
}

const ORDER_BY: Record<string, Prisma.VarietyOrderByWithRelationInput> = {
  featured: { name: "asc" },
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
  wines: { wines: { _count: "desc" } },
};

export default async function VarietiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const state: FilterState = {
    type: typeof sp.type === "string" && isTypeFilterValue(sp.type) ? sp.type : undefined,
    search: typeof sp.search === "string" ? sp.search : undefined,
    sort: typeof sp.sort === "string" ? sp.sort : undefined,
  };

  const varietyWhere: Prisma.VarietyWhereInput = {
    ...(state.type ? { type: TYPE_ENUM[state.type] } : {}),
    ...(state.search
      ? {
          OR: [
            { name: { contains: state.search, mode: "insensitive" as const } },
            { nameLatin: { contains: state.search, mode: "insensitive" as const } },
            { originRegion: { contains: state.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy = ORDER_BY[state.sort ?? "featured"] ?? ORDER_BY.featured;

  const varieties = await prisma.variety.findMany({ where: varietyWhere, orderBy });

  const whites = varieties.filter((v) => v.type === VarietyType.WHITE);
  const reds = varieties.filter((v) => v.type === VarietyType.RED);
  const totalCount = varieties.length;

  const clearHref = "/poikilies";
  // Ίδιο σκεπτικό με /krasia, /oinopoieia, /perioches: το sort δεν μετράει
  // σαν "ενεργό φίλτρο" για την εμφάνιση του Καθαρισμού — μόνο type/search.
  const hasActiveFilters = !!state.type || !!state.search;

  return (
    <div className="wrap-wide page-intro" style={{ paddingBottom: 80 }}>
      <p className="kicker">Εξερεύνηση</p>
      <h1>Ποικιλίες</h1>

      <p className="result-count">
        {totalCount} {totalCount === 1 ? "ποικιλία" : "ποικιλίες"}
      </p>

      <div className="list-toolbar" style={{ marginTop: 24 }}>
        <ListSearchInput
          key={state.search ?? ""}
          basePath="/poikilies"
          defaultValue={state.search ?? ""}
          placeholder="Αναζήτηση ποικιλίας ή περιοχής προέλευσης…"
        />
        <div>
          <ListSortSelect basePath="/poikilies" current={state.sort ?? "featured"} options={SORT_OPTIONS} />
        </div>
      </div>

      <div className="filter-row" style={{ marginTop: 20, marginBottom: 4 }}>
        <Link href={hrefFor({ ...state, type: undefined })} className={`chip${!state.type ? " is-active" : ""}`}>
          Όλες
        </Link>
        <Link
          href={hrefFor({ ...state, type: state.type === "white" ? undefined : "white" })}
          className={`chip${state.type === "white" ? " is-active" : ""}`}
        >
          Λευκές
        </Link>
        <Link
          href={hrefFor({ ...state, type: state.type === "red" ? undefined : "red" })}
          className={`chip${state.type === "red" ? " is-active" : ""}`}
        >
          Κόκκινες
        </Link>
        {hasActiveFilters && (
          <Link href={clearHref} className="list-chips-clear" style={{ alignSelf: "center" }}>
            Καθαρισμός
          </Link>
        )}
      </div>

      {totalCount === 0 ? (
        <div className="quick-empty">
          <p style={{ marginBottom: 14 }}>Καμία ποικιλία δεν ταιριάζει με αυτά τα φίλτρα.</p>
          <Link href={clearHref} className="link-arrow">
            Καθαρισμός φίλτρων
          </Link>
        </div>
      ) : (
        <>
          {(!state.type || state.type === "white") && <VarietyGroup title="Λευκές" items={whites} />}
          {(!state.type || state.type === "red") && <VarietyGroup title="Κόκκινες" items={reds} />}
        </>
      )}
    </div>
  );
}

function LeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3c5 3 7 8 4 13-2 3-6 4-8 2-2-3 0-8 4-11z" />
      <path d="M12 3v16" />
    </svg>
  );
}

function VarietyGroup({ title, items }: { title: string; items: Variety[] }) {
  if (items.length === 0) return null;
  return (
    <section style={{ padding: "40px 0 0" }}>
      <h2 className="section-title">{title}</h2>
      <div className="variety-list">
        {items.map((v) => (
          <Link key={v.id} href={`/poikilies/${v.slug}`} className="variety-item">
            <span className="leaf-badge" style={{ marginBottom: 0 }}>
              <LeafIcon />
            </span>
            <span>
              <span className="v-name" style={{ display: "block" }}>
                {v.name}
              </span>
              <span className="v-region">{v.originRegion ?? "Ελλάδα"}</span>
            </span>
            <p className="v-detail">{v.description ?? ""}</p>
            <span className="v-color">{v.type === VarietyType.WHITE ? "Λευκή" : "Κόκκινη"}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
