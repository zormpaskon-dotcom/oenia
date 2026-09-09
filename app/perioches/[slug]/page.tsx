import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import WinePhoto from "@/components/WinePhoto";
import { APPELLATION_LABEL, COLOR_NAME, MACRO_REGION_LABEL } from "@/lib/labels";

// Γενική, μη-συγκεκριμένη ατμοσφαιρική φωτογραφία — χρησιμοποιείται μόνο όταν
// η περιοχή δεν έχει ακόμα δικό της heroImage στη βάση, ώστε το hero να μην
// μένει ποτέ άδειο. Δεν εμφανίζεται ποτέ ως «η φωτογραφία της συγκεκριμένης
// περιοχής» — απλώς σαν γενικό, ατμοσφαιρικό φόντο (ίδιο πνεύμα με το
// FALLBACK_WINERY_PHOTO στη σελίδα οινοποιείου).
const FALLBACK_REGION_PHOTO = "/home/explore-regions.jpg";

function ArrowIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.73} viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8h21M15 1l7 7-7 7" />
    </svg>
  );
}

async function getRegion(slug: string) {
  return prisma.region.findUnique({
    where: { slug },
    include: {
      wines: {
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { avgRating: "desc" },
        include: {
          winery: { select: { name: true, slug: true } },
          varieties: { include: { variety: { select: { name: true, slug: true } } } },
        },
      },
      wineries: {
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { name: "asc" },
        select: {
          name: true,
          slug: true,
          subRegion: true,
          description: true,
          coverImage: true,
          foundedYear: true,
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
  const region = await getRegion(slug);
  if (!region) return {};
  return {
    title: `${region.name} — Περιοχή | Oenia`,
    description: region.description ?? undefined,
  };
}

export default async function RegionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const region = await getRegion(slug);
  if (!region) notFound();

  // Οι ποικιλίες της περιοχής υπολογίζονται από τα πραγματικά κρασιά της
  // (όχι από τη σχέση Region.varieties, που είναι αραιά συμπληρωμένη στη
  // βάση) — ίδια τεχνική με τη σελίδα οινοποιείου.
  const grapes = Array.from(
    new Map(region.wines.flatMap((w) => w.varieties.map((v) => [v.variety.slug, v.variety] as const))).values()
  ).sort((a, b) => a.name.localeCompare(b.name, "el"));

  const featuredWines = region.wines.slice(0, 3);

  const techRows: { label: string; value: string }[] = [
    ...(region.appellation ? [{ label: "Ονομασία", value: APPELLATION_LABEL[region.appellation] }] : []),
    ...(region.recognizedYear ? [{ label: "Αναγνώριση ΠΟΠ/ΠΓΕ", value: String(region.recognizedYear) }] : []),
    ...(region.altitudeMin || region.altitudeMax
      ? [{ label: "Υψόμετρο", value: `${region.altitudeMin ?? "—"}–${region.altitudeMax ?? "—"} μ.` }]
      : []),
    ...(region.areaHectares ? [{ label: "Έκταση αμπελώνων", value: `~${region.areaHectares} εκτάρια` }] : []),
    ...(region.climate ? [{ label: "Κλίμα", value: region.climate }] : []),
    ...(region.soil ? [{ label: "Έδαφος", value: region.soil }] : []),
  ];

  const heroPhoto = region.heroImage ?? FALLBACK_REGION_PHOTO;

  return (
    <>
      <div className="wrap">
        <p className="breadcrumb">
          <Link href="/">Αρχική</Link> / <Link href="/perioches">Περιοχές</Link> / {region.name}
        </p>
      </div>

      {/* Hero */}
      <div className="wrap winery-hero">
        <div>
          <p className="wine-hero-eyebrow">
            Περιοχή · {MACRO_REGION_LABEL[region.macroRegion] ?? region.macroRegion}
          </p>
          <h1 className="wine-hero-name">{region.name}</h1>
          <p className="wine-hero-place">
            Ελλάδα
            {region.appellation ? ` · ${APPELLATION_LABEL[region.appellation]}` : ""}
            {region.recognizedYear ? ` · Αναγνωρισμένη από το ${region.recognizedYear}` : ""}
          </p>
        </div>

        <div className="winery-hero-photo reveal img-reveal">
          <img src={heroPhoto} alt="" />
        </div>
      </div>

      {/* Γρήγορα στοιχεία */}
      <div className="wrap">
        <div className="wine-quick-strip">
          {grapes.length > 0 && (
            <div className="wine-quick-item">
              <span className="l">Ποικιλίες</span>
              <span className="v">{grapes.length}</span>
            </div>
          )}
          {region.wines.length > 0 && (
            <div className="wine-quick-item">
              <span className="l">Ετικέτες</span>
              <span className="v">{region.wines.length}</span>
            </div>
          )}
          {region.wineries.length > 0 && (
            <div className="wine-quick-item">
              <span className="l">Οινοποιεία</span>
              <span className="v">{region.wineries.length}</span>
            </div>
          )}
          {region.recognizedYear && (
            <div className="wine-quick-item">
              <span className="l">Από το</span>
              <span className="v">{region.recognizedYear}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sticky δευτερεύον μενού */}
      <nav className="wine-subnav">
        <div className="wrap wine-subnav-inner">
          <span className="wine-subnav-name">{region.name}</span>
          {region.description && <a href="#place">Ο τόπος</a>}
          {grapes.length > 0 && <a href="#grapes">Ποικιλίες</a>}
          {region.wines.length > 0 && <a href="#wines">Κρασιά</a>}
          {region.wineries.length > 0 && <a href="#wineries">Οινοποιεία</a>}
        </div>
      </nav>

      {/* Ο τόπος — η σύντομη, πραγματική περιγραφή της περιοχής σαν editorial απόσπασμα */}
      {region.description && (
        <section id="place">
          <div className="wrap">
            <h2 className="section-title">Ο τόπος</h2>
            <div className="winery-philosophy reveal home-reveal">
              <p className="winery-philosophy-quote">{region.description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Οι ποικιλίες */}
      {grapes.length > 0 && (
        <section id="grapes" style={{ background: "var(--paper-alt)" }}>
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

      {/* Τα κρασιά */}
      {featuredWines.length > 0 && (
        <section id="wines">
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
                      {wine.winery.name}
                      {variety ? ` · ${variety}` : ""} · {COLOR_NAME[wine.color]}
                    </span>
                    <span className="wine-similar-link">
                      Εξερεύνησε το κρασί
                      <ArrowIcon />
                    </span>
                  </Link>
                );
              })}
            </div>
            <p style={{ marginTop: 40 }}>
              <Link href={`/krasia?region=${region.slug}`} className="link-arrow">
                Εξερεύνησε όλες τις ετικέτες ({region.wines.length})
                <ArrowIcon />
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* Τα οινοποιεία */}
      {region.wineries.length > 0 && (
        <section id="wineries" style={{ background: "var(--paper-alt)" }}>
          <div className="wrap">
            <h2 className="section-title">Τα οινοποιεία</h2>
            <div className="region-winery-list">
              {region.wineries.map((w) => (
                <Link key={w.slug} href={`/oinopoieia/${w.slug}`} className="region-winery-row reveal home-reveal">
                  <div className="region-winery-row-main">
                    <h3>{w.name}</h3>
                    <span className="meta">
                      {w.subRegion ?? region.name}
                      {w.foundedYear ? ` · Από το ${w.foundedYear}` : ""}
                    </span>
                    {w.description && <p>{w.description}</p>}
                  </div>
                  <ArrowIcon size={16} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Στοιχεία περιοχής */}
      {techRows.length > 0 && (
        <section>
          <div className="wrap">
            <h2 className="section-title">Στοιχεία περιοχής</h2>
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

      {/* Συνέχισε την εξερεύνηση */}
      {(region.wines.length > 0 || grapes.length > 0 || region.wineries.length > 0) && (
        <section>
          <div className="wrap">
            <h2 className="section-title">Συνέχισε την εξερεύνηση</h2>
            <div className="winery-grape-list">
              {region.wines.length > 0 && (
                <Link href={`/krasia?region=${region.slug}`} className="winery-grape-row">
                  Εξερεύνησε τα κρασιά
                  <ArrowIcon size={16} />
                </Link>
              )}
              {grapes[0] && (
                <Link href={`/poikilies/${grapes[0].slug}`} className="winery-grape-row">
                  Εξερεύνησε το {grapes[0].name}
                  <ArrowIcon size={16} />
                </Link>
              )}
              {region.wineries[0] && (
                <Link href={`/oinopoieia/${region.wineries[0].slug}`} className="winery-grape-row">
                  Γνώρισε το {region.wineries[0].name}
                  <ArrowIcon size={16} />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Κλείσιμο — η ίδια ατμοσφαιρική εικόνα, σαν επιστροφή στην αρχική εικόνα του hero */}
      {region.wines.length > 0 && (
        <section className="greece-band">
          <div className="greece-band-copy reveal home-reveal">
            <p className="wine-hero-eyebrow">Εξερεύνησε</p>
            <h2>{region.name}</h2>
            <p>Ανακάλυψε τα κρασιά, τα οινοποιεία και τις ποικιλίες της.</p>
            <Link href={`/krasia?region=${region.slug}`} className="btn-primary">
              Εξερεύνησε τα κρασιά
              <ArrowIcon />
            </Link>
          </div>
          <div className="greece-band-photo">
            <img className="reveal img-reveal" src={heroPhoto} alt="" />
          </div>
        </section>
      )}
    </>
  );
}
