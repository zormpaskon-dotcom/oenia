import type { WineStyle } from "@prisma/client";
import type { ConfidenceTier } from "./config";

// Level-2 canonical dish μόνο (Food Taxonomy v2) — ποτέ ένα ωμό tag ή ένα
// Level-1/Level-1.5 umbrella δεν μπορεί να γίνει FoodProfile.
export type FoodProfile = {
  slug: string;
  name: string;
  categorySlug: string; // FoodCategory.slug
  saltiness: number; // 0–5
  fattiness: number; // 0–5
  spiciness: number; // 0–5
  sweetness: number; // 0–5
  editorialSanityCheck: string; // human-review only, ΠΟΤΕ στο numeric calc
  seoTitle?: string;
  seoDescription?: string;
};

export type WineVarietyInput = {
  percentage: number | null;
  variety: {
    acidity: number | null;
    body: number | null;
    tannins: number | null;
  };
};

export type WineInput = {
  id: string;
  style: WineStyle;
  varieties: WineVarietyInput[];
};

export type BlendResolution =
  | "no-variety"
  | "single-variety"
  | "full-percentage-blend"
  | "dominant-variety-estimate"
  | "unresolved-blend";

export type WineTraits = {
  acidity: number | null;
  body: number | null;
  tannins: number | null;
  wineSweetness: number; // πάντα υπολογίσιμο (100% κάλυψη μέσω style)
  blendResolution: BlendResolution;
  dataQualityFlags: string[];
};

export type ComponentResult = {
  score: number | null; // null = non-computable
  weight: number; // ενεργό βάρος μετά από redistribution
  requiredValue: number | null;
  actualValue: number | null;
  gap: number | null;
};

export type SpicePenalty = {
  type: "spice-tannin-clash";
  amount: number;
  wineTannins: number | null;
  dishSpiciness: number;
} | null;

export type ScoreResult = {
  dishSlug: string;
  wineId: string;
  totalScore: number;
  confidence: ConfidenceTier;
  components: {
    acidityFit: ComponentResult;
    bodyFit: ComponentResult;
    sweetnessFit: ComponentResult;
  };
  penalty: SpicePenalty;
  hardIncompatibility: boolean;
  hardIncompatibilityReason: string | null;
  explicitCategoryMatch: boolean;
  dataQualityFlags: string[];
};
