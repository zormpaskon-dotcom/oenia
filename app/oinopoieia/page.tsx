import type { Metadata } from "next";
import Link from "next/link";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Οινοποιεία | Oenia",
  description: "Όλα τα οινοποιεία στο Oenia, ανά περιοχή.",
};

export default async function WineriesPage() {
  const wineries = await prisma.winery.findMany({
    where: { status: ContentStatus.PUBLISHED },
    include: {
      region: { select: { name: true } },
      _count: { select: { wines: { where: { status: ContentStatus.PUBLISHED } } } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <div className="wrap page-head">
        <p className="kicker">Εξερεύνηση</p>
        <h1>Οινοποιεία</h1>
        <p className="result-count">{wineries.length} οινοποιεία</p>
      </div>

      <div className="wrap index-grid">
        {wineries.map((w) => (
          <Link key={w.id} href={`/oinopoieia/${w.slug}`} className="index-card">
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
    </>
  );
}
