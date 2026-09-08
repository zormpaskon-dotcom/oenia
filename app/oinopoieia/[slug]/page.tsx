import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import JsonLd from "@/components/JsonLd";
import WinePhoto from "@/components/WinePhoto";
import { COLOR_NAME } from "@/lib/labels";

// Γενική, μη-συγκεκριμένη φωτογραφία οινοποιείου/αμπελώνα — χρησιμοποιείται
// μόνο όταν το οινοποιείο δεν έχει ακόμα δικό του coverImage στη βάση, ώστε
// το hero να μην μένει ποτέ άδειο. Δεν εμφανίζεται ποτέ ως «η φωτογραφία
// του συγκεκριμένου κτήματος» — απλώς σαν ατμοσφαιρικό, γενικό φόντο.
const FALLBACK_WINERY_PHOTO = "/home/explore-wineries.jpg";

function ArrowIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.73} viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8h21M15 1l7 7-7 7" />
    </svg>
  );
}

async function getWinery(slug: string) {
  return prisma.winery.findUnique({
    where: { slug },
    include: {
      region: true,
      wines: {
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { name: "asc" },
        include: { varieties: { include: { variety: { select: { name: true, slug: true } } } } },
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
  const winery = await getWinery(slug);
  if (!winery) return {};
  return {
    title: `${winery.name} — ${winery.region.name} | Oenia`,
    description: winery.description ?? undefined,
  };
}

export default async function WineryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const winery = await getWinery(slug);
  if (!winery) notFound();

  const grapes = Array.from(
    new Map(winery.wines.flatMap((w) => w.varieties.map((v) => [v.variety.slug, v.variety] as const))).values()
  ).sort((a, b) => a.name.localeCompare(b.name, "el"));

  const storyParagraphs = (winery.story ?? winery.description ?? "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Η πρώτη πρόταση της φιλοσοφίας μεγαλώνει σε editorial statement — δεν
  // είναι φανταστικό απόσπασμα, είναι κυριολεκτικά το ξεκίνημα του
  // υπαρκτού κειμένου philosophy από τη βάση.
  const philosophySentences = winery.philosophy?.split(/(?<=[.!;])\s+/).filter(Boolean) ?? [];
  const philosophyQuote = philosophySentences[0];
  const philosophyRest = philosophySentences.slice(1).join(" ");

  const featuredWines = winery.wines.filter((w) => w.labelImage).slice(0, 3);

  const hasVisitInfo = winery.acceptsVisitors || !!winery.visitingHours || !!winery.visitingNotes;

  const techRows: { label: string; value: string }[] = [
    ...(winery.foundedYear ? [{ label: "Ίδρυση", value: String(winery.foundedYear) }] : []),
    { label: "Περιοχή", value: winery.region.name + (winery.subRegion ? `, ${winery.subRegion}` : "") },
    ...(winery.vineyardHectares ? [{ label: "Έκταση αμπελώνα", value: `${winery.vineyardHectares} εκτάρια` }] : []),
    ...(winery.isOrganic ? [{ label: "Βιολογική καλλιέργεια", value: "Ναι" }] : []),
    ...(winery.isBiodynamic ? [{ label: "Βιοδυναμική καλλιέργεια", value: "Ναι" }] : []),
    ...(grapes.length > 0 ? [{ label: "Ποικιλίες", value: String(grapes.length) }] : []),
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Winery",
          name: winery.name,
          description: winery.description ?? undefined,
          url: winery.websiteUrl ?? undefined,
          telephone: winery.phone ?? undefined,
          address: winery.address ? { "@type": "PostalAddress", streetAddress: winery.address } : undefined,
          geo:
            winery.latitude != null && winery.longitude != null
              ? { "@type": "GeoCoordinates", latitude: winery.latitude, longitude: winery.longitude }
              : undefined,
        }}
      />

      <div className="wrap">
        <p className="breadcrumb">
          <Link href="/">Αρχική</Link> / <Link href="/oinopoieia">Οινοποιεία</Link> / {winery.name}
        </p>
      </div>

      {/* 2 — Hero */}
      <div className="wrap winery-hero">
        <div>
          <p className="wine-hero-eyebrow">
            Οινοποιείο · {winery.region.name}
          </p>
          <h1 className="wine-hero-name">{winery.name}</h1>
          <p className="wine-hero-place">
            {winery.region.name}
            {winery.subRegion ? `, ${winery.subRegion}` : ""} · Ελλάδα
            {winery.foundedYear ? ` · Από το ${winery.foundedYear}` : ""}
          </p>

          <div className="winery-badges-row">
            {winery.isVerified && <span className="winery-badge">Επαληθευμένο προφίλ</span>}
            {winery.isOrganic && <span className="winery-badge">Βιολογική καλλιέργεια</span>}
            {winery.isBiodynamic && <span className="winery-badge">Βιοδυναμική καλλιέργεια</span>}
            {winery.acceptsVisitors && <span className="winery-badge">Δέχεται επισκέπτες</span>}
          </div>
        </div>

        <div className="winery-hero-photo reveal img-reveal">
          <img src={winery.coverImage ?? FALLBACK_WINERY_PHOTO} alt="" />
        </div>
      </div>

      {/* 5 — Γρήγορα στοιχεία */}
      <div className="wrap">
        <div className="wine-quick-strip">
          {winery.foundedYear && (
            <div className="wine-quick-item">
              <span className="l">Ίδρυση</span>
              <span className="v">{winery.foundedYear}</span>
            </div>
          )}
          <div className="wine-quick-item">
            <span className="l">Περιοχή</span>
            <span className="v">{winery.region.name}</span>
          </div>
          {grapes.length > 0 && (
            <div className="wine-quick-item">
              <span className="l">Ποικιλίες</span>
              <span className="v">{grapes.length}</span>
            </div>
          )}
          <div className="wine-quick-item">
            <span className="l">Ετικέτες</span>
            <span className="v">{winery.wines.length}</span>
          </div>
        </div>
      </div>

      {/* Sticky δευτερεύον μενού */}
      <nav className="wine-subnav">
        <div className="wrap wine-subnav-inner">
          <span className="wine-subnav-name">{winery.name}</span>
          {storyParagraphs.length > 0 && <a href="#story">Ιστορία</a>}
          <a href="#place">Ο τόπος</a>
          {philosophyQuote && <a href="#philosophy">Φιλοσοφία</a>}
          {featuredWines.length > 0 && <a href="#wines">Κρασιά</a>}
          {grapes.length > 0 && <a href="#grapes">Ποικιλίες</a>}
          {hasVisitInfo && <a href="#visit">Επίσκεψη</a>}
        </div>
      </nav>

      {/* 7 — Η ιστορία */}
      {storyParagraphs.length > 0 && (
        <section id="story">
          <div className="wrap">
            <h2 className="section-title">Η ιστορία</h2>
            <div className="winery-story reveal home-reveal">
              {storyParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8 — Ο τόπος */}
      <section id="place" style={{ background: "var(--paper-alt)" }}>
        <div className="wrap">
          <div className={`wine-split${winery.region.heroImage ? "" : " no-photo"}`}>
            <div className="wine-split-copy reveal home-reveal">
              <p className="wine-split-eyebrow">Ο τόπος</p>
              <h2 className="wine-split-title">{winery.region.name}</h2>
              {winery.region.description && <p>{winery.region.description}</p>}
              <Link href={`/perioches/${winery.region.slug}`} className="link-arrow">
                Εξερεύνησε την περιοχή
                <ArrowIcon />
              </Link>
            </div>
            {winery.region.heroImage && (
              <div className="wine-split-photo">
                <img className="reveal img-reveal" src={winery.region.heroImage} alt={winery.region.name} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 9 — Η φιλοσοφία */}
      {philosophyQuote && (
        <section id="philosophy">
          <div className="wrap">
            <h2 className="section-title">Η φιλοσοφία</h2>
            <div className="winery-philosophy reveal home-reveal">
              <p className="winery-philosophy-quote">{philosophyQuote}</p>
              {philosophyRest && (
                <div className="winery-philosophy-rest">
                  <p>{philosophyRest}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 10 — Τα κρασιά */}
      {featuredWines.length > 0 && (
        <section id="wines" style={{ background: "var(--paper-alt)" }}>
          <div className="wrap">
            <h2 className="section-title">Τα κρασιά</h2>
            <div className="wine-similar-grid">
              {featuredWines.map((wine) => {
                const variety = wine.varieties[0]?.variety.name;
                return (
                  <Link key={wine.id} href={`/krasia/${wine.slug}`} className="wine-similar-card reveal">
                    <WinePhoto
                      labelImage={wine.labelImage}
                      color={wine.color}
                      wineName={wine.name}
                      className="wine-similar-photo"
                      sizes="150px"
                    />
                    <h3>{wine.name}</h3>
                    <span className="wine-similar-meta">
                      {COLOR_NAME[wine.color]}
                      {variety ? ` · ${variety}` : ""} · {winery.region.name}
                    </span>
                    <span className="wine-similar-link">
                      Εξερεύνηση κρασιού
                      <ArrowIcon />
                    </span>
                  </Link>
                );
              })}
            </div>
            <p style={{ marginTop: 40 }}>
              <Link href={`/krasia?winery=${winery.slug}`} className="link-arrow">
                Δες όλα τα κρασιά ({winery.wines.length})
                <ArrowIcon />
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* 11 — Οι ποικιλίες */}
      {grapes.length > 0 && (
        <section id="grapes">
          <div className="wrap">
            <h2 className="section-title">Οι ποικιλίες</h2>
            <div className="winery-grape-list">
              {grapes.map((v) => (
                <Link key={v.slug} href={`/poikilies/${v.slug}`} className="winery-grape-row">
                  {v.name}
                  <ArrowIcon size={16} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 12 — Επισκέψου το οινοποιείο */}
      {hasVisitInfo && (
        <section id="visit" style={{ background: "var(--paper-alt)" }}>
          <div className="wrap">
            <h2 className="section-title">Επισκέψου το οινοποιείο</h2>
            {winery.visitingHours && (
              <p style={{ fontSize: 15.5, color: "var(--ink)", marginBottom: 12 }}>
                <strong>Ώρες επίσκεψης:</strong> {winery.visitingHours}
              </p>
            )}
            {winery.visitingNotes && (
              <p style={{ fontSize: 15.5, color: "var(--muted)", maxWidth: "60ch", lineHeight: 1.75 }}>
                {winery.visitingNotes}
              </p>
            )}
          </div>
        </section>
      )}

      {/* 13 — Τεχνικά στοιχεία */}
      {techRows.length > 0 && (
        <section>
          <div className="wrap">
            <h2 className="section-title">Στοιχεία οινοποιείου</h2>
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
      )}

      {/* 14 — Επίσημη ιστοσελίδα */}
      {winery.websiteUrl && (
        <div className="wrap">
          <div className="winery-official">
            <p>Θέλεις να μάθεις περισσότερα;</p>
            <a href={winery.websiteUrl} target="_blank" rel="noopener noreferrer">
              Επίσημη ιστοσελίδα →
            </a>
          </div>
        </div>
      )}

      {/* Συνέχισε την εξερεύνηση */}
      <section style={{ background: "var(--paper-alt)" }}>
        <div className="wrap">
          <h2 className="section-title">Συνέχισε την εξερεύνηση</h2>
          <div className="winery-grape-list">
            {winery.wines.length > 0 && (
              <Link href={`/krasia?winery=${winery.slug}`} className="winery-grape-row">
                Εξερεύνησε τα κρασιά του
                <ArrowIcon size={16} />
              </Link>
            )}
            <Link href={`/perioches/${winery.region.slug}`} className="winery-grape-row">
              Εξερεύνησε την περιοχή {winery.region.name}
              <ArrowIcon size={16} />
            </Link>
            {grapes[0] && (
              <Link href={`/poikilies/${grapes[0].slug}`} className="winery-grape-row">
                Εξερεύνησε το {grapes[0].name}
                <ArrowIcon size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
