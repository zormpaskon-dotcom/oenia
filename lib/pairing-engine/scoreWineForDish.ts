import {
  ACIDITY_FIT,
  BODY_FIT,
  CATEGORY_LEVERS,
  COMPONENT_WEIGHTS,
  CONFIDENCE_CEILINGS,
  DEFAULT_LEVER,
  DESSERT_HARD_CAPS,
  SPICE_PENALTY,
  SPICE_SWEETNESS_FLOOR_BUMP,
  SWEETNESS_FIT,
  type ConfidenceTier,
} from "./config";
import { resolveWineTraits } from "./resolveWineTraits";
import type { ComponentResult, FoodProfile, ScoreResult, SpicePenalty, WineInput, WineTraits } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function acidityFit(dish: FoodProfile, traits: WineTraits): ComponentResult {
  const lever = CATEGORY_LEVERS[dish.categorySlug] ?? DEFAULT_LEVER;
  const required = clamp(
    ACIDITY_FIT.requiredBase + ACIDITY_FIT.saltCoefficient * dish.saltiness + ACIDITY_FIT.fatCoefficient * dish.fattiness * lever.acid,
    20,
    100
  );

  if (traits.acidity === null) {
    return { score: null, weight: COMPONENT_WEIGHTS.acidity, requiredValue: required, actualValue: null, gap: null };
  }

  const gap = traits.acidity - required;
  const raw =
    gap >= 0 ? 100 - ACIDITY_FIT.excessPenaltyCoefficient * gap : 100 - ACIDITY_FIT.shortfallPenaltyCoefficient * Math.abs(gap);

  return {
    score: clamp(raw, 0, 100),
    weight: COMPONENT_WEIGHTS.acidity,
    requiredValue: required,
    actualValue: traits.acidity,
    gap,
  };
}

function bodyFit(dish: FoodProfile, traits: WineTraits): ComponentResult {
  const lever = CATEGORY_LEVERS[dish.categorySlug] ?? DEFAULT_LEVER;
  const required = clamp(BODY_FIT.requiredBase + BODY_FIT.fatCoefficient * dish.fattiness * lever.body, 20, 100);

  if (traits.body === null || traits.tannins === null) {
    return { score: null, weight: COMPONENT_WEIGHTS.body, requiredValue: required, actualValue: null, gap: null };
  }

  const wineStructure = 0.5 * traits.body + 0.5 * traits.tannins;
  const gap = wineStructure - required;
  const raw = gap >= 0 ? 100 - BODY_FIT.excessPenaltyCoefficient * gap : 100 - BODY_FIT.shortfallPenaltyCoefficient * Math.abs(gap);

  return {
    score: clamp(raw, 0, 100),
    weight: COMPONENT_WEIGHTS.body,
    requiredValue: required,
    actualValue: wineStructure,
    gap,
  };
}

function sweetnessFit(dish: FoodProfile, traits: WineTraits): { result: ComponentResult; effectiveDishSweetness: number } {
  const effectiveDishSweetness = Math.min(5, dish.sweetness + (dish.spiciness >= SPICE_PENALTY.triggerSpiciness ? SPICE_SWEETNESS_FLOOR_BUMP : 0));

  const gap = traits.wineSweetness - effectiveDishSweetness;
  const raw =
    gap >= 0 ? 100 - SWEETNESS_FIT.excessPenaltyCoefficient * gap : 100 - SWEETNESS_FIT.shortfallPenaltyCoefficient * Math.abs(gap);

  return {
    result: {
      score: clamp(raw, 0, 100),
      weight: COMPONENT_WEIGHTS.sweetness,
      requiredValue: effectiveDishSweetness,
      actualValue: traits.wineSweetness,
      gap,
    },
    effectiveDishSweetness,
  };
}

function tanninTier(tannins: number): "low" | "medium" | "high" {
  if (tannins <= SPICE_PENALTY.lowTanninMax) return "low";
  if (tannins <= SPICE_PENALTY.mediumTanninMax) return "medium";
  return "high";
}

function spicePenalty(dish: FoodProfile, traits: WineTraits): SpicePenalty {
  if (dish.spiciness < SPICE_PENALTY.triggerSpiciness) return null;
  if (traits.tannins === null) return null; // ρητά skip, ΟΧΙ σιωπηλό 0-tannin assumption — βλ. dataQualityFlags

  const factor = SPICE_PENALTY.tanninTierFactor[tanninTier(traits.tannins)];
  const amount = clamp((dish.spiciness - 3) * factor * SPICE_PENALTY.perUnitPenalty, 0, SPICE_PENALTY.maxPenalty);
  if (amount === 0) return null;

  return { type: "spice-tannin-clash", amount, wineTannins: traits.tannins, dishSpiciness: dish.spiciness };
}

