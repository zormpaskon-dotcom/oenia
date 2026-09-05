import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ShareCard from "@/components/ShareCard";
import CellarButtons from "@/components/CellarButtons";
import ReviewForm from "@/components/ReviewForm";
import JsonLd from "@/components/JsonLd";
import WinePhoto from "@/components/WinePhoto";
import { reportReviewAction } from "@/lib/actions/reviews";
import { APPELLATION_LABEL, COLOR_NAME, reviewCountLabel, STYLE_NAME } from "@/lib/labels";

async function getWine(slug: string) {
  return prisma.wine.findUnique({
    where: { slug },
    include: {
      winery: { select: { name: true, slug: true, subRegion: true, foundedYear: true, websiteUrl: true } },
      region: { select: { name: true, slug: true } },
      varieties: { include: { variety: { select: { name: true, slug: true } } } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const wine = await getWine(slug);
  if (!wine) return {};
  return {
    title: `${wine.name} — ${wine.winery.name} | Oenia`,
    description: wine.description ?? undefined,
  };
}

export default async function WineDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const wine = await getWine(slug);
  if (!wine) notFound();

  const session = await auth();

  const [cellarEntry, reviews] = await Promise.all([
    session?.user
      ? prisma.cellarEntry.findUnique({
          where: { userId_wineId: { userId: session.user.id, wineId: wine.id } },
        })
      : null,
    prisma.review.findMany({
      where: { wineId: wine.id, status: ContentStatus.PUBLISHED },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const myReview = session?.user ? reviews.find((r) => r.userId === session.user.id) : undefined;

  const varietyLabel = wine.varieties.map((v) => v.variety.name).join(", ");
  const filledDots = Math.round(wine.avgRating);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: wine.name,
          description: wine.description ?? undefined,
          brand: { "@type": "Brand", name: wine.winery.name },
          ...(wine.reviewCount > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: wine.avgRating,
                  reviewCount: wine.reviewCount,
                },
              }
            : {}),
        }}
      />
      <div className="wrap">
        <p className="breadcrumb">
          <Link href="/">Αρχική</Link> / <Link href="/krasia">Ετικέτες</Link> /{" "}
          <Link href={`/perioches/${wine.region.slug}`}>{wine.region.name}</Link> / {wine.name}
        </p>
      </div>

      <div className="wrap wine-header">
        <WinePhoto labelImage={wine.labelImage} color={wine.color} wineName={wine.name} className="wine-photo" sizes="320px" />
        <div>
          <span className="region-tag">
            {wine.region.name}
            {varietyLabel ? ` · ${varietyLabel}` : ""}
            {wine.appellation ? ` · ${APPELLATION_LABEL[wine.appellation]}` : ""}
          </span>
          <h1>{wine.name}</h1>
          <Link href={`/oinopoieia/${wine.winery.slug}`} className="winery-link">
            {wine.winery.name}
          </Link>

          <div className="rating-block">
            <div className="dots-lg">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={`dot-lg${i < filledDots ? " filled" : ""}`} />
              ))}
            </div>
            <span className="rating-count">
              {wine.avgRating.toFixed(1).replace(".", ",")} · {reviewCountLabel(wine.reviewCount)}
            </span>
            <ShareCard
              data={{
                name: wine.name,
                winery: wine.winery.name,
                region: wine.region.name,
                variety: varietyLabel || wine.region.name,
                rating: wine.avgRating.toFixed(1).replace(".", ","),
              }}
            />
          </div>

          {session?.user ? (
            <CellarButtons wineId={wine.id} wineSlug={wine.slug} currentStatus={cellarEntry?.status ?? null} />
          ) : (
            <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "4px 0 26px" }}>
              <Link href="/login" className="link-underline" style={{ color: "var(--wine)" }}>
                Συνδέσου
              </Link>{" "}
              για να το προσθέσεις στο κελάρι σου.
            </p>
          )}

          {wine.description && <p className="desc">{wine.description}</p>}

          <div className="fact-grid">
            <div className="fact">
              <span className="label">Χρονιά</span>
              <span className="value">{wine.vintage ?? "—"}</span>
            </div>
            <div className="fact">
              <span className="label">Αλκοόλ</span>
              <span className="value">{wine.abv ? `${wine.abv}%` : "—"}</span>
            </div>
            <div className="fact">
              <span className="label">Χρώμα</span>
              <span className="value">
                {COLOR_NAME[wine.color]} {STYLE_NAME[wine.style] ?? ""}
              </span>
            </div>
            <div className="fact">
              <span className="label">Τιμή</span>
              <span className="value">
                {wine.winery.websiteUrl ? (
                  <a
                    href={wine.winery.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline"
                    style={{ color: "var(--wine)" }}
                  >
                    Δες στο site του οινοποιείου
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
          </div>

          {wine.tastingNotes && (
            <div className="tasting-notes">
              <h3>Σημειώσεις γεύσης</h3>
              <p>
                {wine.tastingNotes}
                {wine.servingTemp ? ` Καλύτερα σερβιρισμένο στους ${wine.servingTemp}.` : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {wine.foodPairings.length > 0 && (
        <section>
          <div className="wrap">
            <h2 className="section-title">Ταιριάζει με</h2>
            <div className="pairing-row">
              {wine.foodPairings.map((food) => (
                <span className="pairing-chip" key={food}>
                  {food}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="wave-divider" aria-hidden="true">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none">
          <path d="M0,32 C 240,64 480,0 720,28 C 960,56 1200,8 1440,32 L1440,64 L0,64 Z" fill="var(--paper-alt)" />
        </svg>
      </div>
      <section style={{ background: "var(--paper-alt)" }}>
        <div className="wrap">
          <h2 className="section-title">Το οινοποιείο</h2>
          <Link href={`/oinopoieia/${wine.winery.slug}`} className="winery-card">
            <div className="winery-thumb" />
            <div>
              <h3>{wine.winery.name}</h3>
              <p>
                {wine.region.name}
                {wine.winery.subRegion ? `, ${wine.winery.subRegion}` : ""}
                {wine.winery.foundedYear ? ` · Από το ${wine.winery.foundedYear}` : ""}
              </p>
            </div>
          </Link>
        </div>
      </section>
      <div className="wave-divider flip" aria-hidden="true">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none">
          <path d="M0,32 C 240,64 480,0 720,28 C 960,56 1200,8 1440,32 L1440,64 L0,64 Z" fill="var(--paper-alt)" />
        </svg>
      </div>

      <section>
        <div className="wrap">
          <h2 className="section-title">Αξιολογήσεις χρηστών</h2>

          {session?.user ? (
            <ReviewForm
              wineId={wine.id}
              wineSlug={wine.slug}
              existing={myReview ? { rating: myReview.rating, note: myReview.note } : undefined}
            />
          ) : (
            <p style={{ color: "var(--muted)", fontSize: 14.5, marginBottom: 32 }}>
              <Link href="/login" className="link-underline" style={{ color: "var(--wine)" }}>
                Συνδέσου
              </Link>{" "}
              για να αφήσεις τη δική σου αξιολόγηση.
            </p>
          )}

          {reviews.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 14.5 }}>Δεν υπάρχουν ακόμα αξιολογήσεις χρηστών.</p>
          ) : (
            <div className="reviews">
              {reviews.map((review) => (
                <div className="review" key={review.id}>
                  <div className="review-head">
                    <span className="review-user">{review.user.name}</span>
                    <span className="review-date">
                      {new Intl.DateTimeFormat("el-GR", { month: "long", year: "numeric" }).format(
                        review.createdAt
                      )}
                    </span>
                  </div>
                  <div className="stars">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} className={`dot-sm${i < review.rating ? " filled" : ""}`} />
                    ))}
                  </div>
                  {review.note && <p>{review.note}</p>}
                  {session?.user && review.userId !== session.user.id && (
                    <div style={{ marginTop: 8 }}>
                      {review.isFlagged ? (
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>Αναφέρθηκε</span>
                      ) : (
                        <form action={reportReviewAction}>
                          <input type="hidden" name="reviewId" value={review.id} />
                          <input type="hidden" name="wineSlug" value={wine.slug} />
                          <button
                            type="submit"
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              fontSize: 12,
                              color: "var(--muted)",
                              textDecoration: "underline",
                              cursor: "pointer",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            Αναφορά
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
