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
} | null;

const FEATURED_QUOTE = {
  el: "Η αλμύρα του νησιού, σε ένα ποτήρι.",
  en: "The island's salinity, in a glass.",
};

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
          <img src="/hero/02_wine_glass_sunset.jpg" alt="" />
          <p className="hero-v2-tag">{t("home_hero_tag")}</p>
        </div>
      </section>

      {/* 2 — Αναζήτηση */}
      <section className="search-section">
        <div className="wrap">
          <p className="hero-v2-eyebrow">{t("home_search_eyebrow")}</p>
          <h2>{t("home_search_title")}</h2>
          <HomeSearchTrigger placeholder={t("home_search_placeholder")} />
        </div>
      </section>

      {/* 3 — Εξερεύνηση */}
      <section>
        <div className="wrap explore-grid">
          <Link href="/krasia" className="explore-card reveal">
            <div className="explore-card-photo">
              <img src="/hero/06_red_wine_pour.jpg" alt="" />
            </div>
            <h3>{t("nav_wines")}</h3>
            <span className="explore-card-meta">
              {t("home_explore_wines_label")}
              <ArrowIcon size={13} />
            </span>
          </Link>

          <Link href="/oinopoieia" className="explore-card reveal">
            <div className="explore-card-photo">
              <img src="/hero/01_vineyard_estate.jpg" alt="" />
            </div>
            <h3>{t("nav_wineries")}</h3>
            <span className="explore-card-meta">
              {t("home_explore_wineries_label")}
              <ArrowIcon size={13} />
            </span>
          </Link>

          <Link href="/perioches" className="explore-card reveal">
            <div className="explore-card-photo">
              <img src="/hero/08_stone_estate_terracotta.jpg" alt="" />
            </div>
            <h3>{t("nav_regions")}</h3>
            <span className="explore-card-meta">
              {t("home_explore_regions_label")}
              <ArrowIcon size={13} />
            </span>
          </Link>

          <Link href="/poikilies" className="explore-card reveal">
            <div className="explore-card-photo">
              <img src="/hero/03_grapes_sunlight.jpg" alt="" />
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
            <div>
              <p className="hero-v2-eyebrow">{t("home_featured_eyebrow")}</p>
              <h3 className="featured-wine-name">{featuredWine.name}</h3>
              <p className="featured-wine-winery">{featuredWine.winery.name}</p>
              <p className="featured-wine-meta">{featuredWine.region.name}</p>
              <Link href={`/krasia/${featuredWine.slug}`} className="link-arrow">
                {t("home_featured_cta")}
                <ArrowIcon size={13} />
              </Link>
            </div>

            <WinePhoto
              labelImage={featuredWine.labelImage}
              color={featuredWine.color}
              wineName={featuredWine.name}
              className="featured-wine-photo"
              sizes="260px"
            />

            <div>
              <p className="featured-wine-quote">&ldquo;{FEATURED_QUOTE[locale]}&rdquo;</p>
              <div className="featured-wine-quote-rule" />
              <p className="featured-wine-quote-cite">{featuredWine.region.name}</p>
            </div>
          </div>
        </section>
      )}

      {/* 5 — Η Ελλάδα σε ένα κρασί */}
      <section className="greece-band">
        <img src="/hero/07_vineyard_path_sunset.jpg" alt="" />
        <div className="greece-band-copy">
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
      </section>
    </>
  );
}
