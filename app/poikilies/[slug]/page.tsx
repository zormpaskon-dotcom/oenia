import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentStatus, VarietyType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import WinePhoto from "@/components/WinePhoto";
import PronounceButton from "@/components/PronounceButton";
import { COLOR_NAME } from "@/lib/labels";

// Ατμοσφαιρικές, μη-συγκεκριμένες φωτογραφίες — η Variety δεν έχει δικό της
// πεδίο εικόνας στη βάση, οπότε χρησιμοποιούμε ήδη υπαρκτά, θεματικά ταιριαστά
// assets του Oenia (ίδιο πνεύμα με τα FALLBACK_* των σελίδων οινοποιείου/περιοχής).
const FALLBACK_VARIETY_PHOTO = "/home/explore-grapes.jpg";
const FALLBACK_GROWS_PHOTO = "/home/explore-regions.jpg";
const FALLBACK_CTA_PHOTO = "/home/explore-wines.jpg";

const TASTE_DIMENSIONS = [
  { key: "acidity", label: "Οξύτητα" },
  { key: "body", label: "Σώμα" },
  { key: "tannins", label: "Τανίνες" },
  { key: "aromaIntensity", label: "Ένταση αρωμάτων" },
  { key: "ageingPotential", label: "Δυναμικό παλαίωσης" },
] as const;

function ArrowIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.73} viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8h21M15 1l7 7-7 7" />
    </svg>
  );
}

/** Το πεδίο characteristics ακολουθεί σταθερά ένα πρότυπο στη βάση:
 * "[χαρακτηριστικά με κόμμα]. Καλλιεργείται [περιοχή]. Αρώματα: [λίστα]. Ταιριάζει με: [λίστα]."
 * Δεν αλλάζουμε ούτε μία λέξη — απλώς σπάμε το ήδη υπαρκτό κείμενο στα φυσικά
 * του σημεία, ίδια λογική με τα expectTags της σελίδας κρασιού. Αν μια
 * ποικιλία δεν έχει κάποιο από αυτά τα labels, η αντίστοιχη λίστα μένει κενή
 * και το section κρύβεται — καμία επινόηση. */
function parseCharacteristics(text: string | null) {
  if (!text) return { traits: [] as string[], grownText: null as string | null, aromas: [] as string[], pairings: [] as string[] };

  const aromaMatch = text.match(/Αρώματα:\s*([^.]+)\.?/);
  const pairingMatch = text.match(/Ταιριάζει με:\s*([^.]+)\.?/);
  const grownMatch = text.match(/Καλλιεργείται\s+([^.]+)\./);

  const aromas = aromaMatch ? aromaMatch[1].split(",").map((s) => s.trim()).filter(Boolean) : [];
  const pairings = pairingMatch ? pairingMatch[1].split(",").map((s) => s.trim()).filter(Boolean) : [];
  const grownText = grownMatch ? grownMatch[1].trim() : null;

  const cutIndex = text.search(/Καλλιεργείται|Αρώματα:|Ταιριάζει με:/);
  const traitsText = cutIndex > -1 ? text.slice(0, cutIndex) : text;
  const traits = traitsText.split(",").map((s) => s.trim().replace(/\.$/, "")).filter((s) => s.length > 1);

  return { traits, grownText, aromas, pairings };
}

