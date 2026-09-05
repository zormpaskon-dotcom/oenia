import Link from "next/link";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import HeroVineMap, { type VineRegion } from "@/components/HeroVineMap";
import HomeLabelGrid from "@/components/HomeLabelGrid";
import HeroSlideshow from "@/components/HeroSlideshow";

const HERO_IMAGES = [
  "/hero/01_vineyard_estate.jpg",
  "/hero/02_wine_glass_sunset.jpg",
  "/hero/03_grapes_sunlight.jpg",
  "/hero/04_barrel_cellar.jpg",
  "/hero/05_al_fresco_wine_table.jpg",
  "/hero/06_red_wine_pour.jpg",
  "/hero/07_vineyard_path_sunset.jpg",
  "/hero/08_stone_estate_terracotta.jpg",
];

const MAP_REGIONS: { slug: string; variety: string; x: number; y: number; labelDx: number; labelDy: number }[] = [
  { slug: "mantineia", variety: "Μοσχοφίλερο", x: 60, y: 40, labelDx: 16, labelDy: 0 },
  { slug: "naoussa", variety: "Ξινόμαυρο", x: 160, y: 210, labelDx: 16, labelDy: 0 },
  { slug: "nemea", variety: "Αγιωργίτικο", x: 220, y: 370, labelDx: 16, labelDy: 0 },
  { slug: "santorini", variety: "Ασύρτικο", x: 280, y: 540, labelDx: 16, labelDy: 0 },
];

const VARIETY_ORDER = ["asyrtiko", "xinomavro", "agiorgitiko", "moschofilero"];

