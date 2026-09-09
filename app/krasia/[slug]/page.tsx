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
import { APPELLATION_LABEL, COLOR_NAME, STYLE_NAME, reviewCountLabel } from "@/lib/labels";

function ArrowIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.73} viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8h21M15 1l7 7-7 7" />
    </svg>
  );
}

const TASTE_DIMENSIONS = [
  { key: "acidity", label: "Οξύτητα" },
  { key: "body", label: "Σώμα" },
  { key: "tannins", label: "Τανίνες" },
  { key: "aromaIntensity", label: "Ένταση αρωμάτων" },
  { key: "ageingPotential", label: "Δυναμικό παλαίωσης" },
] as const;

async function getWine(slug: string) {
  return prisma.wine.findUnique({
    where: { slug },
    include: {
      winery: {
        select: {
          name: true,
          slug: true,
          subRegion: true,
          foundedYear: true,
          description: true,
          coverImage: true,
          region: { select: { name: true, slug: true } },
        },
      },
      region: { select: { name: true, slug: true, description: true, heroImage: true } },
      varieties: { include: { variety: true } },
    },
  });
}

const RELATED_WINE_INCLUDE = {
  winery: { select: { name: true, slug: true } },
  region: { select: { name: true, slug: true } },
  varieties: { include: { variety: { select: { name: true } } } },
} as const;

async function getRelatedWines(wine: NonNullable<Awaited<ReturnType<typeof getWine>>>) {
  const varietySlug = wine.varieties[0]?.variety.slug;
  const [sameWinery, sameVariety] = await Promise.all([
    prisma.wine.findMany({
      where: { wineryId: wine.wineryId, id: { not: wine.id }, status: ContentStatus.PUBLISHED },
      take: 4,
      include: RELATED_WINE_INCLUDE,
    }),
    varietySlug
      ? prisma.wine.findMany({
          where: {
            id: { not: wine.id },
            status: ContentStatus.PUBLISHED,
            varieties: { some: { variety: { slug: varietySlug } } },
          },
          take: 4,
          include: RELATED_WINE_INCLUDE,
        })
      : Promise.resolve([]),
  ]);

  const seen = new Set([wine.id]);
  const related = [...sameWinery, ...sameVariety].filter((w) => (seen.has(w.id) ? false : (seen.add(w.id), true)));

  return { related: related.slice(0, 3) };
}

/** Όλες οι ξεχωριστές ποικιλίες στον κατάλογο ενός οινοποιείου — ανεξάρτητο,
 * πλήρες ερώτημα (όχι απόσπασμα από τα "παρόμοια κρασιά", που περιορίζονται
 * σε λίγα αποτελέσματα και θα άφηναν έξω ποικιλίες από τα υπόλοιπα κρασιά). */