async function getVariety(slug: string) {
  return prisma.variety.findUnique({
    where: { slug },
    include: {
      wines: {
        include: {
          wine: {
            include: {
              winery: { select: { name: true, slug: true, description: true, region: { select: { name: true, slug: true } } } },
              region: { select: { name: true, slug: true } },
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
  const variety = await getVariety(slug);
  if (!variety) return {};
  return {
    title: `${variety.name} — Ποικιλία | Oenia`,
    description: variety.description ?? undefined,
  };
}

export default async function VarietyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const variety = await getVariety(slug);
  if (!variety) notFound();

  const publishedWines = variety.wines
    .map((v) => v.wine)
    .filter((w) => w.status === ContentStatus.PUBLISHED)
    .sort((a, b) => b.avgRating - a.avgRating);

  // Περιοχές και οινοποιεία υπολογίζονται δυναμικά από τα πραγματικά κρασιά
  // της ποικιλίας — όχι από τη σχέση Variety.regions, που είναι αραιά
  // συμπληρωμένη στη βάση (ίδια τεχνική με τις σελίδες περιοχής/οινοποιείου).
  const regions = Array.from(new Map(publishedWines.map((w) => [w.region.slug, w.region] as const)).values()).sort(
    (a, b) => a.name.localeCompare(b.name, "el")
  );
  const wineries = Array.from(
    new Map(publishedWines.map((w) => [w.winery.slug, w.winery] as const)).values()
  ).sort((a, b) => a.name.localeCompare(b.name, "el"));

  const { traits, grownText, aromas, pairings } = parseCharacteristics(variety.characteristics);

  const tasteBars = TASTE_DIMENSIONS.map((d) => ({ ...d, value: variety[d.key] })).filter(
    (d): d is (typeof TASTE_DIMENSIONS)[number] & { value: number } => d.value != null
  );

  const hasCharacterSection = traits.length > 0 || tasteBars.length > 0;
  const featuredWines = publishedWines.slice(0, 6);

  return (
    <>
      <div className="wrap">
        <p className="breadcrumb">
          <Link href="/">Αρχική</Link> / <Link href="/poikilies">Ποικιλίες</Link> / {variety.name}
        </p>
      </div>

      {/* Hero */}
      <div className="wrap winery-hero">
        <div>
          <p className="wine-hero-eyebrow">
            Ποικιλία · {variety.type === VarietyType.WHITE ? "Λευκή" : "Κόκκινη"}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <h1 className="wine-hero-name" style={{ margin: 0 }}>
              {variety.name}
            </h1>
            <PronounceButton text={variety.name} />
          </div>
          {variety.nameLatin && <p className="wine-hero-place">{variety.nameLatin}</p>}
          {variety.description && <p className="variety-hero-lead">{variety.description}</p>}
        </div>

        <div className="winery-hero-photo reveal img-reveal">
          <img src={FALLBACK_VARIETY_PHOTO} alt="" />
        </div>
      </div>

      {/* Γρήγορα στοιχεία */}
      <div className="wrap">
        <div className="wine-quick-strip">
          <div className="wine-quick-item">
            <span className="l">Τύπος</span>
            <span className="v">{variety.type === VarietyType.WHITE ? "Λευκή" : "Κόκκινη"}</span>
          </div>
          {variety.originRegion && (
            <div className="wine-quick-item">
              <span className="l">Καταγωγή</span>
              <span className="v">{variety.originRegion}</span>
            </div>
          )}
          {publishedWines.length > 0 && (
            <div className="wine-quick-item">
              <span className="l">Ετικέτες</span>
              <span className="v">{publishedWines.length}</span>
            </div>
          )}
          {regions.length > 0 && (
            <div className="wine-quick-item">
              <span className="l">Περιοχές</span>
              <span className="v">{regions.length}</span>
            </div>
          )}
          {wineries.length > 0 && (
            <div className="wine-quick-item">
              <span className="l">Οινοποιεία</span>
              <span className="v">{wineries.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sticky δευτερεύον μενού */}
      <nav className="wine-subnav">
        <div className="wrap wine-subnav-inner">
          <span className="wine-subnav-name">{variety.name}</span>
          {hasCharacterSection && <a href="#character">Το σταφύλι</a>}
          {aromas.length > 0 && <a href="#aromas">Αρώματα</a>}
          {(grownText || regions.length > 0) && <a href="#regions">Πού καλλιεργείται</a>}
          {featuredWines.length > 0 && <a href="#wines">Κρασιά</a>}
          {wineries.length > 0 && <a href="#wineries">Οινοποιεία</a>}
        </div>
      </nav>

      {/* Το σταφύλι — χαρακτηριστικά ως μεγάλες editorial φράσεις + προφίλ γεύσης */}
      {hasCharacterSection && (
        <section id="character">
          <div className="wrap">
            <h2 className="section-title">Το σταφύλι</h2>
            {traits.length > 0 && (
              <div className="variety-tag-list reveal home-reveal">
                {traits.map((trait, i) => (
                  <div className="variety-tag-row variety-tag-row-lg" key={`${trait}-${i}`}>
                    {trait}
                  </div>
                ))}
              </div>
            )}

            {tasteBars.length > 0 && (
              <div className="wine-taste-bars reveal home-reveal" style={{ marginTop: 48 }}>
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
            )}
          </div>
        </section>
      )}

      {/* Αρώματα */}
      {aromas.length > 0 && (
        <section id="aromas" style={{ background: "var(--paper-alt)" }}>
          <div className="wrap">
            <h2 className="section-title">Αρώματα</h2>
            <div className="variety-tag-list">
              {aromas.map((aroma, i) => (
                <div className="variety-tag-row" key={`${aroma}-${i}`}>
                  {aroma}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ταιριάζει με */}
      {pairings.length > 0 && (
        <section>
          <div className="wrap">
            <h2 className="section-title">Ταιριάζει με</h2>
            <div className="variety-tag-list">
              {pairings.map((pairing, i) => (
                <div className="variety-tag-row" key={`${pairing}-${i}`}>
                  {pairing}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Πού καλλιεργείται */}
      {(grownText || regions.length > 0) && (
        <section id="regions" style={{ background: "var(--paper-alt)" }}>
          <div className="wrap">
            <div className="wine-split">
              <div className="wine-split-copy reveal home-reveal">
                <p className="wine-split-eyebrow">Πού καλλιεργείται</p>
                {grownText && <h2 className="wine-split-title">Καλλιεργείται {grownText}</h2>}
                {regions.length > 0 && (
                  <div className="winery-grape-list" style={{ marginTop: 8 }}>
                    {regions.map((r) => (
                      <Link key={r.slug} href={`/perioches/${r.slug}`} className="winery-grape-row">
                        {r.name}
                        <ArrowIcon size={16} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="wine-split-photo">
                <img className="reveal img-reveal" src={FALLBACK_GROWS_PHOTO} alt="" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Κρασιά με αυτή την ποικιλία */}
      {featuredWines.length > 0 && (
        <section id="wines">
          <div className="wrap">
            <h2 className="section-title">Κρασιά με {variety.name}</h2>
            <div className="wine-similar-grid">
              {featuredWines.map((wine) => (
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
                    {wine.winery.name} · {wine.region.name} · {COLOR_NAME[wine.color]}
                  </span>
                  <span className="wine-similar-link">
                    Εξερεύνηση κρασιού
                    <ArrowIcon />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Οινοποιεία */}
      {wineries.length > 0 && (
        <section id="wineries" style={{ background: "var(--paper-alt)" }}>
          <div className="wrap">
            <h2 className="section-title">Οινοποιεία με {variety.name}</h2>
            <div className="region-winery-list">
              {wineries.map((w) => (
                <Link key={w.slug} href={`/oinopoieia/${w.slug}`} className="region-winery-row reveal home-reveal">
                  <div className="region-winery-row-main">
                    <h3>{w.name}</h3>
                    <span className="meta">{w.region.name}</span>
                    {w.description && <p>{w.description}</p>}
                  </div>
                  <ArrowIcon size={16} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Για σύγκριση — υπαρκτό feature, διατηρείται με editorial στυλ */}
      {variety.similarTo && (
        <section>
          <div className="wrap">
            <h2 className="section-title">Για σύγκριση</h2>
            <div className="winery-philosophy reveal home-reveal">
              <p className="winery-philosophy-quote">
                {variety.name} vs {variety.similarTo}
              </p>
              {variety.comparisonNote && (
                <div className="winery-philosophy-rest">
                  <p>{variety.comparisonNote}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Τελικό CTA */}
      {featuredWines.length > 0 && (
        <section className="greece-band">
          <div className="greece-band-copy reveal home-reveal">
            <p className="wine-hero-eyebrow">Ανακάλυψε</p>
            <h2>Τα κρασιά</h2>
            <p>Εξερεύνησε τις ετικέτες που φτιάχνονται με {variety.name}.</p>
            <Link href={`/krasia?variety=${variety.slug}`} className="btn-primary">
              Εξερεύνησε τα κρασιά
              <ArrowIcon />
            </Link>
          </div>
          <div className="greece-band-photo">
            <img className="reveal img-reveal" src={FALLBACK_CTA_PHOTO} alt="" />
          </div>
        </section>
      )}
    </>
  );
}
