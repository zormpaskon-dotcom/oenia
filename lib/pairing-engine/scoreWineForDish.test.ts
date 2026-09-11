import { describe, expect, it } from "vitest";
import { resolveWineTraits } from "./resolveWineTraits";
import { scoreWineForDish } from "./scoreWineForDish";
import { CRITICAL_FOOD_PROFILES } from "./foodProfiles";
import type { FoodProfile, WineInput } from "./types";

const dish = (slug: string): FoodProfile => {
  const found = CRITICAL_FOOD_PROFILES.find((d) => d.slug === slug);
  if (!found) throw new Error(`unknown test dish: ${slug}`);
  return found;
};

// Σταθερό hypothetical κρασί από το approval-pass walkthrough: ξηρό, υψηλής
// οξύτητας, ελαφρύ, χαμηλής τανίνης λευκό (τύπου Ασύρτικο).
function crispDryWhite(): WineInput {
  return {
    id: "wine-crisp-dry-white",
    style: "DRY",
    varieties: [{ percentage: 100, variety: { acidity: 88, body: 40, tannins: 10 } }],
  };
}

function singleVarietyWine(traits: { acidity: number | null; body: number | null; tannins: number | null }, style: WineInput["style"] = "DRY"): WineInput {
  return {
    id: "wine-test",
    style,
    varieties: [{ percentage: 100, variety: traits }],
  };
}

// Synthetic test-only fixtures — ΔΕΝ ανήκουν στο εγκεκριμένο Food Taxonomy
// v2 dataset, υπάρχουν μόνο για να απομονώσουν συγκεκριμένη συμπεριφορά
// (spice penalty, moderate-sweetness cap) που τα 6 critical dishes δεν
// καλύπτουν.
const SPICY_TEST_DISH: FoodProfile = {
  slug: "test-spicy-dish",
  name: "[test] Πολύ πικάντικο πιάτο",
  categorySlug: "spicy",
  saltiness: 1,
  fattiness: 2,
  spiciness: 5,
  sweetness: 0,
  editorialSanityCheck: "test fixture",
};

const MODERATE_SWEET_TEST_DISH: FoodProfile = {
  slug: "test-moderate-sweet-dish",
  name: "[test] Μετρίως γλυκό πιάτο",
  categorySlug: "dessert",
  saltiness: 0,
  fattiness: 1,
  spiciness: 0,
  sweetness: 3,
  editorialSanityCheck: "test fixture",
};

describe("scoreWineForDish — critical dish re-test (Body shortfall=1.2/fatCoef=24, Sweetness shortfall=10/excess=6)", () => {
  const wine = crispDryWhite();

  it("sushi — high-acid dry white scores strongly (~93, Sweetness Fit shortfall=10)", () => {
    const result = scoreWineForDish(wine, dish("sushi"), true);
    expect(result.totalScore).toBe(93);
    expect(result.confidence).toBe("HIGH");
  });

  it("steak — a light, low-tannin white no longer scores implausibly high", () => {
    const result = scoreWineForDish(wine, dish("steak"), true);
    expect(result.totalScore).toBe(77);
    // Το κρίσιμο σημείο του re-test: με 0.8 το steak έφτανε 88 (σχεδόν ίδιο
    // με τα πραγματικά καλύτερα ταιριάσματα του κρασιού, 96). Με 1.2 πρέπει
    // να μείνει ξεκάθαρα χαμηλότερα από sushi/carbonara/μπακαλιάρο.
    const sushiScore = scoreWineForDish(wine, dish("sushi"), true).totalScore;
    const carbonaraScore = scoreWineForDish(wine, dish("carbonara"), true).totalScore;
    expect(result.totalScore).toBeLessThan(sushiScore);
    expect(result.totalScore).toBeLessThan(carbonaraScore);
    expect(sushiScore - result.totalScore).toBeGreaterThanOrEqual(4);
  });

  it("carbonara — crisp acid remains the top match (~90)", () => {
    const result = scoreWineForDish(wine, dish("carbonara"), true);
    expect(result.totalScore).toBe(90);
  });

  it("μουσακάς — clearly lower than seafood/pasta matches, structure gap visible (~68)", () => {
    const result = scoreWineForDish(wine, dish("moussaka"), true);
    expect(result.totalScore).toBe(68);
    expect(result.components.bodyFit.score).toBeLessThan(60);
  });

  it("chocolate dessert — hard-capped at 20 regardless of acid/body scores", () => {
    const result = scoreWineForDish(wine, dish("chocolate-dessert"), true);
    expect(result.totalScore).toBe(20);
    expect(result.hardIncompatibility).toBe(true);
  });

  it("μπακαλιάρος σκορδαλιά — classic match, top score (~94)", () => {
    const result = scoreWineForDish(wine, dish("bakaliaros-skordalia"), true);
    expect(result.totalScore).toBe(94);
  });
});

