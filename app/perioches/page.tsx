import type { Metadata } from "next";
import Link from "next/link";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { APPELLATION_LABEL, MACRO_REGION_LABEL } from "@/lib/labels";
import QuickFilterGrid from "@/components/QuickFilterGrid";

export const metadata: Metadata = {
  title: "Περιοχές | Oenia",
  description: "Οι ζώνες ΠΟΠ/ΠΓΕ του ελληνικού κρασιού.",
};

export default async function RegionsPage() {
  const regions = await prisma.region.findMany({
    include: {
      _count: {
        select: {
          wines: { where: { status: ContentStatus.PUBLISHED } },
          wineries: { where: { status: ContentStatus.PUBLISHED } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const macroRegionOptions = Array.from(new Set(regions.map((r) => r.macroRegion)))
    .sort((a, b) => (MACRO_REGION_LABEL[a] ?? a).localeCompare(MACRO_REGION_LABEL[b] ?? b, "el"))
    .map((mr) => ({ value: mr, label: MACRO_REGION_LABEL[mr] ?? mr }));

  const appellationOptions = Array.from(new Set(regions.map((r) => r.appellation).filter(Boolean))).map((a) => ({
    value: a as string,
    label: APPELLATION_LABEL[a as string] ?? (a as string),
  }));

  const items = regions.map((r) => ({
    key: r.id,
    searchText: r.name,
    facetValues: { macroRegion: r.macroRegion, appellation: r.appellation },
    node: (
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
    ),
  }));

  return (
    <>
      <div className="wrap page-head">
        <p className="kicker">Εξερεύνηση</p>
        <h1>Περιοχές</h1>
      </div>

      <div className="wrap">
        <QuickFilterGrid
          items={items}
          nounSingular="περιοχή"
          nounPlural="περιοχές"
          searchPlaceholder="Αναζήτηση περιοχής…"
          emptyMessage="Καμία περιοχή δεν ταιριάζει με αυτά τα φίλτρα."
          facets={[
            { key: "macroRegion", label: "Περιοχή", options: macroRegionOptions },
            { key: "appellation", label: "Ονομασία", options: appellationOptions },
          ]}
        />
      </div>
    </>
  );
}
