"use client";

import { useState } from "react";
import Link from "next/link";
import type { WineColor } from "@prisma/client";
import WinePhoto from "@/components/WinePhoto";
import { COLOR_NAME } from "@/lib/labels";

export type PairingCardWine = {
  id: string;
  wineSlug: string;
  wineName: string;
  labelImage: string | null;
  color: WineColor;
  wineryName: string;
  regionName: string;
};

const BATCH_SIZE = 24;

function ArrowIcon() {
  return (
    <svg width={13} height={9.5} viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8h21M15 1l7 7-7 7" />
    </svg>
  );
}

// Το πλήρες σύνολο των κρασιών (ήδη PUBLISHED-only, στην ίδια σειρά DB) έρχεται
// έτοιμο από τον server component γονέα — μία μόνο query. Το "Δες περισσότερα"
// απλά αυξάνει το πόσα από τα ήδη-φορτωμένα κρασιά είναι ορατά, χωρίς δεύτερο
// query, χωρίς αλλαγή URL.
export default function PairingWineGrid({ wines }: { wines: PairingCardWine[] }) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const visible = wines.slice(0, visibleCount);
  const hasMore = visibleCount < wines.length;

  return (
    <>
      <div className="pairing-grid">
        {visible.map((w) => (
          <Link href={`/krasia/${w.wineSlug}`} className="pairing-card" key={w.id}>
            <WinePhoto labelImage={w.labelImage} color={w.color} wineName={w.wineName} className="pairing-photo" sizes="64px" />
            <div className="pairing-body">
              <h3>{w.wineName}</h3>
              <p className="pairing-meta">
                {COLOR_NAME[w.color]} · {w.wineryName} · {w.regionName}
              </p>
              <span className="pairing-link">
                Εξερεύνησε το κρασί
                <ArrowIcon />
              </span>
            </div>
          </Link>
        ))}
      </div>
      {hasMore && (
        <button type="button" className="pairing-load-more" onClick={() => setVisibleCount((c) => c + BATCH_SIZE)}>
          Δες περισσότερα κρασιά
        </button>
      )}
    </>
  );
}