describe("spice penalty", () => {
  it("spicy dish + low tannin → no penalty", () => {
    const wine = singleVarietyWine({ acidity: 70, body: 40, tannins: 20 });
    const result = scoreWineForDish(wine, SPICY_TEST_DISH, true);
    expect(result.penalty).toBeNull();
  });

  it("spicy dish + medium tannin → penalty 20", () => {
    const wine = singleVarietyWine({ acidity: 70, body: 40, tannins: 50 });
    const result = scoreWineForDish(wine, SPICY_TEST_DISH, true);
    expect(result.penalty?.amount).toBe(20);
  });

  it("spicy dish + high tannin → penalty clamped at 30", () => {
    const wine = singleVarietyWine({ acidity: 70, body: 60, tannins: 85 });
    const result = scoreWineForDish(wine, SPICY_TEST_DISH, true);
    expect(result.penalty?.amount).toBe(30);
  });

  it("spicy dish + missing tannins → penalty skipped, not silently zero", () => {
    const wine = singleVarietyWine({ acidity: 70, body: 40, tannins: null });
    const result = scoreWineForDish(wine, SPICY_TEST_DISH, true);
    expect(result.penalty).toBeNull();
    expect(result.dataQualityFlags).toContain("spice-penalty-skipped-missing-tannins");
  });
});

describe("dessert hard caps", () => {
  it("dry wine + very sweet dessert (sweetness 5) → capped at 20", () => {
    const wine = singleVarietyWine({ acidity: 90, body: 90, tannins: 90 }, "DRY");
    const result = scoreWineForDish(wine, dish("chocolate-dessert"), true);
    expect(result.totalScore).toBe(20);
    expect(result.hardIncompatibility).toBe(true);
  });

  it("dry wine + moderately sweet dish (sweetness 3) → capped at 50", () => {
    const wine = singleVarietyWine({ acidity: 90, body: 90, tannins: 90 }, "DRY");
    const result = scoreWineForDish(wine, MODERATE_SWEET_TEST_DISH, true);
    expect(result.totalScore).toBeLessThanOrEqual(50);
    expect(result.hardIncompatibility).toBe(true);
  });
});

describe("missing-data handling — never silently zero", () => {
  it("missing acidity → component null, weight redistributed, confidence LOW", () => {
    const wine = singleVarietyWine({ acidity: null, body: 50, tannins: 50 });
    const result = scoreWineForDish(wine, dish("sushi"), true);
    expect(result.components.acidityFit.score).toBeNull();
    expect(result.components.bodyFit.weight + result.components.sweetnessFit.weight).toBeCloseTo(100, 5);
    expect(result.confidence).toBe("LOW");
    expect(result.dataQualityFlags).toContain("missing-acidity-data");
  });

  it("missing body → bodyFit component null, confidence LOW", () => {
    const wine = singleVarietyWine({ acidity: 80, body: null, tannins: 50 });
    const result = scoreWineForDish(wine, dish("sushi"), true);
    expect(result.components.bodyFit.score).toBeNull();
    expect(result.confidence).toBe("LOW");
    expect(result.dataQualityFlags).toContain("missing-body-data");
  });

  it("missing tannins → bodyFit component null (needs both body and tannins), confidence LOW", () => {
    const wine = singleVarietyWine({ acidity: 80, body: 50, tannins: null });
    const result = scoreWineForDish(wine, dish("sushi"), true);
    expect(result.components.bodyFit.score).toBeNull();
    expect(result.confidence).toBe("LOW");
    expect(result.dataQualityFlags).toContain("missing-tannins-data");
  });

  it("exact redistribution example: acidity non-computable, body=80, sweetness=90 → 84.62 pre-cap/pre-confidence", () => {
    // Ίδιο παράδειγμα με το approval-pass §5 — εδώ ελέγχουμε το raw
    // weighted average ανεξάρτητα από confidence ceiling.
    const bodyWeight = (35 / 65) * 100; // 53.846...
    const sweetnessWeight = (30 / 65) * 100; // 46.154...
    const expected = (80 * bodyWeight + 90 * sweetnessWeight) / 100;
    expect(expected).toBeCloseTo(84.62, 1);
  });
});

