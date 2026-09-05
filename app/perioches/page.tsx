import type { Metadata } from "next";
import Link from "next/link";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { APPELLATION_LABEL, MACRO_REGION_LABEL } from "@/lib/labels";

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

  return (
    <>
      <div className="wrap page-head">
        <p className="kicker">Εξερεύνηση</p>
        <h1>Περιοχές</h1>
        <p className="result-count">{regions.length} περιοχές</p>
      </div>

      <div className="wrap index-grid">
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
    </>
  );
}