function WaveDivider({ flip }: { flip?: boolean }) {
  return (
    <div className={`wave-divider${flip ? " flip" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1440 64" preserveAspectRatio="none">
        <path
          d="M0,32 C 240,64 480,0 720,28 C 960,56 1200,8 1440,32 L1440,64 L0,64 Z"
          fill="var(--paper-alt)"
        />
      </svg>
    </div>
  );
}

function LeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3c5 3 7 8 4 13-2 3-6 4-8 2-2-3 0-8 4-11z" />
      <path d="M12 3v16" />
    </svg>
  );
}

export default async function Home() {
  const [regionRows, topWines, varietyRows, spotlightWinery, articles, [wineCount, wineryCount, varietyCount]] =
    await Promise.all([
      prisma.region.findMany({
        where: { slug: { in: MAP_REGIONS.map((r) => r.slug) } },
        select: { slug: true, name: true, description: true },
      }),
      prisma.wine.findMany({
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { avgRating: "desc" },
        take: 4,
        include: {
          winery: { select: { name: true } },
          region: { select: { name: true, slug: true } },
          varieties: { include: { variety: { select: { name: true } } } },
        },
      }),
      prisma.variety.findMany({
        where: { slug: { in: VARIETY_ORDER } },
      }),
      prisma.winery.findFirst({
        where: { slug: "douloufakis" },
        include: { region: { select: { name: true } } },
      }),
      prisma.article.findMany({
        where: { status: ContentStatus.PUBLISHED, publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: 3,
        include: { region: { select: { name: true } } },
      }),
      Promise.all([
        prisma.wine.count({ where: { status: ContentStatus.PUBLISHED } }),
        prisma.winery.count({ where: { status: ContentStatus.PUBLISHED } }),
        prisma.variety.count(),
      ]),
    ]);

  const regionBySlug = new Map(regionRows.map((r) => [r.slug, r]));
  const vineRegions: VineRegion[] = MAP_REGIONS.map((m) => {
    const r = regionBySlug.get(m.slug);
    return {
      slug: m.slug,
      name: r?.name ?? m.slug,
      variety: m.variety,
      blurb: r?.description ?? "",
      x: m.x,
      y: m.y,
      labelDx: m.labelDx,
      labelDy: m.labelDy,
    };
  }).filter((r) => regionBySlug.has(r.slug));

  const varietyBySlug = new Map(varietyRows.map((v) => [v.slug, v]));
  const varieties = VARIETY_ORDER.map((slug) => varietyBySlug.get(slug)).filter(
    (v): v is NonNullable<typeof v> => !!v
  );

  return (
    <>
      <section className="home-hero hero-photo">
        <HeroSlideshow images={HERO_IMAGES} />
        <div className="wrap home-hero-content">
          <div className="hero-glass-panel">
            <p className="kicker">Ένας οδηγός για το ελληνικό κρασί</p>
            <h1>
              Το κρασί της Ελλάδας,
              <br />
              σε βάθος.
            </h1>
            <Link href="/krasia" className="home-hero-readmore">
              Εξερεύνησε τις ετικέτες
            </Link>
          </div>
        </div>
      </section>

      <section id="map-explore">
        <div className="wrap map-explore-layout">
          <div className="map-explore-copy">
            <p className="kicker">Βόρεια προς νότο</p>
            <h2>Μια διαδρομή στις ελληνικές περιοχές</h2>
            <p className="lead">
              Πέρασε το ποντίκι πάνω από μια περιοχή για να δεις τι καλλιεργείται εκεί, ή κάνε κλικ
              για να δεις τις ετικέτες της.
            </p>
            <p className="stat-line">
              {wineCount} ετικέτες, {wineryCount} οινοποιεία, {varietyCount} ελληνικές ποικιλίες
              καταγεγραμμένες μέχρι στιγμής.
            </p>
          </div>

          <HeroVineMap regions={vineRegions} />
        </div>
      </section>

      <section id="labels">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="kicker">Πρόσφατες προσθήκες</p>
              <h2>Ετικέτες που ξεχωρίζουν</h2>
            </div>
            <Link href="/krasia" className="btn-text link-underline">
              Όλες οι ετικέτες
            </Link>
          </div>

          <HomeLabelGrid wines={topWines} />
        </div>
      </section>

      <WaveDivider />
      <section className="alt">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="kicker">Γνώρισε τις ποικιλίες</p>
              <h2>Ελληνικές ποικιλίες, μία-μία</h2>
            </div>
          </div>

          <div className="variety-list">
            {varieties.map((v) => (
              <Link key={v.slug} href={`/poikilies/${v.slug}`} className="variety-item">
                <span className="leaf-badge" style={{ marginBottom: 0 }}>
                  <LeafIcon />
                </span>
                <span>
                  <span className="v-name" style={{ display: "block" }}>
                    {v.name}
                  </span>
                  <span className="v-region">{v.originRegion ?? "Ελλάδα"}</span>
                </span>
                <p className="v-detail">{v.description ?? ""}</p>
                <span className="v-color">{v.type === "WHITE" ? "Λευκή" : "Κόκκινη"}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <WaveDivider flip />

      {spotlightWinery && (
        <>
          <section>
            <div className="wrap">
              <div className="spotlight">
                <div className="spotlight-photo" />
                <div className="spotlight-text">
                  <p className="kicker">Οινοποιείο του μήνα</p>
                  <h2>
                    {spotlightWinery.name}, {spotlightWinery.region.name}
                  </h2>
                  <p>{spotlightWinery.story ?? spotlightWinery.description}</p>
                  <Link href={`/oinopoieia/${spotlightWinery.slug}`} className="spotlight-link link-underline">
                    Δες το προφίλ του οινοποιείου
                  </Link>
                </div>
              </div>
            </div>
          </section>
          <WaveDivider />
        </>
      )}

      {articles.length > 0 && (
        <section className="alt" id="articles">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="kicker">Τελευταία άρθρα</p>
                <h2>Από το ημερολόγιο του Oenia</h2>
              </div>
              <Link href="/arthra" className="btn-text link-underline">
                Όλα τα άρθρα
              </Link>
            </div>

            <div className="article-list">
              {articles.map((article) => (
                <div className="article-row" key={article.slug}>
                  <span className="region">{article.region?.name ?? ""}</span>
                  <Link href={`/arthra/${article.slug}`}>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                  </Link>
                  <span className="read-time">{article.readMinutes ? `${article.readMinutes} λεπτά` : ""}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {articles.length > 0 && <WaveDivider flip />}
    </>
  );
}
