"use client";

import { useState } from "react";

// Οπτικό-μόνο στοιχείο πάνω στην κάρτα — σκόπιμα ΧΩΡΙΣ persistence (κανένα
// localStorage, καμία λίστα αγαπημένων). Local toggle μόνο, γυρνάει στο
// αρχικό state σε reload/navigation. Μην το μετατρέψεις σε πραγματική
// λειτουργία αποθήκευσης χωρίς να ξαναδεί ο χρήστης το σχεδιασμό της —
// αυτή είναι ρητή, επιβεβαιωμένη απόφαση ("cosmetic only").
export default function BookmarkButton({ label }: { label: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      className={`card-bookmark-btn${saved ? " is-saved" : ""}`}
      aria-label={saved ? `Αφαίρεση «${label}» από τα αγαπημένα` : `Προσθήκη «${label}» στα αγαπημένα`}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved((s) => !s);
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
      </svg>
    </button>
  );
}
