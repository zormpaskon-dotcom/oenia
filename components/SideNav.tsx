"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import SearchOverlay from "@/components/SearchOverlay";
import AuthNavLink from "@/components/AuthNavLink";
import { PRIMARY_NAV } from "@/lib/nav";

export default function SideNav({ initials }: { initials: string | null }) {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <aside className="side-nav" aria-label={t("nav_menu")}>
      <div className="side-nav-top">
        <Link href="/" className="side-nav-brand">
          <span className="logo">oenia</span>
          <span className="side-nav-tagline">{t("nav_tagline")}</span>
        </Link>

        <nav className="side-nav-links">
          {PRIMARY_NAV.map((link, i) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`side-nav-link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="side-nav-num">{String(i + 1).padStart(2, "0")}</span>
                <span>{t(link.key)}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="side-nav-bottom">
        <div className="side-nav-utility">
          <SearchOverlay />
          <ThemeToggle />
        </div>
        <div className="side-nav-foot-links">
          <Link href="/pos-leitourgoume">{t("nav_about")}</Link>
          <a href="mailto:info@worldofoenia.com">{t("footer_contact")}</a>
          <AuthNavLink initials={initials} />
        </div>
        <div className="side-nav-foot-row">
          <LanguageToggle />
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="side-nav-social" aria-label="Instagram">
            Instagram
          </a>
        </div>
      </div>
    </aside>
  );
}
