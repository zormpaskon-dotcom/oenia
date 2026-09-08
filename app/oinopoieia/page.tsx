import type { Metadata } from "next";
import Link from "next/link";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MACRO_REGION_LABEL } from "@/lib/labels";
import QuickFilterGrid from "@/components/QuickFilterGrid";

export const metadata: Metadata = {
  title: "Οινοποιεία | Oenia",
  description: "Όλα τα οινοποιεία στο Oenia, ανά περιοχή.",
};

export default async function WineriesPage() {
  const wineries = await prisma.winery.findMany({
    where: { status: ContentStatus.PUBLISHED },
    include: {
      region: { select: { name: true, macroRegion: true } },
      _count: { select: { wines: { where: { status: ContentStatus.PUBLISHED } } } },
    },
    orderBy: { name: "asc" },
  });

  const macroRegionOptions = Array.from(new Set(wineries.map((w) => w.region.macroRegion)))
    .sort((a, b) => (MACRO_REGION_LABEL[a] ?? a).localeCompare(MACRO_REGION_LABEL[b] ?? b, "el"))
    .map((mr) => ({ value: mr, label: MACRO_REGION_LABEL[mr] ?? mr }));

  const items = wineries.map((w) => ({
    key: w.id,
    searchText: `${w.name} ${w.region.name} ${w.subRegion ?? ""}`,
    facetValues: { macroRegion: w.region.macroRegion },
    node: (
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
    ),
  }));

  return (
    <>
      <div className="wrap page-head">
        <p className="kicker">Εξερεύνηση</p>
        <h1>Οινοποιεία</h1>
      </div>

      <div className="wrap">
        <QuickFilterGrid
          items={items}
          nounSingular="οινοποιείο"
          nounPlural="οινοποιεία"
          searchPlaceholder="Αναζήτηση οινοποιείου ή περιοχής…"
          emptyMessage="Κανένα οινοποιείο δεν ταιριάζει με αυτά τα φίλτρα."
          facets={[{ key: "macroRegion", label: "Περιοχή", options: macroRegionOptions }]}
        />
      </div>
    </>
  );
}
