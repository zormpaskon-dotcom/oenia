import Link from "next/link";
import type { PriceRange, WineColor } from "@prisma/client";
import { COLOR_NAME, PRICE_SYMBOL, reviewCountLabel, STYLE_NAME } from "@/lib/labels";
import WinePhoto from "@/components/WinePhoto";

export type WineCardData = {
  slug: string;
  name: string;
  color: WineColor;
  style: string;
  priceRange: PriceRange | null;
  avgRating: number;
  reviewCount: number;
  labelImage: string | null;
  winery: { name: string; slug: string };
  region: { name: string; slug: string };
  varieties: { variety: { name: string } }[];
};

export default function WineCard({ wine }: { wine: WineCardData }) {
  const mainVariety = wine.varieties[0]?.variety.name;

  return (
    <div className="wine-card">
      <Link href={`/krasia/${wine.slug}`} style={{ color: "inherit", textDecoration: "none", display: "block" }}>
        <div className="card-top">
          <WinePhoto labelImage={wine.labelImage} color={wine.color} wineName={wine.name} className="card-photo" sizes="64px" />
          <div className="card-info">
            <h3>{wine.name}</h3>
            <p className="card-winery">{wine.winery.name}</p>
            <span className="card-region">
              {wine.region.name}
              {mainVariety ? ` · ${mainVariety}` : ""}
            </span>
          </div>
        </div>
        <div className="rating-badge">
          <span className="rating-number">{wine.avgRating.toFixed(1).replace(".", ",")}</span>
          <span className="rating-meta">
            <strong>{reviewCountLabel(wine.reviewCount)}</strong>
            {COLOR_NAME[wine.color]} {STYLE_NAME[wine.style] ?? ""}
            {wine.priceRange ? ` · ${PRICE_SYMBOL[wine.priceRange]}` : ""}
          </span>
        </div>
      </Link>
    </div>
  );
}
