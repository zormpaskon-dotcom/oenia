import Link from "next/link";
import type { Appellation, MacroRegion } from "@prisma/client";
import RegionPhoto from "@/components/RegionPhoto";
import BookmarkButton from "@/components/BookmarkButton";
import { APPELLATION_LABEL, MACRO_REGION_LABEL } from "@/lib/labels";

export default function RegionCard({
  region,
}: {
  region: {
    slug: string;
    name: string;
    description: string | null;
    macroRegion: MacroRegion;
    appellation: Appellation | null;
    recognizedYear: number | null;
    heroImage: string | null;
    _count: { wines: number; wineries: number };
  };
}) {
  const facts = [
    `${region._count.wines} ${region._count.wines === 1 ? "ετικέτα" : "ετικέτες"}`,
    `${region._count.wineries} ${region._count.wineries === 1 ? "οινοποιείο" : "οινοποιεία"}`,
  ];

  return (
    <div className="entity-card">
      <BookmarkButton label={region.name} />
      <Link href={`/perioches/${region.slug}`} className="entity-card-link reveal">
        <RegionPhoto heroImage={region.heroImage} macroRegion={region.macroRegion} regionName={region.name} className="entity-card-photo" />
        <p className="entity-card-eyebrow">
          {MACRO_REGION_LABEL[region.macroRegion] ?? region.macroRegion}
          {region.appellation ? ` · ${APPELLATION_LABEL[region.appellation]}` : ""}
          {region.recognizedYear ? ` · Από το ${region.recognizedYear}` : ""}
        </p>
        <h3>{region.name}</h3>
        {region.description && <p className="entity-card-desc">{region.description}</p>}
        <p className="entity-card-facts">{facts.join(" · ")}</p>
      </Link>
    </div>
  );
}