function hardIncompatibility(dish: FoodProfile, traits: WineTraits): { triggered: boolean; cap: number | null; reason: string | null } {
  const strong = DESSERT_HARD_CAPS.strong;
  if (dish.sweetness >= strong.dishSweetnessMin && traits.wineSweetness <= strong.wineSweetnessMax) {
    return {
      triggered: true,
      cap: strong.cap,
      reason: `dish.sweetness (${dish.sweetness}) >= ${strong.dishSweetnessMin} και wine.sweetness (${traits.wineSweetness}) <= ${strong.wineSweetnessMax} — το κρασί είναι πολύ ξηρό για αυτό το γλυκό.`,
    };
  }

  const moderate = DESSERT_HARD_CAPS.moderate;
  const [lo, hi] = moderate.dishSweetnessRange;
  if (dish.sweetness >= lo && dish.sweetness <= hi && traits.wineSweetness === moderate.wineSweetnessExact) {
    return {
      triggered: true,
      cap: moderate.cap,
      reason: `dish.sweetness (${dish.sweetness}) στο εύρος [${lo}, ${hi}] και wine.sweetness είναι εντελώς ξηρό (0) — ανεπαρκές για μετρίως γλυκό πιάτο.`,
    };
  }

  return { triggered: false, cap: null, reason: null };
}

function confidenceTier(traits: WineTraits, hasExplicitCategoryMatch: boolean): ConfidenceTier {
  if (
    traits.acidity === null ||
    traits.body === null ||
    traits.tannins === null ||
    traits.blendResolution === "unresolved-blend" ||
    traits.blendResolution === "no-variety"
  ) {
    return "LOW";
  }
  if (traits.blendResolution === "dominant-variety-estimate" || !hasExplicitCategoryMatch) {
    return "MEDIUM";
  }
  return "HIGH";
}

// Deterministic, pure (given wine+dish+hasExplicitCategoryMatch — καμία DB
// πρόσβαση εδώ, το explicit-category-match το υπολογίζει ο caller). Κανένα
// missing attribute δεν γίνεται ποτέ σιωπηλά 0 — αν ένα core component δεν
// υπολογίζεται, το βάρος του αναδιανέμεται αναλογικά στα υπόλοιπα.
export function scoreWineForDish(wine: WineInput, dish: FoodProfile, hasExplicitCategoryMatch = false): ScoreResult {
  const traits = resolveWineTraits(wine);

  const acidity = acidityFit(dish, traits);
  const body = bodyFit(dish, traits);
  const { result: sweetness } = sweetnessFit(dish, traits);

  const computable = [acidity, body, sweetness].filter((c) => c.score !== null);
  const totalActiveWeight = computable.reduce((sum, c) => sum + c.weight, 0);

  const normalize = (c: ComponentResult): ComponentResult =>
    c.score === null ? c : { ...c, weight: totalActiveWeight > 0 ? (c.weight / totalActiveWeight) * 100 : 0 };

  const acidityN = normalize(acidity);
  const bodyN = normalize(body);
  const sweetnessN = normalize(sweetness);

  const weightedRaw = [acidityN, bodyN, sweetnessN].reduce(
    (sum, c) => sum + (c.score !== null ? (c.score * c.weight) / 100 : 0),
    0
  );

  const penalty = spicePenalty(dish, traits);
  const afterPenalty = clamp(weightedRaw - (penalty?.amount ?? 0), 0, 100);

  const hardCap = hardIncompatibility(dish, traits);
  const afterHardCap = hardCap.triggered ? Math.min(afterPenalty, hardCap.cap!) : afterPenalty;

  const confidence = confidenceTier(traits, hasExplicitCategoryMatch);
  const finalScore = Math.round(Math.min(afterHardCap, CONFIDENCE_CEILINGS[confidence]));

  const dataQualityFlags = [...traits.dataQualityFlags];
  if (dish.spiciness >= SPICE_PENALTY.triggerSpiciness && traits.tannins === null) {
    dataQualityFlags.push("spice-penalty-skipped-missing-tannins");
  }

  return {
    dishSlug: dish.slug,
    wineId: wine.id,
    totalScore: finalScore,
    confidence,
    components: {
      acidityFit: acidityN,
      bodyFit: bodyN,
      sweetnessFit: sweetnessN,
    },
    penalty,
    hardIncompatibility: hardCap.triggered,
    hardIncompatibilityReason: hardCap.reason,
    explicitCategoryMatch: hasExplicitCategoryMatch,
    dataQualityFlags,
  };
}