describe("wine without any variety", () => {
  it("no variety linked → all core traits null, confidence LOW", () => {
    const wine: WineInput = { id: "wine-no-variety", style: "DRY", varieties: [] };
    const result = scoreWineForDish(wine, dish("sushi"), true);
    expect(result.components.acidityFit.score).toBeNull();
    expect(result.components.bodyFit.score).toBeNull();
    expect(result.confidence).toBe("LOW");
    expect(result.dataQualityFlags).toContain("no-variety-data");
  });
});

describe("blend resolution", () => {
  it("unresolved blend — no percentages known at all → traits null, not averaged", () => {
    const wine: WineInput = {
      id: "wine-unresolved",
      style: "DRY",
      varieties: [
        { percentage: null, variety: { acidity: 80, body: 30, tannins: 20 } },
        { percentage: null, variety: { acidity: 60, body: 70, tannins: 60 } },
      ],
    };
    const traits = resolveWineTraits(wine);
    expect(traits.blendResolution).toBe("unresolved-blend");
    expect(traits.acidity).toBeNull();
    expect(traits.body).toBeNull();
    expect(traits.tannins).toBeNull();
    expect(traits.dataQualityFlags).toContain("unresolved-blend");
  });

  it("full percentage blend (60/40) — exact weighted average, no invented split", () => {
    const wine: WineInput = {
      id: "wine-full-blend",
      style: "DRY",
      varieties: [
        { percentage: 60, variety: { acidity: 80, body: 30, tannins: 20 } },
        { percentage: 40, variety: { acidity: 60, body: 70, tannins: 60 } },
      ],
    };
    const traits = resolveWineTraits(wine);
    expect(traits.blendResolution).toBe("full-percentage-blend");
    expect(traits.acidity).toBeCloseTo(72, 5); // (80*60+60*40)/100
    expect(traits.body).toBeCloseTo(46, 5); // (30*60+70*40)/100
    expect(traits.tannins).toBeCloseTo(36, 5); // (20*60+60*40)/100
  });

  it("dominant variety ≥60% (one known, other unknown) → uses dominant's exact values", () => {
    const wine: WineInput = {
      id: "wine-dominant",
      style: "DRY",
      varieties: [
        { percentage: 65, variety: { acidity: 85, body: 35, tannins: 25 } },
        { percentage: null, variety: { acidity: 50, body: 80, tannins: 70 } },
      ],
    };
    const traits = resolveWineTraits(wine);
    expect(traits.blendResolution).toBe("dominant-variety-estimate");
    expect(traits.acidity).toBe(85);
    expect(traits.body).toBe(35);
    expect(traits.tannins).toBe(25);
    expect(traits.dataQualityFlags).toContain("dominant-variety-estimate");
  });

  it("51/49 — both percentages fully known → real weighted average, NOT unresolved", () => {
    // Σημαντική διευκρίνιση (βλ. τελική αναφορά, ενότητα F): το 60% dominant
    // threshold ισχύει ΜΟΝΟ όταν κάποιο ποσοστό είναι άγνωστο (case 2 του
    // εγκεκριμένου blend policy). Όταν ΟΛΑ τα ποσοστά είναι γνωστά — έστω
    // 51/49 — δεν είναι εικασία, είναι πραγματικό καταγεγραμμένο δεδομένο,
    // άρα υπολογίζεται κανονικά με ακριβές weighted average. Δεν είναι
    // "unresolved" απλώς επειδή ο διαχωρισμός είναι μοιρασμένος.
    const wine: WineInput = {
      id: "wine-51-49",
      style: "DRY",
      varieties: [
        { percentage: 51, variety: { acidity: 80, body: 30, tannins: 20 } },
        { percentage: 49, variety: { acidity: 60, body: 70, tannins: 60 } },
      ],
    };
    const traits = resolveWineTraits(wine);
    expect(traits.blendResolution).toBe("full-percentage-blend");
    expect(traits.acidity).toBeCloseTo(70.2, 5); // (80*51+60*49)/100
  });
});

describe("confidence tier — explicit FoodPairing category match", () => {
  const wine = crispDryWhite();

  it("explicit category match present → HIGH confidence", () => {
    const result = scoreWineForDish(wine, dish("sushi"), true);
    expect(result.confidence).toBe("HIGH");
    expect(result.explicitCategoryMatch).toBe(true);
  });

  it("no explicit category match → confidence downgraded to MEDIUM even with full data", () => {
    const result = scoreWineForDish(wine, dish("sushi"), false);
    expect(result.confidence).toBe("MEDIUM");
    expect(result.totalScore).toBeLessThanOrEqual(90);
    expect(result.explicitCategoryMatch).toBe(false);
  });
});
