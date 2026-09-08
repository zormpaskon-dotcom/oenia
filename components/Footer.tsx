"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";

const mainLinks = [
  { href: "/krasia", key: "nav_wines" },
  { href: "/oinopoieia", key: "nav_wineries" },
  { href: "/perioches", key: "nav_regions" },
  { href: "/poikilies", key: "nav_varieties" },
  { href: "/arthra", key: "nav_articles" },
] as const satisfies ReadonlyArray<{ href: string; key: TranslationKey }>;

const moreLinks = [
  { href: "/chartis", key: "explore_map" },
  { href: "/tairiasma", key: "explore_pairing" },
  { href: "/sygkrisi", key: "explore_compare" },
  { href: "/diavatirio", key: "explore_passport" },
  { href: "/gia-oinopoieia", key: "footer_for_wineries" },
] as const satisfies ReadonlyArray<{ href: string; key: TranslationKey }>;

const legalLinks = [
  { href: "/politiki-aporritou", key: "footer_privacy" },
  { href: "/oroi-xrisis", key: "footer_terms" },
  { href: "/politiki-moderation", key: "footer_moderation" },
] as const satisfies ReadonlyArray<{ href: string; key: TranslationKey }>;

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div>
          <div className="logo">oenia</div>
          <p className="footer-note">{t("header_tagline")}</p>
        </div>

        <div className="footer-links">
          {mainLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {t(link.key)}
            </Link>
          ))}
        </div>

        <div className="footer-side">
          <div className="footer-links">
            {moreLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {t(link.key)}
              </Link>
            ))}
          </div>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              {t("footer_instagram")}
            </a>
            <a href="mailto:hello@oenia.gr">{t("footer_contact")}</a>
          </div>
        </div>
      </div>

      <div className="wrap footer-bottom">
        <span>{t("footer_bottom")}</span>
        <div className="footer-legal">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {t(link.key)}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
