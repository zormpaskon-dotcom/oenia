"use client";

import { useState } from "react";
import Link from "next/link";

type CheckOption = { value: string; label: string; count: number; active: boolean; href: string };

/** Ομάδα φίλτρων με προαιρετικό πεδίο αναζήτησης — για λίστες με πολλές επιλογές
 * (Περιοχή, Ποικιλία, Οινοποιείο). `collapsible` τη μετατρέπει σε accordion —
 * ανοιχτή από προεπιλογή μόνο όταν έχει ήδη ενεργό filter (`defaultOpen`),
 * ώστε το drawer να μένει συμπαγές χωρίς να κρύβει τι έχει ήδη επιλέξει ο χρήστης. */
export default function FilterCheckboxGroup({
  title,
  options,
  searchable,
  searchPlaceholder,
  collapsible,
  defaultOpen,
}: {
  title: string;
  options: CheckOption[];
  searchable?: boolean;
  searchPlaceholder?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(!collapsible || !!defaultOpen);

  if (options.length === 0) return null;

  const normalizedQuery = query.trim().toLocaleLowerCase("el");
  const visible = normalizedQuery
    ? options.filter((opt) => opt.label.toLocaleLowerCase("el").includes(normalizedQuery))
    : options;

  return (
    <div className="filter-group">
      {collapsible ? (
        <button
          type="button"
          className="filter-group-toggle"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <h3>{title}</h3>
          <span className={`filter-group-chevron${open ? " is-open" : ""}`} aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
      ) : (
        <h3>{title}</h3>
      )}

      {open && (
        <>
          {searchable && options.length > 8 && (
            <input
              type="text"
              className="filter-search"
              placeholder={searchPlaceholder ?? "Αναζήτηση…"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={searchPlaceholder ?? "Αναζήτηση"}
            />
          )}
          <div className="filter-option-list">
            {visible.length === 0 ? (
              <p className="filter-no-match">Καμία αντιστοιχία.</p>
            ) : (
              visible.map((opt) => (
                <Link
                  key={opt.value}
                  href={opt.href}
                  className="filter-option"
                  aria-pressed={opt.active}
                  style={opt.active ? { color: "var(--wine)", fontWeight: 500 } : undefined}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: 4,
                      border: "1px solid var(--line)",
                      background: opt.active ? "var(--wine)" : "transparent",
                      borderColor: opt.active ? "var(--wine)" : "var(--line)",
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                  {opt.label}
                  <span className="count">{opt.count}</span>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
