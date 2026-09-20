"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/LanguageProvider";
import WinePhoto from "@/components/WinePhoto";
import HomeSearchTrigger from "@/components/HomeSearchTrigger";
import WineCard, { type WineCardData } from "@/components/WineCard";
import { hrefFor } from "@/app/krasia/filters";
import type { DiscoveryBucket } from "@/lib/discovery";
import type { WineColor } from "@prisma/client";

type FeaturedWine = {
  slug: string;
  name: string;
  labelImage: string | null;
  color: WineColor;
  featuredQuote: string | null;
  winery: { name: string; slug: string };
  region: { name: string };
  varieties: { variety: { name: string } }[];
} | null;

type Discovery = { wines: WineCardData[]; total: number } | null;

const DISCOVERY_HREF: Record<DiscoveryBucket, string> = {
  white: "/?discover=white",
  red: "/?discover=red",
  rose: "/?discover=rose",
  sparkling: "/?discover=sparkling",
};

// Cache-buster για τις στατικές φωτογραφίες της αρχικής (public/home/*.jpg).
// Το /public σερβίρεται με cache-control: max-age=0, must-revalidate — αρκεί
// θεωρητικά για σωστή επαλήθευση, αλλά ορισμένοι browsers (π.χ. Safari) δεν
// ξαναφέρνουν πάντα μια εικόνα με το ΙΔΙΟ URL μετά από αλλαγή του αρχείου.
// Αύξησε αυτόν τον αριθμό κάθε φορά που αντικαθιστάς κάποια από αυτές τις
// εικόνες, ώστε να «σπάει» σίγουρα κάθε cache (browser + CDN).
const IMG_V = 2;

function ArrowIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.73} viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8h21M15 1l7 7-7 7" />
    </svg>
  );
}

