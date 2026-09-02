import type { Metadata } from "next";
import Link from "next/link";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import WineMap, { type MapWinery } from "@/components/WineMap";

export const metadata: Metadata = {
  title: "Χάρτης οινοποιείων | Oenia",
  description: "Διαδραστικός χάρτης με τα οινοποιεία που έχουμε καταγράψει, ανά περιοχή.",
};

export default async function MapPage() {
  const wineries = await prisma.winery.findMany({
    where: { status: ContentStatus.PUBLISHED },
    include: {
      region: { select: { name: true, slug: true, latitude: true, longitude: true } },
      _count: { select: { wines: { where: { status: ContentStatus.PUBLISHED } } } },
    },
    orderBy: { name: "asc" },
  });

  const mappable: MapWinery[] = wineries
    .map((w) => {
      const lat = w.latitude ?? w.region.latitude;
      const lng = w.longitude ?? w.region.longitude;
      if (lat == null || lng == null) return null;
      return {
        slug: w.slug,
        name: w.name,
        regionName: w.region.name,
        regionSlug: w.region.slug,
        lat,
        lng,
        wineCount: w._count.wines,
      };
    })
    .filter((w): w is MapWinery => w !== null);

  return (
    <>
      <div className="wrap page-head">
        <p className="kicker">Εξερεύνηση</p>
        <h1>Χάρτης οινοποιείων</h1>
        <p className="result-count">{mappable.length} οινοποιεία στον χάρτη</p>
      </div>

      <div className="wrap" style={{ paddingBottom: 20 }}>
        {mappable.length > 0 ? (
          <WineMap wineries={mappable} />
        ) : (
          <p style={{ color: "var(--muted)" }}>Δεν υπάρχουν ακόμα οινοποιεία με καταγεγραμμένη τοποθεσία.</p>
        )}
      </div>

      {wineries.length > 0 && (
        <div className="wrap" style={{ paddingBottom: 80 }}>
          <h2 className="section-title">Όλα τα οινοποιεία</h2>
          <div>
            {wineries.map((w) => (
              <Link key={w.id} href={`/oinopoieia/${w.slug}`} className="winery-row">
                <div className="winery-thumb" />
                <div>
                  <h3>{w.name}</h3>
                  <span className="meta">
                    {w.region.name}
                    {w.subRegion ? `, ${w.subRegion}` : ""}
                  </span>
                </div>
                <span className="visit">{w._count.wines} ετικέτες</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
