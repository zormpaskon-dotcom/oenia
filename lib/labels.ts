export const COLOR_NAME: Record<string, string> = {
  WHITE: "Λευκό",
  RED: "Κόκκινο",
  ROSE: "Ροζέ",
  ORANGE: "Πορτοκαλί",
};

export const STYLE_NAME: Record<string, string> = {
  DRY: "Ξηρό",
  OFF_DRY: "Ημίξηρο",
  SEMI_SWEET: "Ημίγλυκο",
  SWEET: "Γλυκό",
};

export const APPELLATION_LABEL: Record<string, string> = {
  PDO: "ΠΟΠ",
  PGI: "ΠΓΕ",
  TABLE: "Τοπικός",
};

export const MACRO_REGION_LABEL: Record<string, string> = {
  NORTHERN_GREECE: "Βόρεια Ελλάδα",
  CENTRAL_GREECE: "Κεντρική Ελλάδα",
  PELOPONNESE: "Πελοπόννησος",
  IONIAN_ISLANDS: "Ιόνια Νησιά",
  AEGEAN_ISLANDS: "Νησιά Αιγαίου",
  CRETE: "Κρήτη",
  EPIRUS: "Ήπειρος",
};

export function reviewCountLabel(count: number) {
  return `${count} ${count === 1 ? "αξιολόγηση" : "αξιολογήσεις"}`;
}

/** "4,3 · 28 αξιολογήσεις", ή ένα ουδέτερο μήνυμα όταν reviewCount === 0 — ποτέ "0,00 · 0
 * αξιολογήσεις", που διαβάζεται σαν μηδενική βαθμολογία αντί για "δεν έχει αξιολογηθεί ακόμη". */
export function ratingLabel(avgRating: number, reviewCount: number, compact = false) {
  if (reviewCount === 0) {
    return compact ? "Χωρίς αξιολογήσεις" : "Δεν έχει αξιολογηθεί ακόμη";
  }
  return `${avgRating.toFixed(1).replace(".", ",")} · ${reviewCountLabel(reviewCount)}`;
}

export const CATEGORY_LABEL: Record<string, string> = {
  VARIETIES: "Ποικιλίες",
  REGIONS: "Περιοχές",
  GUIDES: "Οδηγοί",
  PEOPLE: "Άνθρωποι",
  NEWS: "Νέα",
};

export const COLOR_GRADIENT: Record<string, string> = {
  WHITE: "linear-gradient(160deg,#E4D9B8,#C7A96E)",
  RED: "linear-gradient(160deg,#8B5A46,#4A2117)",
  ROSE: "linear-gradient(160deg,#E7B8AE,#C77E72)",
  ORANGE: "linear-gradient(160deg,#E0A55C,#B8702F)",
};
