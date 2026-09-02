import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { COLOR_GRADIENT } from "@/lib/labels";

async function getCategory(slug: string) {
  return prisma.foodCategory.findUnique({
    where: { slug },
    include: {
      pairings: {
        orderBy: { sortOrder: "asc" },
        include: {
          wine: {
            include: {
              winery: { select: { name: true, slug: true } },
              region: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: `${category.name} — Τι θα φας; | Oenia`,
    description: category.blurb ?? undefined,
  };
}

export default async function PairingCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <div className="wrap">
      <p className="breadcrumb">
        <Link href="/">Αρχική</Link> / <Link href="/tairiasma">Τι θα φας;</Link> / {category.name}
      </p>

      <div className="page-head">
        <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>{category.emoji}</span>
        <h1>{category.name}</h1>
        {category.blurb && <p className="result-count">{category.blurb}</p>}
      </div>

      <div style={{ paddingBottom: 80 }}>
        {category.pairings.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            Δεν έχουμε ακόμα προτάσεις κρασιού για αυτή την κατηγορία.
          </p>
        ) : (
          <div className="pairing-grid">
            {category.pairings.map((p) => (
              <div className="pairing-card" key={p.id}>
                <Link href={`/krasia/${p.wine.slug}`} className="mini-photo" style={{ background: COLOR_GRADIENT[p.wine.color] }} />
                <div className="pairing-body">
                  <Link href={`/krasia/${p.wine.slug}`}>
                    <h3>{p.wine.name}</h3>
                  </Link>
                  <p className="pairing-meta">
                    {p.wine.winery.name} · {p.wine.region.name}
                  </p>
                  {p.reason && <p className="pairing-reason">{p.reason}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
