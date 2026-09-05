"use client";

import { useState } from "react";
import Link from "next/link";

type CheckOption = { value: string; label: string; count: number; active: boolean; href: string };

/** Ομάδα φίλτρων με προαιρετικό πεδίο αναζήτησης — για λίστες με πολλές επιλογές (Περιοχή, Ποικιλία). */
export default function FilterCheckboxGroup({
  title,
  options,
  searchable,
  searchPlaceholder,
}: {
  title: string;
  options: CheckOption[];
  searchable?: boolean;
  searchPlaceholder?: string;
}) {
  const [query, setQuery] = useState("");

  if (options.length === 0) return null;

  const normalizedQuery = query.trim().toLocaleLowerCase("el");
  const visible = normalizedQuery
    ? options.filter((opt) => opt.label.toLocaleLowerCase("el").includes(normalizedQuery))
    : options;

  return (
    <div className="filter-group">
      <h3>{title}</h3>
      {searchable && options.length > 8 && (
        <input
          type="text"
          className="filter-search"
          placeholder={searchPlaceholder ?? "Αναζήτηση…"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
    </div>
  );
}
