"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { searchSite, type SearchResult } from "@/lib/search";
import { useLanguage } from "@/components/LanguageProvider";

const EMPTY: SearchResult = { wines: [], wineries: [], varieties: [] };

export default function SearchOverlay() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>(EMPTY);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery("");
      setResults(EMPTY);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const q = query.trim();
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
  const hasResults = results.wineries.length + results.wines.length + results.varieties.length > 0;

  return (
    <>
      <button className="nav-search" aria-label={t("nav_search")} onClick={() => setOpen(true)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {open && (
        <div className="search-overlay" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="search-panel glass-strong"
            role="dialog"
            aria-modal="true"
            aria-label={t("nav_search")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="search-input-row">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <button type="button" className="search-close" aria-label={t("search_close")} onClick={() => setOpen(false)}>
                Esc
              </button>
            </div>

            {hasQuery && (
              <div className="search-results">
                {loading && <p className="search-status">{t("search_searching")}</p>}
                {!loading && !hasResults && (
                  <p className="search-status">
                    {t("search_no_match")} «{query.trim()}»
                  </p>
                )}

                {!loading && results.wineries.length > 0 && (
                  <div className="search-group">
                    <h4>{t("search_wineries")}</h4>
                    {results.wineries.map((w) => (
                      <Link key={w.slug} href={`/oinopoieia/${w.slug}`} onClick={() => setOpen(false)}>
                        <span>{w.name}</span>
                        <span className="search-meta">{w.regionName}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {!loading && results.wines.length > 0 && (
                  <div className="search-group">
                    <h4>{t("search_wines")}</h4>
                    {results.wines.map((w) => (
                      <Link key={w.slug} href={`/krasia/${w.slug}`} onClick={() => setOpen(false)}>
                        <span>{w.name}</span>
                        <span className="search-meta">{w.wineryName}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {!loading && results.varieties.length > 0 && (
                  <div className="search-group">
                    <h4>{t("search_varieties")}</h4>
                    {results.varieties.map((v) => (
                      <Link key={v.slug} href={`/poikilies/${v.slug}`} onClick={() => setOpen(false)}>
                        <span>{v.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
