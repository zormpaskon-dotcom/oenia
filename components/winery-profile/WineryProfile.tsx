import Link from "next/link";
import type { WineColor } from "@prisma/client";
import WinePhoto from "@/components/WinePhoto";
import { COLOR_NAME } from "@/lib/labels";
import type { WineryImages } from "@/lib/winery-images";
import WineryVisualSection from "./WineryVisualSection";
import WineryPeopleCard from "./WineryPeopleCard";

// Generic, data-driven premium winery profile — η ίδια, ήδη εγκεκριμένη
// (GREEN, 9/10) visual language του Κτήμα Βιβλία Χώρα prototype, τώρα
// οδηγούμενη από δεδομένα αντί για hardcoded URLs. Κάθε ενότητα εικόνας
// (Ο τόπος / Το οινοποιείο / Οι άνθρωποι / Editorial) renderάρει ΜΟΝΟ αν
// υπάρχει το αντίστοιχο image slot — καμία fixed λίστα "αν έχει N εικόνες
// κάνε X". Το page.tsx αποφασίζει, ΠΡΙΝ φτάσει εδώ, αν το winery έχει
// καν hero image· χωρίς hero δεν καλείται καθόλου αυτό το component
// (legacy fallback).

function ArrowIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.73} viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8h21M15 1l7 7-7 7" />
    </svg>
  );
}

type WineForCard = {
  id: string;
  slug: string;
  name: string;
  color: WineColor;
  labelImage: string | null;
  varieties: { variety: { name: string; slug: string } }[];
  region: { name: string };
};

export default function WineryProfile({
  winery,
  images,
  grapes,
  storyParagraphs,
  featuredWines,
  totalWineCount,
  techRows,
  hasVisitInfo,
}: {
  winery: {
    name: string;
    slug: string;
    foundedYear: number | null;
    websiteUrl: string | null;
    isVerified: boolean;
    isOrganic: boolean;
    isBiodynamic: boolean;
    acceptsVisitors: boolean;
    visitingHours: string | null;
    visitingNotes: string | null;
    region: { name: string; slug: string; description: string | null };
  };
  images: WineryImages;
  grapes: { name: string; slug: string }[];
  storyParagraphs: string[];
  featuredWines: WineForCard[];
  totalWineCount: number;
  techRows: { label: string; value: string }[];
  hasVisitInfo: boolean;
}) {
  const hero = images.hero!; // ο caller (page.tsx) εγγυάται ότι υπάρχει πριν καλέσει αυτό το component
  const shortText = storyParagraphs[0] ?? null;

  return (
    <>
      {/* HERO — full-bleed, πάντα υπάρχει (προϋπόθεση για να φτάσουμε εδώ) */}
      <section className="wprofile-hero">
        <div className="wprofile-hero-bg">
          <img className="reveal img-reveal" src={hero.src} alt={hero.alt} />
        </div>
        <div className="wprofile-hero-scrim" />
        <div className="wrap wprofile-hero-content">
          <p className="wprofile-hero-eyebrow">Οινοποιείο · {winery.region.name}</p>
          <h1 className="wprofile-hero-name">{winery.name}</h1>
          {shortText && <p className="wprofile-hero-lead">{shortText}</p>}
          <div className="winery-badges-row">
            {winery.isVerified && <span className="winery-badge wprofile-badge-on-dark">Επαληθευμένο προφίλ</span>}
            {winery.isOrganic && <span className="winery-badge wprofile-badge-on-dark">Βιολογική καλλιέργεια</span>}
            {winery.isBiodynamic && <span className="winery-badge wprofile-badge-on-dark">Βιοδυναμική καλλιέργεια</span>}
            {winery.acceptsVisitors && <span className="winery-badge wprofile-badge-on-dark">Δέχεται επισκέπτες</span>}
          </div>
        </div>
      </section>

      {/* Γρήγορα στοιχεία */}
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
            <span className="v">{totalWineCount}</span>
          </div>
        </div>
      </div>

      {/* Sticky δευτερεύον μενού — μόνο anchors για ενότητες που όντως υπάρχουν */}
      <nav className="wine-subnav">
        <div className="wrap wine-subnav-inner">
          <span className="wine-subnav-name">{winery.name}</span>
          {storyParagraphs.length > 0 && <a href="#story">Ιστορία</a>}
          {images.vineyard && <a href="#place">Ο τόπος</a>}
          {images.winery && <a href="#winery">Το οινοποιείο</a>}
          {images.people && <a href="#people">Οι άνθρωποι</a>}
          {featuredWines.length > 0 && <a href="#wines">Κρασιά</a>}
          {grapes.length > 0 && <a href="#grapes">Ποικιλίες</a>}
        </div>
      </nav>

      {/* STORY — υπάρχον κείμενο, όχι νέο */}
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

      {/* Ο ΤΟΠΟΣ — μόνο αν υπάρχει vineyard image */}
      {images.vineyard && (
        <>
          <WineryVisualSection
            id="place"
            background="alt"
            images={[images.vineyard]}
            eyebrow="Ο τόπος"
            title={winery.region.name}
            text={winery.region.description ?? undefined}
          />
          {winery.region.description && (
            <div className="wrap" style={{ marginTop: -32, marginBottom: 40 }}>
              <Link href={`/perioches/${winery.region.slug}`} className="link-arrow">
                Εξερεύνησε την περιοχή
                <ArrowIcon />
              </Link>
            </div>
          )}
        </>
      )}

      {/* ΤΟ ΟΙΝΟΠΟΙΕΙΟ — split treatment, μόνο αν υπάρχει winery image */}
      {images.winery && (
        <WineryVisualSection id="winery" layout="split" images={[images.winery]} eyebrow="Το οινοποιείο" title="Μέσα στο κελάρι" />
      )}

      {/* ΟΙ ΑΝΘΡΩΠΟΙ — προαιρετικό, μόνο αν υπάρχει επιβεβαιωμένο πρόσωπο */}
      {images.people && (
        <WineryPeopleCard
          photoSrc={images.people.src}
          photoAlt={images.people.alt}
          name={images.people.personName ?? ""}
          caption={shortText ?? undefined}
        />
      )}

      {/* EDITORIAL — ήσυχο visual break πριν τα κρασιά, μόνο αν υπάρχει */}
      {images.editorial && <WineryVisualSection images={[images.editorial]} background="alt" size="quiet" />}

      {/* ΚΡΑΣΙΑ */}
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
                      {COLOR_NAME[wine.color]}
                      {variety ? ` · ${variety}` : ""} · {wine.region.name}
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
              <Link href={`/krasia?winery=${winery.slug}`} className="link-arrow">
                Εξερεύνησε όλες τις ετικέτες ({totalWineCount})
                <ArrowIcon />
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* ΠΟΙΚΙΛΙΕΣ */}
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

      {/* Επισκέψου το οινοποιείο */}
      {hasVisitInfo && (
        <section id="visit">
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

      {/* Τεχνικά στοιχεία */}
      {techRows.length > 0 && (
        <section style={{ background: "var(--paper-alt)" }}>
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

      {/* Επίσημη ιστοσελίδα */}
      {winery.websiteUrl && (
        <div className="wrap">
          <div className="winery-official">
            <p>Περισσότερα για το οινοποιείο</p>
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
            {totalWineCount > 0 && (
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
