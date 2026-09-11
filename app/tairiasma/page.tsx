import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getFeaturedDishesForCategory, getPopularDishes } from "@/lib/pairing-engine/relatedContent";

export const metadata: Metadata = {
  title: "Τι θα φας; | Oenia",
  description: "Διάλεξε τι θα φας και βρες ελληνικά κρασιά που ταιριάζουν.",
};

export default async function PairingIndexPage() {
  const categories = await prisma.foodCategory.findMany({
    include: { _count: { select: { pairings: true } } },
    orderBy: { sortOrder: "asc" },
  });
  const popularDishes = getPopularDishes(10);

  return (
    <>
      <div className="wrap page-head">
        <p className="kicker">Αντίστροφη αναζήτηση</p>
        <h1>Τι θα φας;</h1>
        <p className="result-count">Διάλεξε κατηγορία φαγητού και βρες κρασιά που ταιριάζουν.</p>

        <h2 className="section-title" style={{ marginTop: 40 }}>
          Κατηγορίες φαγητού
        </h2>
        <div className="index-grid" style={{ marginTop: 0 }}>
          {categories.map((c) => {
            const featured = getFeaturedDishesForCategory(c.slug, 3);
            return (
              <div key={c.id} className="index-card reveal">
                <Link href={`/tairiasma/${c.slug}`} className="index-card-link">
                  <span style={{ fontSize: 32, display: "block", marginBottom: 10 }}>{c.emoji}</span>
                  <h3>{c.name}</h3>
                  {c.blurb && <p>{c.blurb}</p>}
                  <div className="badges">
                    <span className="badge-pill">{c._count.pairings} προτάσεις</span>
                  </div>
                </Link>
                {featured.length > 0 && (
                  <p className="index-card-dishes">
                    {featured.map((d, i) => (
                      <span key={d.slug}>
                        <Link href={`/tairiasma/${d.slug}`}>{d.name}</Link>
                        {i < featured.length - 1 && " · "}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {popularDishes.length > 0 && (
        <div className="wrap" style={{ paddingBottom: 80 }}>
          <h2 className="section-title">Δημοφιλή ταιριάσματα</h2>
          <div className="filter-row">
            {popularDishes.map((d) => (
              <Link key={d.slug} href={`/tairiasma/${d.slug}`} className="chip">
                {d.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
