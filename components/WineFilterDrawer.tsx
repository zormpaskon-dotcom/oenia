"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import FilterCheckboxGroup from "./FilterCheckboxGroup";

type CheckOption = { value: string; label: string; count: number; active: boolean; href: string };

export type WineFilterDrawerProps = {
  colorOptions: CheckOption[];
  regionOptions: CheckOption[];
  varietyOptions: CheckOption[];
  wineryOptions: CheckOption[];
  styleOptions: CheckOption[];
  clearHref: string;
  hasActiveFilters: boolean;
  resultsCount: number;
};

// Ίδιο interaction pattern με το MobileMenu.tsx (open state, Escape να κλείνει,
// overlay click να κλείνει, role="dialog") — το ίδιο "drawer" idiom του site,
// όχι νέο μηχανισμό. Τα φίλτρα παραμένουν απλά <Link> (ίδιο URL-driven σύστημα
// με πριν) — κάθε click κάνει πραγματική navigation και ενημερώνει τα πραγματικά
// αποτελέσματα από κάτω, το drawer απλά δεν κλείνει ενδιάμεσα ώστε να μπορεί ο
// χρήστης να συνδυάσει πολλά filters βλέποντας το μετρητή να ενημερώνεται ζωντανά.
export default function WineFilterDrawer({
  colorOptions,
  regionOptions,
  varietyOptions,
  wineryOptions,
  styleOptions,
  clearHref,
  hasActiveFilters,
  resultsCount,
}: WineFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  // Το drawer μένει mounted λίγο μετά το setOpen(false) ώστε να προλαβαίνει να
  // παίξει το CSS exit animation (filterDrawerPanelOut/OverlayOut, βλ. globals.css)
  // αντί να εξαφανίζεται ακαριαία — καθαρά οπτικό, δεν αλλάζει τι φιλτράρει/renders.
  const [rendered, setRendered] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open || !rendered) return;
    const timer = setTimeout(() => setRendered(false), 250);
    return () => clearTimeout(timer);
  }, [open, rendered]);

  function openDrawer() {
    setRendered(true);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className={`filter-drawer-trigger${hasActiveFilters ? " has-active" : ""}`}
        onClick={openDrawer}
        aria-haspopup="dialog"
      >
        Φίλτρα
      </button>

      {rendered && (
        <>
          <div
            className={`filter-drawer-overlay${open ? "" : " is-closing"}`}
            role="presentation"
            onClick={close}
          />
          <div
            className={`filter-drawer-panel${open ? "" : " is-closing"}`}
            role="dialog"
            aria-modal="true"
            aria-label="Φίλτρα"
            tabIndex={-1}
            ref={panelRef}
          >
            <div className="filter-drawer-head">
              <h2>ΦΙΛΤΡΑ</h2>
              <button type="button" className="filter-drawer-close" aria-label="Κλείσιμο φίλτρων" onClick={close}>
                ×
              </button>
            </div>

            <div className="filter-drawer-body">
              <FilterCheckboxGroup title="Χρώμα" options={colorOptions} />
              <FilterCheckboxGroup
                title="Περιοχή"
                options={regionOptions}
                searchable
                searchPlaceholder="Αναζήτηση περιοχής…"
                collapsible
                defaultOpen={regionOptions.some((o) => o.active)}
              />
              <FilterCheckboxGroup
                title="Ποικιλία"
                options={varietyOptions}
                searchable
                searchPlaceholder="Αναζήτηση ποικιλίας…"
                collapsible
                defaultOpen={varietyOptions.some((o) => o.active)}
              />
              <FilterCheckboxGroup
                title="Οινοποιείο"
                options={wineryOptions}
                searchable
                searchPlaceholder="Αναζήτηση οινοποιείου…"
                collapsible
                defaultOpen={wineryOptions.some((o) => o.active)}
              />
              <FilterCheckboxGroup
                title="Στυλ"
                options={styleOptions}
                collapsible
                defaultOpen={styleOptions.some((o) => o.active)}
              />
            </div>

            <div className="filter-drawer-foot">
              <Link href={clearHref} className="filter-drawer-clear" onClick={close}>
                Καθαρισμός
              </Link>
              <button type="button" className="btn-primary filter-drawer-apply" onClick={close}>
                Εμφάνιση {resultsCount} αποτελεσμάτων
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
