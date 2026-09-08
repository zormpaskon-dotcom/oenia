"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { VarietyType, type Variety } from "@prisma/client";

function LeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3c5 3 7 8 4 13-2 3-6 4-8 2-2-3 0-8 4-11z" />
      <path d="M12 3v16" />
    </svg>
  );
}

type TypeFilter = "ALL" | VarietyType;

/** Άμεση αναζήτηση/φιλτράρισμα στη σελίδα ποικιλιών, χωρίς σκρολ σε όλη τη λίστα. */
export default function VarietiesExplorer({ varieties }: { varieties: Variety[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("el");
    return varieties.filter((v) => {
      if (typeFilter !== "ALL" && v.type !== typeFilter) return false;
      if (!q) return true;
      return `${v.name} ${v.originRegion ?? ""}`.toLocaleLowerCase("el").includes(q);
    });
  }, [varieties, query, typeFilter]);

  const whites = filtered.filter((v) => v.type === VarietyType.WHITE);
  const reds = filtered.filter((v) => v.type === VarietyType.RED);

  return (
    <>
      <p className="result-count">
        {filtered.length} {filtered.length === 1 ? "ποικιλία" : "ποικιλίες"}
      </p>

      <div className="quick-filter-bar">
        <input
          type="text"
          className="quick-search"
          placeholder="Αναζήτηση ποικιλίας ή περιοχής προέλευσης…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="filter-row">
          <button type="button" className={`chip${typeFilter === "ALL" ? " is-active" : ""}`} onClick={() => setTypeFilter("ALL")}>
            Όλα
          </button>
          <button
            type="button"
            className={`chip${typeFilter === VarietyType.WHITE ? " is-active" : ""}`}
            onClick={() => setTypeFilter(VarietyType.WHITE)}
          >
            Λευκές
          </button>
          <button
            type="button"
            className={`chip${typeFilter === VarietyType.RED ? " is-active" : ""}`}
            onClick={() => setTypeFilter(VarietyType.RED)}
          >
            Κόκκινες
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="quick-empty">Καμία ποικιλία δεν ταιριάζει με αυτά τα φίλτρα.</p>
      ) : (
        <>
          <VarietyGroup title="Λευκές" items={whites} />
          <VarietyGroup title="Κόκκινες" items={reds} />
        </>
      )}
    </>
  );
}

function VarietyGroup({ title, items }: { title: string; items: Variety[] }) {
  if (items.length === 0) return null;
  return (
    <section style={{ padding: "40px 0 0" }}>
      <h2 className="section-title">{title}</h2>
      <div className="variety-list">
        {items.map((v) => (
          <Link key={v.id} href={`/poikilies/${v.slug}`} className="variety-item">
            <span className="leaf-badge" style={{ marginBottom: 0 }}>
              <LeafIcon />
            </span>
            <span>
              <span className="v-name" style={{ display: "block" }}>
                {v.name}
              </span>
              <span className="v-region">{v.originRegion ?? "Ελλάδα"}</span>
            </span>
            <p className="v-detail">{v.description ?? ""}</p>
            <span className="v-color">{v.type === VarietyType.WHITE ? "Λευκή" : "Κόκκινη"}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
