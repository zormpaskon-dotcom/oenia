"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { searchSite, type SearchResult } from "@/lib/search";
import { useLanguage } from "@/components/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";

const EMPTY: SearchResult = { wines: [], wineries: [], regions: [], varieties: [] };

type GroupKey = "wines" | "wineries" | "regions" | "varieties";
const GROUP_ORDER: GroupKey[] = ["wines", "wineries", "regions", "varieties"];
const GROUP_LABEL_KEY: Record<GroupKey, TranslationKey> = {
  wines: "search_wines",
  wineries: "search_wineries",
  regions: "search_regions",
  varieties: "search_varieties",
};
const GROUP_HREF: Record<GroupKey, (slug: string) => string> = {
  wines: (slug) => `/krasia/${slug}`,
  wineries: (slug) => `/oinopoieia/${slug}`,
  regions: (slug) => `/perioches/${slug}`,
  varieties: (slug) => `/poikilies/${slug}`,
};
// Όταν περισσότερα από ένα groups έχουν ακριβή αντιστοιχία (π.χ. υπάρχει
// και κρασί με ακριβώς το ίδιο όνομα με μια ποικιλία), η ποικιλία προηγείται
// — είναι η πιο συγκεκριμένη/μοναδική οντότητα για ένα τέτοιο αποτέλεσμα.
const EXACT_PRIORITY: Record<GroupKey, number> = { varieties: 0, wines: 1, wineries: 2, regions: 3 };

const EXPLORE_LINKS = [
  { href: "/krasia", key: "search_explore_wines" },
  { href: "/oinopoieia", key: "search_explore_wineries" },
  { href: "/perioches", key: "search_explore_regions" },
  { href: "/poikilies", key: "search_explore_grapes" },
] as const satisfies ReadonlyArray<{ href: string; key: TranslationKey }>;

function ArrowIcon() {
  return (
    <svg width="13" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8h21M15 1l7 7-7 7" />
    </svg>
  );
}

function hasExactMatch(items: { name: string }[], q: string): boolean {
  const query = q.toLowerCase();
  return items.some((i) => i.name.toLowerCase() === query);
}

