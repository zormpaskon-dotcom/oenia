import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { COLOR_GRADIENT, COLOR_NAME } from "@/lib/labels";
import WinePhoto from "@/components/WinePhoto";
import { FOOD_PROFILES } from "@/lib/pairing-engine/foodProfiles";
import { getDishRecommendations } from "@/lib/pairing-engine/getRecommendations";

// Level-2 canonical dish (π.χ. /tairiasma/sushi) — ξεχωριστός τύπος σελίδας
// από το Level-1 FoodCategory (π.χ. /tairiasma/seafood) παρακάτω. Το ίδιο
// [slug] param εξυπηρετεί και τα δύο: πρώτα ελέγχουμε αν είναι εγκεκριμένο
// dish (FOOD_PROFILES — ποτέ umbrella/κατηγορία), αλλιώς fallback στην ήδη
// υπάρχουσα, αμετάβλητη λογική κατηγορίας.
function ArrowIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.73} viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8h21M15 1l7 7-7 7" />
    </svg>
  );
}

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

  const dish = FOOD_PROFILES.find((d) => d.slug === slug);
  if (dish) {
    return {
      title: dish.seoTitle ?? `${dish.name} — Τι θα φας; | Oenia`,
      description: dish.seoDescription ?? dish.editorialSanityCheck,
    };
  }

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

  // Level-2 canonical dish — π.χ. /tairiasma/sushi, /tairiasma/moussaka.
  // Μόνο τα 45 εγκεκριμένα FOOD_PROFILES entries μπορούν να ταιριάξουν εδώ
  // — ποτέ ένα umbrella (Θαλασσινά, Κυνήγι κ.λπ.) ή ένα ωμό tag, αφού αυτά
  // απλά δεν υπάρχουν σε αυτό το array.
  const dish = FOOD_PROFILES.find((d) => d.slug === slug);
  if (dish) {
    const recommendations = await getDishRecommendations(dish);

    return (
      <div className="wrap">
        <p className="breadcrumb">
          <Link href="/">Αρχική</Link> / <Link href="/tairiasma">Τι θα φας;</Link> / {dish.name}
        </p>

        <div className="page-head">
          <h1>{dish.name}</h1>
          <p className="result-count">{dish.editorialSanityCheck}</p>
        </div>

        <div style={{ paddingBottom: 80 }}>
          {recommendations.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>Δεν βρέθηκαν προτάσεις κρασιού αυτή τη στιγμή.</p>
          ) : (
            <div className="wine-similar-grid">
              {recommendations.map(({ wine }) => (
                <Link key={wine.id} href={`/krasia/${wine.slug}`} className="wine-similar-card reveal">
                  <WinePhoto labelImage={wine.labelImage} color={wine.color} wineName={wine.name} className="wine-similar-photo" sizes="150px" />
                  <h3>{wine.name}</h3>
                  <span className="wine-similar-meta">
                    {COLOR_NAME[wine.color]} · {wine.wineryName}
                  </span>
                  <span className="wine-similar-link">
                    Εξερεύνησε το κρασί
                    <ArrowIcon />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Level-1 FoodCategory — ήδη υπάρχουσα λογική, ΑΜΕΤΑΒΛΗΤΗ.
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
