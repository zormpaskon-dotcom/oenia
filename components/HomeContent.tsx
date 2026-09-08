"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import WinePhoto from "@/components/WinePhoto";
import HomeSearchTrigger from "@/components/HomeSearchTrigger";
import type { WineColor } from "@prisma/client";

type FeaturedWine = {
  slug: string;
  name: string;
  labelImage: string | null;
  color: WineColor;
  winery: { name: string; slug: string };
  region: { name: string };
  varieties: { variety: { name: string } }[];
} | null;

const FEATURED_QUOTE = {
  el: "Μεταλλικότητα σε ένα ποτήρι.",
  en: "Minerality in a glass.",
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

export default function HomeContent({ featuredWine }: { featuredWine: FeaturedWine }) {
  const { t, locale } = useLanguage();

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
          <img className="reveal img-reveal" src={`/home/hero.jpg?v=${IMG_V}`} alt="" />
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
      <section>
        <div className="wrap explore-grid">
          <Link href="/krasia" className="explore-card reveal home-reveal">
            <div className="explore-card-photo">
              <img src={`/home/explore-wines.jpg?v=${IMG_V}`} alt="" />
            </div>
            <h3>{t("nav_wines")}</h3>
            <span className="explore-card-meta">
              {t("home_explore_wines_label")}
              <ArrowIcon size={13} />
            </span>
          </Link>

          <Link href="/oinopoieia" className="explore-card reveal home-reveal">
            <div className="explore-card-photo">
              <img src={`/home/explore-wineries.jpg?v=${IMG_V}`} alt="" />
            </div>
            <h3>{t("nav_wineries")}</h3>
            <span className="explore-card-meta">
              {t("home_explore_wineries_label")}
              <ArrowIcon size={13} />
            </span>
          </Link>

          <Link href="/perioches" className="explore-card reveal home-reveal">
            <div className="explore-card-photo">
              <img src={`/home/explore-regions.jpg?v=${IMG_V}`} alt="" />
            </div>
            <h3>{t("nav_regions")}</h3>
            <span className="explore-card-meta">
              {t("home_explore_regions_label")}
              <ArrowIcon size={13} />
            </span>
          </Link>

          <Link href="/poikilies" className="explore-card reveal home-reveal">
            <div className="explore-card-photo">
              <img src={`/home/explore-grapes.jpg?v=${IMG_V}`} alt="" />
            </div>
            <h3>{t("nav_varieties")}</h3>
            <span className="explore-card-meta">
              {t("home_explore_varieties_label")}
              <ArrowIcon size={13} />
            </span>
          </Link>
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

            <div className="reveal home-reveal">
              <p className="featured-wine-quote">&ldquo;{FEATURED_QUOTE[locale]}&rdquo;</p>
              <div className="featured-wine-quote-rule" />
              <p className="featured-wine-quote-cite">
                {featuredWine.region.name}
                <br />
                {t("home_featured_cite_region_group")}
              </p>
            </div>
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
          <img className="reveal img-reveal" src={`/home/greece-band.jpg?v=${IMG_V}`} alt="" />
        </div>
      </section>
    </>
  );
}