export default function SearchOverlay() {
  const { t } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<Map<number, HTMLAnchorElement>>(new Map());

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    setQuery("");
    setResults(EMPTY);
    setLoading(false);
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    setHighlighted(0);
    if (q.length < 2) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      searchSite(q).then((r) => {
        setResults(r);
        setLoading(false);
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const hasQuery = query.trim().length >= 2;
  const hasResults = results.wines.length + results.wineries.length + results.regions.length + results.varieties.length > 0;

  // Group order: όποιο group περιέχει ΑΚΡΙΒΗ αντιστοιχία (π.χ. αναζήτηση
  // "Chardonnay" → η ίδια η ποικιλία) ανεβαίνει πρώτο· διαφορετικά η φυσική
  // σειρά Κρασιά/Οινοποιεία/Περιοχές/Ποικιλίες.
  const orderedGroups = useMemo(() => {
    return [...GROUP_ORDER].sort((a, b) => {
      const aExact = hasExactMatch(results[a], query);
      const bExact = hasExactMatch(results[b], query);
      if (aExact && bExact) return EXACT_PRIORITY[a] - EXACT_PRIORITY[b];
      if (aExact !== bExact) return aExact ? -1 : 1;
      return GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b);
    });
  }, [results, query]);

  // Επίπεδη λίστα με την ΙΔΙΑ σειρά που πραγματικά εμφανίζεται — χρησιμοποιείται
  // από το πληκτρολόγιο (ArrowUp/Down/Enter) ώστε το highlight index να
  // αντιστοιχεί πάντα στη σωστή γραμμή, και το Enter να κάνει πλοήγηση μέσω
  // του router (όχι μέσω .click() σε στοιχείο που μπορεί να ξεμοντάρεται
  // πριν προλάβει να ολοκληρωθεί η πλοήγηση του Next Link).
  const flatResults = useMemo(() => {
    const flat: { href: string }[] = [];
    for (const group of orderedGroups) {
      for (const item of results[group]) {
        flat.push({ href: GROUP_HREF[group](item.slug) });
      }
    }
    return flat;
  }, [orderedGroups, results]);

  useEffect(() => {
    function onOpenRequest() {
      setOpen(true);
    }
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("oenia:open-search", onOpenRequest);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("oenia:open-search", onOpenRequest);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, highlighted, flatResults]);

  function onKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setOpen((v) => !v);
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, Math.max(0, flatResults.length - 1)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Enter") {
      const target = flatResults[highlighted];
      if (target) {
        e.preventDefault();
        setOpen(false);
        router.push(target.href);
      }
    }
  }

  useEffect(() => {
    rowRefs.current.get(highlighted)?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  // Επίπεδη λίστα όλων των αποτελεσμάτων, με τη σειρά που πραγματικά
  // εμφανίζονται — χρειάζεται για το highlight index του πληκτρολογίου.
  let flatIndex = -1;

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button className="nav-search" aria-label={t("nav_search")} onClick={() => setOpen(true)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div className="search-overlay" role="presentation" onClick={close}>
          <div
            className={`search-panel${visible ? " is-visible" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={t("nav_search")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="search-head">
              <p className="search-eyebrow">{t("search_eyebrow")}</p>
              <div className="search-input-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("search_placeholder")}
                  aria-label={t("search_placeholder")}
                  autoComplete="off"
                />
                <button type="button" className="search-close" aria-label={t("search_close")} onClick={close}>
                  Esc
                </button>
              </div>
            </div>

            <div className="search-results">
              {!hasQuery && (
                <div className="search-empty">
                  <p className="search-group-label">{t("search_explore_heading")}</p>
                  <div className="search-explore-list">
                    {EXPLORE_LINKS.map((link) => (
                      <Link key={link.href} href={link.href} className="search-explore-row" onClick={close}>
                        {t(link.key)}
                        <ArrowIcon />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {hasQuery && loading && <p className="search-status">{t("search_searching")}</p>}

              {hasQuery && !loading && !hasResults && (
                <div className="search-empty">
                  <p className="search-no-results">
                    {t("search_no_results_for")} «{query.trim()}»
                  </p>
                  <p className="search-no-results-hint">{t("search_no_results_hint")}</p>
                  <div className="search-explore-list">
                    {EXPLORE_LINKS.map((link) => (
                      <Link key={link.href} href={link.href} className="search-explore-row" onClick={close}>
                        {t(link.key)}
                        <ArrowIcon />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {hasQuery &&
                !loading &&
                hasResults &&
                orderedGroups.map((group) => {
                  const items = results[group];
                  if (items.length === 0) return null;
                  return (
                    <div className="search-group" key={group}>
                      <p className="search-group-label">{t(GROUP_LABEL_KEY[group])}</p>
                      {items.map((item) => {
                        flatIndex += 1;
                        const idx = flatIndex;
                        const meta =
                          group === "wines"
                            ? `${(item as SearchResult["wines"][number]).wineryName} · ${(item as SearchResult["wines"][number]).regionName}`
                            : group === "wineries"
                              ? `${(item as SearchResult["wineries"][number]).regionName} · ${(item as SearchResult["wineries"][number]).macroRegionLabel}`
                              : group === "regions"
                                ? `${(item as SearchResult["regions"][number]).macroRegionLabel} · Ελλάδα`
                                : `${(item as SearchResult["varieties"][number]).typeLabel}${
                                    (item as SearchResult["varieties"][number]).originRegion
                                      ? ` · ${(item as SearchResult["varieties"][number]).originRegion}`
                                      : ""
                                  }`;
                        return (
                          <Link
                            key={item.slug}
                            ref={(el) => {
                              if (el) rowRefs.current.set(idx, el);
                              else rowRefs.current.delete(idx);
                            }}
                            href={GROUP_HREF[group](item.slug)}
                            className={`search-result-row${idx === highlighted ? " is-highlighted" : ""}`}
                            onMouseEnter={() => setHighlighted(idx)}
                            onClick={close}
                          >
                            <span className="search-result-text">
                              <span className="search-result-name">{item.name}</span>
                              <span className="search-result-meta">{meta}</span>
                            </span>
                            <ArrowIcon />
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>,
          document.body
        )}
    </>
  );
}
