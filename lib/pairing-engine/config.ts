import type { WineStyle } from "@prisma/client";

// Locked constants από το "Food Pairing Scoring Engine — Final Approval Pass".
// Κάθε αλλαγή εδώ πρέπει να περάσει από το ίδιο review process (theoretical
// walkthrough πριν production) — δεν αλλάζουμε αριθμούς εδώ για να
// "διορθώσουμε" ένα αποτέλεσμα σε production χωρίς re-test.

export const COMPONENT_WEIGHTS = {
  acidity: 35,
  body: 35,
  sweetness: 30,
} as const;

export const ACIDITY_FIT = {
  requiredBase: 20,
  saltCoefficient: 12,
  fatCoefficient: 12,
  excessPenaltyCoefficient: 0.3,
  shortfallPenaltyCoefficient: 0.9,
} as const;

export const BODY_FIT = {
  requiredBase: 20,
  // Locked 2026-09-11: 16 → 24 μετά το Acidity/Body Fit compression tuning
  // pass (Candidate "Body-B"). Στόχος: μείωση του score compression σε
  // steak/moussaka (πολλά κρασιά συσσωρευμένα στο 90+) χωρίς regression στα
  // ήδη κλειδωμένα rankings. Επιβεβαιωμένο σε 353 πραγματικά κρασιά:
  // steak 66%→42%, moussaka 43%→24% στο 90+, μηδενική επιστροφή λευκών στο
  // steak top10 ή του SEMI_SWEET Piccolo Mondo στο moussaka top10. Η
  // Acidity Fit ΔΕΝ αγγίχτηκε — κάθε δοκιμασμένη αύξησή της επανέφερε το
  // sushi OFF_DRY-vs-DRY πρόβλημα.
  fatCoefficient: 24,
  excessPenaltyCoefficient: 0.25,
  // Locked 2026-09-11: 0.8 → 1.2 μετά το critical walkthrough (steak scored
  // 88/100 με ελαφρύ, χαμηλής τανίνης λευκό — υπερβολικά ψηλό). Βλ. re-test
  // στο scoreWineForDish.test.ts.
  shortfallPenaltyCoefficient: 1.2,
} as const;

export const SWEETNESS_FIT = {
  excessPenaltyCoefficient: 6,
  // Locked 2026-09-11: 25 → 10, μετά το Sweetness Fit tuning analysis
  // (Candidate D, επιβεβαιωμένο με retrospective simulation σε 353
  // πραγματικά κρασιά). Fix για δύο πραγματικά ranking issues: OFF_DRY
  // Moschato πάνω από DRY high-acid λευκά σε sushi, SEMI_SWEET Piccolo
  // Mondo πάνω από DRY δομημένα ερυθρά σε μουσακά — και τα δύο λόγω
  // dish.sweetness=1 (μικρό gap, το shortfall=25 υπερτιμούσε τη διαφορά).
  // Το dessert hard cap (DESSERT_HARD_CAPS) είναι ανεξάρτητο από αυτόν τον
  // συντελεστή, άρα τα desserts παραμένουν προστατευμένα.
  shortfallPenaltyCoefficient: 10,
} as const;

// wine.style → αριθμητικό sweetness, ίδια 0–5 κλίμακα με το food profile.
export const STYLE_SWEETNESS: Record<WineStyle, number> = {
  DRY: 0,
  OFF_DRY: 1,
  SEMI_SWEET: 3,
  SWEET: 5,
};

export const SPICE_PENALTY = {
  triggerSpiciness: 4,
  tanninTierFactor: {
    low: 0, // tannins 0–33
    medium: 1, // tannins 34–66
    high: 2, // tannins 67–100
  },
  lowTanninMax: 33,
  mediumTanninMax: 66,
  perUnitPenalty: 10,
  maxPenalty: 30,
} as const;

export const SPICE_SWEETNESS_FLOOR_BUMP = 1;

export const DESSERT_HARD_CAPS = {
  // dish.sweetness >= 4 AND wine.sweetness <= 1
  strong: { dishSweetnessMin: 4, wineSweetnessMax: 1, cap: 20 },
  // dish.sweetness in [2,3] AND wine.sweetness == 0
  moderate: { dishSweetnessRange: [2, 3] as [number, number], wineSweetnessExact: 0, cap: 50 },
} as const;

export const CONFIDENCE_CEILINGS = {
  HIGH: 100,
  MEDIUM: 90,
  LOW: 70,
} as const;

export type ConfidenceTier = keyof typeof CONFIDENCE_CEILINGS;

export const DOMINANT_VARIETY_THRESHOLD = 60; // %

// Acid/body lever ανά FoodCategory.slug (πόσο βαραίνει η οξύτητα έναντι
// δομής/τανίνης όταν το πιάτο έχει λιπαρότητα). Λείπει από τον πίνακα =
// DEFAULT_LEVER (ουδέτερο — π.χ. "dessert"/"spicy" όπου το acid/body δεν
// είναι ο κύριος άξονας).
export const CATEGORY_LEVERS: Record<string, { acid: number; body: number }> = {
  seafood: { acid: 0.9, body: 0.1 },
  vegetarian: { acid: 0.8, body: 0.2 },
  pasta: { acid: 0.7, body: 0.3 },
  cheese: { acid: 0.6, body: 0.4 },
  "white-meat": { acid: 0.5, body: 0.5 },
  "red-meat": { acid: 0.3, body: 0.7 },
};

export const DEFAULT_LEVER = { acid: 0.5, body: 0.5 };
