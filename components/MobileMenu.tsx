"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import AuthNavLink from "@/components/AuthNavLink";
import type { TranslationKey } from "@/lib/i18n";

const links = [
  { href: "/krasia", key: "nav_wines" },
  { href: "/oinopoieia", key: "nav_wineries" },
  { href: "/perioches", key: "nav_regions" },
  { href: "/poikilies", key: "nav_varieties" },
  { href: "/arthra", key: "nav_articles" },
] as const satisfies ReadonlyArray<{ href: string; key: TranslationKey }>;

export default function MobileMenu({ initials }: { initials: string | null }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" className="menu-trigger" aria-label={t("nav_menu")} onClick={() => setOpen(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="7" x2="21" y2="7" />
          <line x1="3" y1="14" x2="21" y2="14" />
          <line x1="3" y1="21" x2="15" y2="21" />
        </svg>
      </button>

      {open && (
        <>
          <div className="mobile-menu-overlay" role="presentation" onClick={() => setOpen(false)} />
          <div className="mobile-menu-panel" role="dialog" aria-modal="true" aria-label={t("nav_menu")}>
            <div className="mobile-menu-head">
              <span className="logo">oenia</span>
              <button
                type="button"
                className="mobile-menu-close"
                aria-label={t("nav_close_menu")}
                onClick={() => setOpen(false)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="4" x2="20" y2="20" />
                  <line x1="20" y1="4" x2="4" y2="20" />
                </svg>
              </button>
            </div>

            <nav className="mobile-menu-links">
              {links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                  {t(link.key)}
                </Link>
              ))}
              <span onClick={() => setOpen(false)}>
                <AuthNavLink initials={initials} />
              </span>
            </nav>

            <div className="mobile-menu-foot">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </>
      )}
    </>
  );
}
