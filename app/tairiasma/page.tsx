import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Τι θα φας; | Oenia",
  description: "Διάλεξε τι θα φας και βρες ελληνικά κρασιά που ταιριάζουν.",
};

export default async function PairingIndexPage() {
  const categories = await prisma.foodCategory.findMany({
    include: { _count: { select: { pairings: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="wrap page-head" style={{ paddingBottom: 80 }}>
      <p className="kicker">Αντίστροφη αναζήτηση</p>
      <h1>Τι θα φας;</h1>
      <p className="result-count">Διάλεξε κατηγορία φαγητού και βρες κρασιά που ταιριάζουν.</p>

      <div className="index-grid" style={{ marginTop: 32 }}>
        {categories.map((c) => (
          <Link key={c.id} href={`/tairiasma/${c.slug}`} className="index-card reveal">
            <span style={{ fontSize: 32, display: "block", marginBottom: 10 }}>{c.emoji}</span>
            <h3>{c.name}</h3>
            {c.blurb && <p>{c.blurb}</p>}
            <div className="badges">
              <span className="badge-pill">{c._count.pairings} προτάσεις</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
