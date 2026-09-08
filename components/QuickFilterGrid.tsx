"use client";

import { useMemo, useState, type ReactNode } from "react";

type FacetOption = { value: string; label: string };
type Facet = { key: string; label: string; options: FacetOption[] };
export type QuickFilterItem = {
  key: string;
  searchText: string;
  facetValues: Record<string, string | null>;
  node: ReactNode;
};

/**
 * Στιγμιαίο, client-side φιλτράρισμα λιστών (οινοποιεία, περιοχές).
 * Οι κάρτες έρχονται ήδη αποδοσμένες από τον server (μόνο δεδομένα, καμία
 * συνάρτηση περνά το όριο server/client) — η αναζήτηση και τα chips απλώς
 * δείχνουν/κρύβουν, χωρίς καμία νέα κλήση δικτύου, ώστε ο χρήστης να μη
 * χρειάζεται να σκρολάρει ολόκληρη τη λίστα για να βρει αυτό που ψάχνει.
 */
export default function QuickFilterGrid({
  items,
  facets = [],
  searchPlaceholder = "Αναζήτηση…",
  emptyMessage = "Καμία αντιστοιχία.",
  nounSingular,
  nounPlural,
  gridClassName = "index-grid",
}: {
  items: QuickFilterItem[];
  facets?: Facet[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  nounSingular: string;
  nounPlural: string;
  gridClassName?: string;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("el");
    return items.filter((item) => {
      if (q && !item.searchText.toLocaleLowerCase("el").includes(q)) return false;
      for (const facet of facets) {
        const selected = active[facet.key];
        if (selected && item.facetValues[facet.key] !== selected) return false;
      }
      return true;
    });
  }, [items, query, active, facets]);

  return (
    <>
      <p className="result-count">
        {filtered.length} {filtered.length === 1 ? nounSingular : nounPlural}
      </p>

      <div className="quick-filter-bar">
        <input
          type="text"
          className="quick-search"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {facets.map((facet) => (
          <div className="filter-row" key={facet.key}>
            <button
              type="button"
              className={`chip${!active[facet.key] ? " is-active" : ""}`}
              onClick={() => setActive((a) => ({ ...a, [facet.key]: "" }))}
            >
              Όλα
            </button>
            {facet.options.map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={`chip${active[facet.key] === opt.value ? " is-active" : ""}`}
                onClick={() =>
                  setActive((a) => ({
                    ...a,
                    [facet.key]: a[facet.key] === opt.value ? "" : opt.value,
                  }))
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="quick-empty">{emptyMessage}</p>
      ) : (
        <div className={gridClassName}>{filtered.map((item) => item.node)}</div>
      )}
    </>
  );
}
