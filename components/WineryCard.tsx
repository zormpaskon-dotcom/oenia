import Link from "next/link";
import type { MacroRegion } from "@prisma/client";
import WineryPhoto from "@/components/WineryPhoto";
import BookmarkButton from "@/components/BookmarkButton";
import { WINERY_IMAGES } from "@/lib/winery-images";

export default function WineryCard({
  winery,
}: {
  winery: {
    slug: string;
    name: string;
    description: string | null;
    subRegion: string | null;
    foundedYear: number | null;
    isVerified: boolean;
    isOrganic: boolean;
    acceptsVisitors: boolean;
    region: { name: string; macroRegion: MacroRegion };
    _count: { wines: number };
  };
}) {
  const hero = WINERY_IMAGES[winery.slug]?.hero;
  const facts = [
    `${winery._count.wines} ${winery._count.wines === 1 ? "ετικέτα" : "ετικέτες"}`,
    winery.isVerified ? "Επαληθευμένο" : null,
    winery.isOrganic ? "Βιολογικό" : null,
    winery.acceptsVisitors ? "Δέχεται επισκέπτες" : null,
  ].filter(Boolean);

  return (
    <div className="entity-card">
      <BookmarkButton label={winery.name} />
      <Link href={`/oinopoieia/${winery.slug}`} className="entity-card-link reveal">
        <WineryPhoto hero={hero} macroRegion={winery.region.macroRegion} wineryName={winery.name} className="entity-card-photo" />
        <p className="entity-card-eyebrow">
          {winery.region.name}
          {winery.subRegion ? `, ${winery.subRegion}` : ""}
          {winery.foundedYear ? ` · Από το ${winery.foundedYear}` : ""}
        </p>
        <h3>{winery.name}</h3>
        {winery.description && <p className="entity-card-desc">{winery.description}</p>}
        <p className="entity-card-facts">{facts.join(" · ")}</p>
      </Link>
    </div>
  );
}
