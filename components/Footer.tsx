"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";

const footerColumns = [
  {
    titleKey: "footer_col_discover",
    links: [
      { href: "/tairiasma", key: "explore_pairing" },
      { href: "/diavatirio", key: "explore_passport" },
      { href: "/chartis", key: "explore_map" },
    ],
  },
  {
    titleKey: "footer_col_explore",
    links: [
      { href: "/krasia", key: "nav_wines" },
      { href: "/oinopoieia", key: "nav_wineries" },
      { href: "/poikilies", key: "nav_varieties" },
      { href: "/perioches", key: "footer_regions" },
    ],
  },
  {
    titleKey: "footer_col_content",
    links: [
      { href: "/arthra", key: "nav_articles" },
      { href: "/perioches", key: "footer_regions" },
      { href: "/arthra", key: "footer_guides" },
    ],
  },
  {
    titleKey: "footer_col_about",
    links: [
      { href: "/pos-leitourgoume", key: "footer_how_it_works" },
      { href: "/gia-oinopoieia", key: "footer_for_wineries" },
      { href: "/sygkrisi", key: "explore_compare" },
    ],
  },
  {
    titleKey: "footer_col_legal",
    links: [
      { href: "/politiki-aporritou", key: "footer_privacy" },
      { href: "/oroi-xrisis", key: "footer_terms" },
      { href: "/politiki-moderation", key: "footer_moderation" },
    ],
  },
] as const satisfies ReadonlyArray<{
  titleKey: TranslationKey;
  links: ReadonlyArray<{ href: string; key: TranslationKey }>;
}>;

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div>
          <div className="logo" style={{ fontSize: 30 }}>
            oenia
          </div>
          <p className="footer-note">{t("footer_note")}</p>
        </div>
        <div className="footer-links">
          {footerColumns.map((col) => (
            <div className="footer-col" key={col.titleKey}>
              <h4>{t(col.titleKey)}</h4>
              {col.links.map((link, i) => (
                <Link key={`${link.href}-${i}`} href={link.href}>
                  {t(link.key)}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="wrap footer-bottom">{t("footer_bottom")}</div>
    </footer>
  );
}
