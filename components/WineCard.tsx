import Link from "next/link";
import type { WineColor } from "@prisma/client";
import { COLOR_NAME, reviewCountLabel } from "@/lib/labels";
import WinePhoto from "@/components/WinePhoto";
import CompareButton from "@/components/CompareButton";

export type WineCardData = {
  slug: string;
  name: string;
  color: WineColor;
  style: string;
  avgRating: number;
  reviewCount: number;
  labelImage: string | null;
  winery: { name: string; slug: string };
  region: { name: string; slug: string };
  varieties: { variety: { name: string } }[];
};

// Layout: bottle photo πρώτα (μεγάλη, πάνω, το "hero" της κάρτας), μετά όνομα
// → οινοποιείο → περιοχή/ποικιλία → rating, σε φθίνουσα οπτική βαρύτητα.
// Ίδια δεδομένα/props με πριν, μόνο η παρουσίαση άλλαξε — βλ. πλάνο polish pass.
export default function WineCard({ wine }: { wine: WineCardData }) {
  const mainVariety = wine.varieties[0]?.variety.name;

  return (
    <div className="wine-card reveal">
      <CompareButton slug={wine.slug} />
      <Link href={`/krasia/${wine.slug}`} className="wine-card-link">
        <WinePhoto
          labelImage={wine.labelImage}
          color={wine.color}
          wineName={wine.name}
          className="card-photo"
          sizes="(max-width: 640px) 45vw, (max-width: 980px) 30vw, 22vw"
        />
        <div className="card-body">
          <h3 className="card-name">{wine.name}</h3>
          <p className="card-winery">{wine.winery.name}</p>
          <p className="card-region">
            {wine.region.name}
            {mainVariety ? ` · ${mainVariety}` : ""}
          </p>
          <div className="card-rating">
            {wine.reviewCount > 0 && (
              <span className="card-rating-num">{wine.avgRating.toFixed(1).replace(".", ",")}</span>
            )}
            <span className="card-rating-meta">
              {wine.reviewCount > 0 ? reviewCountLabel(wine.reviewCount) : "Χωρίς αξιολογήσεις"} ·{" "}
              {COLOR_NAME[wine.color]}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
