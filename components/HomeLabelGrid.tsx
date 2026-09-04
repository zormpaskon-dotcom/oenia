"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { WineColor } from "@prisma/client";
import { COLOR_NAME } from "@/lib/labels";
import WinePhoto from "@/components/WinePhoto";

export type HomeLabelWine = {
  slug: string;
  name: string;
  color: WineColor;
  avgRating: number;
  labelImage: string | null;
  winery: { name: string };
  region: { name: string; slug: string };
  varieties: { variety: { name: string } }[];
};

export default function HomeLabelGrid({ wines }: { wines: HomeLabelWine[] }) {
  const colors = useMemo(
    () => Array.from(new Set(wines.map((w) => w.color))),
    [wines]
  );
  const [filter, setFilter] = useState<"all" | WineColor>("all");

  const filtered = filter === "all" ? wines : wines.filter((w) => w.color === filter);
  const filledDots = (rating: number) => Math.round(rating);

  return (
    <>
      {colors.length > 1 && (
        <div className="filter-row">
          <button className={`chip${filter === "all" ? " is-active" : ""}`} onClick={() => setFilter("all")}>
            Όλα
          </button>
          {colors.map((c) => (
            <button
              key={c}
              className={`chip${filter === c ? " is-active" : ""}`}
              onClick={() => setFilter(c)}
            >
              {COLOR_NAME[c]}
            </button>
          ))}
        </div>
      )}

      <div className="home-label-grid">
        {filtered.map((wine) => {
          const mainVariety = wine.varieties[0]?.variety.name;
          const filled = filledDots(wine.avgRating);
          return (
            <Link
              key={wine.slug}
              href={`/krasia/${wine.slug}`}
              className="label-card"
              data-region={wine.region.slug}
              style={{ display: "block" }}
            >
              <WinePhoto labelImage={wine.labelImage} color={wine.color} wineName={wine.name} className="label-photo" sizes="(max-width: 1000px) 50vw, 25vw" />
              <h3>{wine.name}</h3>
              <p className="winery-name">{wine.winery.name}</p>
              <div className="meta-row">
                <span>
                  {wine.region.name}
                  {mainVariety ? ` · ${mainVariety}` : ""}
                </span>
                <span className="dots">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`dot${i < filled ? " filled" : ""}`} />
                  ))}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