export default function HomeContent({
  featuredWine,
  discoveryBucket,
  discovery,
}: {
  featuredWine: FeaturedWine;
  discoveryBucket: DiscoveryBucket | null;
  discovery: Discovery;
}) {
  const { t } = useLanguage();

  return (
    <>
      {/* 1 — Hero */}
      <section className="hero-v2">
        <div className="hero-v2-copy">
          <p className="hero-v2-eyebrow">{t("home_hero_eyebrow")}</p>
          <h1>
            {t("home_hero_title_l1")}
            <br />
            {t("home_hero_title_l2")}
          </h1>
          <p className="hero-v2-lead">{t("home_hero_lead")}</p>
          <Link href="/krasia" className="btn-primary">
            {t("home_hero_cta")}
            <ArrowIcon />
          </Link>
        </div>
        <div className="hero-v2-photo">
          <Image
            className="reveal img-reveal"
            src={`/home/hero.jpg?v=${IMG_V}`}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 55vw"
            style={{ objectFit: "cover" }}
            priority
          />
          <p className="hero-v2-tag">{t("home_hero_tag")}</p>
        </div>
      </section>

      {/* 2 — Αναζήτηση */}
      <section className="search-section">
        <div className="wrap reveal home-reveal">
          <p className="hero-v2-eyebrow">{t("home_search_eyebrow")}</p>
          <h2>{t("home_search_title")}</h2>
          <HomeSearchTrigger placeholder={t("home_search_placeholder")} />
        </div>
      </section>

      {/* 3 — Εξερεύνηση */}
      <section className="explore-section">
        <div className="wrap explore-grid">
          <Link href="/krasia" className="explore-card reveal home-reveal">
            <div className="explore-card-photo">
              <img src={`/home/explore-wines.jpg?v=${IMG_V}`} alt="" loading="lazy" />
            </div>
            <h3>{t("nav_wines")}</h3>
            <span className="explore-card-meta">
              {t("home_explore_wines_label")}
              <ArrowIcon size={13} />
            </span>
          </Link>

          <Link href="/oinopoieia" className="explore-card reveal home-reveal">
            <div className="explore-card-photo">
              <img src={`/home/explore-wineries.jpg?v=${IMG_V}`} alt="" loading="lazy" />
            </div>
            <h3>{t("nav_wineries")}</h3>
            <span className="explore-card-meta">
              {t("home_explore_wineries_label")}
              <ArrowIcon size={13} />
            </span>
          </Link>

          <Link href="/perioches" className="explore-card reveal home-reveal">
            <div className="explore-card-photo">
              <img src={`/home/explore-regions.jpg?v=${IMG_V}`} alt="" loading="lazy" />
            </div>
            <h3>{t("nav_regions")}</h3>
            <span className="explore-card-meta">
              {t("home_explore_regions_label")}
              <ArrowIcon size={13} />
            </span>
          </Link>

          <Link href="/poikilies" className="explore-card reveal home-reveal">
            <div className="explore-card-photo">
              <img src={`/home/explore-grapes.jpg?v=${IMG_V}`} alt="" loading="lazy" />
            </div>
            <h3>{t("nav_varieties")}</h3>
            <span className="explore-card-meta">
              {t("home_explore_varieties_label")}
              <ArrowIcon size={13} />
            </span>
          </Link>
        </div>
      </section>

      {/* 3.5 — Δεν ξέρεις από πού να ξεκινήσεις; */}
      <section className="home-discovery">
        <div className="wrap reveal home-reveal">
          <p className="hero-v2-eyebrow">{t("home_discovery_eyebrow")}</p>
          <div className="home-discovery-list">
            <Link href="/perioches" className="home-discovery-row">
              <div className="home-discovery-row-text">
                <h3>{t("home_discovery_region_title")}</h3>
                <p>{t("home_discovery_region_cta")}</p>
              </div>
              <ArrowIcon />
            </Link>
            <Link href="/poikilies" className="home-discovery-row">
              <div className="home-discovery-row-text">
                <h3>{t("home_discovery_variety_title")}</h3>
                <p>{t("home_discovery_variety_cta")}</p>
              </div>
              <ArrowIcon />
            </Link>
            <Link href="/oinopoieia" className="home-discovery-row">
              <div className="home-discovery-row-text">
                <h3>{t("home_discovery_winery_title")}</h3>
                <p>{t("home_discovery_winery_cta")}</p>
              </div>
              <ArrowIcon />
            </Link>
            <Link href="/tairiasma" className="home-discovery-row">
              <div className="home-discovery-row-text">
                <h3>{t("home_discovery_pairing_title")}</h3>
                <p>{t("home_discovery_pairing_cta")}</p>
              </div>
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* 3.6 — Curated Discovery: επέλεξε χρώμα, δες πραγματικά κρασιά */}
      <section className="home-picker">
        <div className="wrap reveal home-reveal">
          <p className="hero-v2-eyebrow">{t("home_picker_eyebrow")}</p>
          <h2>{t("home_picker_title")}</h2>
          <div className="home-picker-row">
            {(Object.keys(DISCOVERY_HREF) as DiscoveryBucket[]).map((bucket) => (
              <Link
                key={bucket}
                href={DISCOVERY_HREF[bucket]}
                className={`chip${discoveryBucket === bucket ? " is-active" : ""}`}
              >
                {t(`home_picker_${bucket}`)}
              </Link>
            ))}
          </div>

          {discovery && discovery.wines.length > 0 && (
            <div className="home-picker-results">
              <p className="home-picker-results-eyebrow">{t("home_picker_results_eyebrow")}</p>
              <div className="wine-grid home-picker-grid">
                {discovery.wines.map((wine) => (
                  <WineCard key={wine.slug} wine={wine} />
                ))}
              </div>
              {discoveryBucket !== "sparkling" && discovery.total > discovery.wines.length && (
                <Link
                  href={hrefFor({ color: [discoveryBucket as string], region: [], variety: [], winery: [] })}
                  className="link-arrow"
                >
                  Δες όλα τα {discovery.total} κρασιά
                  <ArrowIcon size={13} />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 4 — Προτεινόμενο κρασί */}
      {featuredWine && (
        <section className="featured-wine">
          <div className="wrap featured-wine-layout">
            <div className="reveal home-reveal">
              <p className="hero-v2-eyebrow">{t("home_featured_eyebrow")}</p>
              <h3 className="featured-wine-name">{featuredWine.varieties[0]?.variety.name ?? featuredWine.name}</h3>
              <p className="featured-wine-winery">{featuredWine.winery.name}</p>
              <p className="featured-wine-meta">
                {featuredWine.region.name}
                {featuredWine.varieties[0] ? ` · ${featuredWine.varieties[0].variety.name}` : ""}
              </p>
              <Link href={`/krasia/${featuredWine.slug}`} className="link-arrow">
                {t("home_featured_cta")}
                <ArrowIcon size={13} />
              </Link>
            </div>

            <WinePhoto
              labelImage={featuredWine.labelImage}
              color={featuredWine.color}
              wineName={featuredWine.name}
              className="featured-wine-photo reveal img-reveal"
              sizes="260px"
            />

            {featuredWine.featuredQuote && (
              <div className="reveal home-reveal">
                <p className="featured-wine-quote">&ldquo;{featuredWine.featuredQuote}&rdquo;</p>
                <div className="featured-wine-quote-rule" />
                <p className="featured-wine-quote-cite">
                  {featuredWine.region.name}
                  <br />
                  {t("home_featured_cite_region_group")}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5 — Η Ελλάδα σε ένα κρασί */}
      <section className="greece-band">
        <div className="greece-band-copy reveal home-reveal">
          <p className="hero-v2-eyebrow">{t("home_greece_eyebrow")}</p>
          <h2>
            {t("home_greece_title_l1")}
            <br />
            {t("home_greece_title_l2")}
          </h2>
          <p>{t("home_greece_lead")}</p>
          <Link href="/perioches" className="btn-primary">
            {t("home_greece_cta")}
            <ArrowIcon />
          </Link>
        </div>
        <div className="greece-band-photo">
          <img className="reveal img-reveal" src={`/home/greece-band.jpg?v=${IMG_V}`} alt="" loading="lazy" />
        </div>
      </section>
    </>
  );
}