async function getWineryVarieties(wineryId: string) {
  const rows = await prisma.variety.findMany({
    where: { wines: { some: { wine: { wineryId, status: ContentStatus.PUBLISHED } } } },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return rows.map((r) => r.name);
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

  const [cellarEntry, reviews, { related: relatedWines }, wineryGrapes] = await Promise.all([
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
    getRelatedWines(wine),
    getWineryVarieties(wine.wineryId),
  ]);

  const myReview = session?.user ? reviews.find((r) => r.userId === session.user.id) : undefined;

  const varietyLabel = wine.varieties.map((v) => v.variety.name).join(", ");
  const filledDots = Math.round(wine.avgRating);
  const blend = [...wine.varieties].sort((a, b) => (b.percentage ?? -1) - (a.percentage ?? -1));
  const mainVariety = blend[0]?.variety;

  const tasteBars = mainVariety
    ? TASTE_DIMENSIONS.map((d) => ({ ...d, value: mainVariety[d.key] })).filter(
        (d): d is (typeof TASTE_DIMENSIONS)[number] & { value: number } => d.value != null
      )
    : [];

  // Σύντομες, editorial φράσεις από τις πραγματικές σημειώσεις γεύσης —
  // σπάει σε σημεία στίξης ή φυσικούς συνδέσμους ("με"/"και"), ποτέ μέσα σε
  // λέξη, ώστε ένα κείμενο χωρίς κόμματα να μη βγαίνει ως 1-2 μακριές προτάσεις.
  const expectTags = wine.tastingNotes
    ? wine.tastingNotes
        .split(/[.,]|\s+(?:με|και)\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 2)
        .slice(0, 9)
    : [];

  const techRows: { label: string; value: string }[] = [
    { label: "Χρονιά", value: wine.vintage ? String(wine.vintage) : "—" },
    { label: "Ποικιλία", value: varietyLabel || "—" },
    { label: "Περιοχή", value: wine.region.name },
    { label: "Ονομασία", value: wine.appellation ? APPELLATION_LABEL[wine.appellation] : "—" },
    { label: "Αλκοόλ", value: wine.abv ? `${wine.abv}%` : "—" },
    { label: "Θερμοκρασία σερβιρίσματος", value: wine.servingTemp ?? "—" },
  ];

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

      {/* 1 — Hero: στα κινητά ο τίτλος προηγείται του μπουκαλιού (σειρά:
          τίτλος → φωτογραφία → δευτερεύοντα στοιχεία), γι' αυτό είναι
          χωρισμένο σε δύο blocks που στο desktop ξαναενώνονται οπτικά
          σε μία στήλη δίπλα στη φωτογραφία μέσω CSS grid. */}
      <div className="wrap wine-hero">
        <div className="wine-hero-title">
          <p className="wine-hero-eyebrow">
            {COLOR_NAME[wine.color]} κρασί{wine.vintage ? ` · ${wine.vintage}` : ""}
          </p>
          <h1 className="wine-hero-name">{wine.name}</h1>
          <Link href={`/oinopoieia/${wine.winery.slug}`} className="wine-hero-winery">
            {wine.winery.name}
          </Link>
          <p className="wine-hero-place">
            <Link href={`/perioches/${wine.region.slug}`}>{wine.region.name}</Link> · Ελλάδα
          </p>
        </div>

        <WinePhoto
          labelImage={wine.labelImage}
          color={wine.color}
          wineName={wine.name}
          className="wine-hero-photo reveal img-reveal"
          sizes="340px"
        />

        <div className="wine-hero-secondary">
          <div className="wine-save-row">
            <div className="dots-lg" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={`dot-lg${i < filledDots ? " filled" : ""}`} />
              ))}
            </div>
            <span className="rating-count">
              {wine.avgRating.toFixed(1).replace(".", ",")} · {reviewCountLabel(wine.reviewCount)}
            </span>
          </div>

          {session?.user ? (
            <div className="wine-save-row">
              <CellarButtons wineId={wine.id} wineSlug={wine.slug} currentStatus={cellarEntry?.status ?? null} />
            </div>
          ) : (
            <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "4px 0 26px" }}>
              <Link href="/login" className="link-underline" style={{ color: "var(--wine)" }}>
                Συνδέσου
              </Link>{" "}
              για να το προσθέσεις στο κελάρι σου.
            </p>
          )}

          <div className="wine-save-row">
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

          <a href="#overview" className="wine-hero-scroll">
            Εξερεύνησε το κρασί
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v16M5 13l7 7 7-7" />
            </svg>
          </a>
        </div>
      </div>

      {/* 2 — Γρήγορα στοιχεία */}
      <div className="wrap">
        <div className="wine-quick-strip">
          <div className="wine-quick-item">
            <span className="l">Ποικιλία</span>
            <span className="v">{varietyLabel || "—"}</span>
          </div>
          <div className="wine-quick-item">
            <span className="l">Περιοχή</span>
            <span className="v">{wine.region.name}</span>
          </div>
          <div className="wine-quick-item">
            <span className="l">Χρώμα</span>
            <span className="v">{COLOR_NAME[wine.color]}</span>
          </div>
          <div className="wine-quick-item">
            <span className="l">Στυλ</span>
            <span className="v">{STYLE_NAME[wine.style]}</span>
          </div>
          <div className="wine-quick-item">
            <span className="l">Αλκοόλ</span>
            <span className="v">{wine.abv ? `${wine.abv}%` : "—"}</span>
          </div>
        </div>
      </div>

      {/* Sticky δευτερεύον μενού */}
      <nav className="wine-subnav">
        <div className="wrap wine-subnav-inner">
          <span className="wine-subnav-name">{wine.name}</span>
          <a href="#overview">Το κρασί</a>
          <a href="#taste">Γεύση</a>
          <a href="#place">Ο τόπος</a>
          <a href="#winery">Το οινοποιείο</a>
        </div>
      </nav>

      {/* 4 — Το κρασί */}
      <section id="overview">
        <div className="wrap">
          <div className="wine-overview-copy reveal home-reveal">
            <h2 className="section-title">Το κρασί</h2>
            {wine.description && <p>{wine.description}</p>}

            {blend.length > 1 && (
              <div className="wine-blend-row">
                {blend.map((v) => (
                  <Link href={`/poikilies/${v.variety.slug}`} className="wine-blend-chip" key={v.variety.slug}>
                    {v.percentage ? `${v.percentage}% ` : ""}
                    {v.variety.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {(wine.vineyardNotes || wine.winemakingNotes) && (
            <div className="wine-notes-grid">
              {wine.vineyardNotes && (
                <div className="wine-note-block reveal home-reveal">
                  <h4>Ο αμπελώνας</h4>
                  <p>{wine.vineyardNotes}</p>
                </div>
              )}
              {wine.winemakingNotes && (
                <div className="wine-note-block reveal home-reveal">
                  <h4>Η οινοποίηση</h4>
                  <p>{wine.winemakingNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 7 — Προφίλ γεύσης */}
      {tasteBars.length > 0 && (
        <section style={{ background: "var(--paper-alt)" }}>
          <div className="wrap">
            <h2 className="section-title">Προφίλ γεύσης</h2>
            {mainVariety && <p className="wine-taste-head">{mainVariety.name}</p>}
            <div className="wine-taste-bars reveal home-reveal">
              {tasteBars.map((bar) => (
                <div className="wine-taste-bar reveal" key={bar.key} style={{ "--pct": `${bar.value}%` } as React.CSSProperties}>
                  <div className="wine-taste-bar-label">
                    <span>{bar.label}</span>
                    <span>{bar.value}</span>
                  </div>
                  <div className="wine-taste-bar-track">
                    <div className="wine-taste-bar-fill" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5 — Τι να περιμένεις */}
      {expectTags.length > 0 && (
        <section id="taste">
          <div className="wrap">
            <h2 className="section-title">Τι να περιμένεις</h2>
            <div className="wine-expect">
              {expectTags.map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="wine-expect-tag reveal home-reveal"
                  style={{ transitionDelay: `${Math.min(i * 70, 420)}ms` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8 — Ταιριάζει με */}
      {wine.foodPairings.length > 0 && (
        <section>
          <div className="wrap">
            <h2 className="section-title">Ταιριάζει με</h2>
            <div className="wine-pairing-tags">
              {wine.foodPairings.map((food) => (
                <span className="wine-pairing-tag" key={food}>
                  {food}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6 — Ο τόπος */}
      <section id="place" style={{ background: "var(--paper-alt)" }}>
        <div className="wrap">
          <div className={`wine-split${wine.region.heroImage ? "" : " no-photo"}`}>
            <div className="wine-split-copy reveal home-reveal">
              <p className="wine-split-eyebrow">Ο τόπος</p>
              <h2 className="wine-split-title">{wine.region.name}</h2>
              {wine.region.description && <p>{wine.region.description}</p>}
              <Link href={`/perioches/${wine.region.slug}`} className="link-arrow">
                Εξερεύνησε την περιοχή
                <ArrowIcon />
              </Link>
            </div>
            {wine.region.heroImage && (
              <div className="wine-split-photo">
                <img className="reveal img-reveal" src={wine.region.heroImage} alt={wine.region.name} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7 — Το οινοποιείο */}
      <section id="winery">
        <div className="wrap">
          <div className={`wine-split${wine.winery.coverImage ? "" : " no-photo"}`}>
            <div className="wine-split-copy reveal home-reveal">
              <p className="wine-split-eyebrow">Το οινοποιείο</p>
              <h2 className="wine-split-title">{wine.winery.name}</h2>
              {wine.winery.description && <p>{wine.winery.description}</p>}
              <div className="wine-tech-table" style={{ marginBottom: 28 }}>
                <div className="wine-tech-row">
                  <dt>Ίδρυση</dt>
                  <dd>{wine.winery.foundedYear ?? "—"}</dd>
                </div>
                <div className="wine-tech-row">
                  <dt>Περιοχή</dt>
                  <dd>
                    {wine.winery.region.name}
                    {wine.winery.subRegion ? `, ${wine.winery.subRegion}` : ""}
                  </dd>
                </div>
                {wineryGrapes.length > 0 && (
                  <div className="wine-tech-row">
                    <dt>Ποικιλίες</dt>
                    <dd>{wineryGrapes.join(", ")}</dd>
                  </div>
                )}
              </div>
              <Link href={`/oinopoieia/${wine.winery.slug}`} className="link-arrow">
                Εξερεύνησε το οινοποιείο
                <ArrowIcon />
              </Link>
            </div>
            {wine.winery.coverImage && (
              <div className="wine-split-photo">
                <img className="reveal img-reveal" src={wine.winery.coverImage} alt={wine.winery.name} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 9 — Τεχνικά στοιχεία */}
      <section style={{ background: "var(--paper-alt)" }}>
        <div className="wrap">
          <h2 className="section-title">Τεχνικά στοιχεία</h2>
          <dl className="wine-tech-table">
            {techRows.map((row) => (
              <div className="wine-tech-row" key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 10 — Παρόμοια κρασιά */}
      {relatedWines.length > 0 && (
        <section>
          <div className="wrap">
            <h2 className="section-title">Παρόμοιες ετικέτες</h2>
            <div className="wine-similar-grid">
              {relatedWines.map((related) => {
                const relatedVariety = related.varieties[0]?.variety.name;
                return (
                  <Link key={related.id} href={`/krasia/${related.slug}`} className="wine-similar-card reveal">
                    <WinePhoto
                      labelImage={related.labelImage}
                      color={related.color}
                      wineName={related.name}
                      className="wine-similar-photo"
                      sizes="150px"
                    />
                    <h3>{related.name}</h3>
                    <span className="wine-similar-meta">
                      {related.winery.name} · {related.region.name}
                      {relatedVariety ? ` · ${relatedVariety}` : ""}
                    </span>
                    <span className="wine-similar-link">
                      Εξερεύνηση κρασιού
                      <ArrowIcon />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Συνέχισε την εξερεύνηση */}
      <section style={{ background: "var(--paper-alt)" }}>
        <div className="wrap">
          <h2 className="section-title">Συνέχισε την εξερεύνηση</h2>
          <div className="winery-grape-list">
            <Link href={`/krasia?winery=${wine.winery.slug}`} className="winery-grape-row">
              Περισσότερα από {wine.winery.name}
              <ArrowIcon size={16} />
            </Link>
            <Link href={`/krasia?region=${wine.region.slug}`} className="winery-grape-row">
              Περισσότερα από {wine.region.name}
              <ArrowIcon size={16} />
            </Link>
            {blend[0] && (
              <Link href={`/poikilies/${blend[0].variety.slug}`} className="winery-grape-row">
                Εξερεύνησε το {blend[0].variety.name}
                <ArrowIcon size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

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
