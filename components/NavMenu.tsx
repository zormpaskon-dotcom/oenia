"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import SearchOverlay from "@/components/SearchOverlay";
import AuthNavLink from "@/components/AuthNavLink";
import { PRIMARY_NAV } from "@/lib/nav";

// Ενιαίο, collapsed-by-default navigation — desktop ΚΑΙ mobile μοιράζονται
// το ίδιο off-canvas panel (navigation refinement: πριν υπήρχε μόνιμα
// ανοιχτό SideNav στο desktop + ξεχωριστό MobileMenu στο mobile — δύο
// διαφορετικά συστήματα). Τώρα το site-topbar (logo + MENU trigger) είναι
// universal, καμία μόνιμη στήλη πλοήγησης δεν καταναλώνει πλάτος περιεχομένου.
export default function NavMenu({ initials }: { initials: string | null }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="menu-trigger"
        aria-label={t("nav_menu")}
        aria-expanded={open}
        aria-controls="site-nav-panel"
        onClick={() => setOpen(true)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="7" x2="21" y2="7" />
          <line x1="3" y1="14" x2="21" y2="14" />
          <line x1="3" y1="21" x2="15" y2="21" />
        </svg>
        <span className="menu-trigger-label">{t("nav_menu")}</span>
      </button>

      {open && (
        <>
          <div className="nav-panel-overlay" role="presentation" onClick={() => setOpen(false)} />
          <div id="site-nav-panel" className="nav-panel" role="dialog" aria-modal="true" aria-label={t("nav_menu")}>
            <div className="nav-panel-head">
              <Link href="/" className="logo" onClick={() => setOpen(false)}>
                oenia
              </Link>
              <button
                ref={closeRef}
                type="button"
                className="nav-panel-close"
                aria-label={t("nav_close_menu")}
                onClick={() => setOpen(false)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="4" x2="20" y2="20" />
                  <line x1="20" y1="4" x2="4" y2="20" />
                </svg>
              </button>
            </div>

            <nav className="nav-panel-links">
              {PRIMARY_NAV.map((link, i) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-panel-link${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    <span className="nav-panel-num">{String(i + 1).padStart(2, "0")}</span>
                    <span>{t(link.key)}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="nav-panel-foot">
              <div className="nav-panel-utility">
                <span onClick={() => setOpen(false)}>
                  <SearchOverlay />
                </span>
                <ThemeToggle />
              </div>
              <div className="nav-panel-foot-links">
                <Link href="/pos-leitourgoume" onClick={() => setOpen(false)}>
                  {t("nav_about")}
                </Link>
                <a href="mailto:info@worldofoenia.com">{t("footer_contact")}</a>
                <span onClick={() => setOpen(false)}>
                  <AuthNavLink initials={initials} />
                </span>
              </div>
              <div className="nav-panel-foot-row">
                <LanguageToggle />
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="nav-panel-social">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
