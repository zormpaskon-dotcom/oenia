import { describe, expect, it } from "vitest";
import { getPairingExplanation } from "./explanation";
import { scoreWineForDish } from "./scoreWineForDish";
import { FOOD_PROFILES } from "./foodProfiles";
import type { FoodProfile, ScoreResult, WineInput } from "./types";

const dish = (slug: string): FoodProfile => FOOD_PROFILES.find((d) => d.slug === slug)!;

function wine(traits: { acidity: number | null; body: number | null; tannins: number | null }, style: WineInput["style"] = "DRY"): WineInput {
  return { id: "w", style, varieties: [{ percentage: 100, variety: traits }] };
}

// ---- realistic regression fixtures — πραγματικά wine traits από τη DB ----
const REAL = {
  parosMonemvasia: { acidity: 55, body: 45, tannins: 0 }, // sushi #1 (DRY)
  moschatoSpinas: { acidity: 45, body: 50, tannins: 0 }, // sushi #2 (OFF_DRY)
  nostosMourvedre: { acidity: 55, body: 75, tannins: 70 }, // steak #1 (DRY)
  paleaKlimata: { acidity: 60, body: 80, tannins: 60 }, // moussaka top (DRY)
  robolaKefallinias: { acidity: 100, body: 60, tannins: 20 }, // bakaliaros #1 (DRY)
  anatolikos: { acidity: 60, body: 80, tannins: 60 }, // chocolate-dessert #1 (SWEET)
  helios: { acidity: 80, body: 60, tannins: 40 }, // fruit-dessert/baklava top (SWEET)
};

describe("getPairingExplanation — realistic regression cases (relevance-weighted dominance)", () => {
  it("1. Chocolate dessert + SWEET wine (Ανατολικός) → sweetness-driven", () => {
    const score = scoreWineForDish(wine(REAL.anatolikos, "SWEET"), dish("chocolate-dessert"), true);
    expect(getPairingExplanation(dish("chocolate-dessert"), score)).toBe(
      "Η γλυκύτητα του κρασιού ισορροπεί το γλυκό του επιδορπίου."
    );
  });

  it("2. Baklava + SWEET wine (Helios) → sweetness-driven", () => {
    const score = scoreWineForDish(wine(REAL.helios, "SWEET"), dish("baklava"), true);
    expect(getPairingExplanation(dish("baklava"), score)).toBe(
      "Η γλυκύτητα του κρασιού ισορροπεί το γλυκό του επιδορπίου."
    );
  });

  it("3. Fruit dessert + SWEET wine (Helios) → sweetness-driven", () => {
    const score = scoreWineForDish(wine(REAL.helios, "SWEET"), dish("fruit-dessert"), true);
    expect(getPairingExplanation(dish("fruit-dessert"), score)).toBe(
      "Η γλυκύτητα του κρασιού ισορροπεί το γλυκό του επιδορπίου."
    );
  });

  it("4. Sushi + Paros Monemvasia (DRY) → acidity-driven", () => {
    const score = scoreWineForDish(wine(REAL.parosMonemvasia, "DRY"), dish("sushi"), true);
    expect(getPairingExplanation(dish("sushi"), score)).toBe(
      "Η έντονη οξύτητα του κρασιού ισορροπεί την αλμύρα του πιάτου."
    );
  });

  it("5. Sushi + Moschato Spinas (OFF_DRY) → acidity-driven (not body)", () => {
    const score = scoreWineForDish(wine(REAL.moschatoSpinas, "OFF_DRY"), dish("sushi"), true);
    expect(getPairingExplanation(dish("sushi"), score)).toBe(
      "Η έντονη οξύτητα του κρασιού ισορροπεί την αλμύρα του πιάτου."
    );
  });

  it("6. Steak + Nostos Mourvèdre → body/structure-driven (the original bug case)", () => {
    const score = scoreWineForDish(wine(REAL.nostosMourvedre, "DRY"), dish("steak"), true);
    expect(getPairingExplanation(dish("steak"), score)).toBe(
      "Η δομή και οι τανίνες του κρασιού ταιριάζουν με το σώμα του πιάτου."
    );
  });

  it("7. Moussaka + Palea Klimata (dry structured red) → body/structure-driven", () => {
    const score = scoreWineForDish(wine(REAL.paleaKlimata, "DRY"), dish("moussaka"), true);
    expect(getPairingExplanation(dish("moussaka"), score)).toBe(
      "Η δομή και οι τανίνες του κρασιού ταιριάζουν με το σώμα του πιάτου."
    );
  });

  it("8. Bakaliaros + Ρομπόλα Κεφαλληνίας (high-acid white) → acidity-driven", () => {
    const score = scoreWineForDish(wine(REAL.robolaKefallinias, "DRY"), dish("bakaliaros-skordalia"), true);
    expect(getPairingExplanation(dish("bakaliaros-skordalia"), score)).toBe(
      "Η έντονη οξύτητα του κρασιού ισορροπεί την αλμύρα του πιάτου."
    );
  });

  it("9. LOW confidence → no explanation", () => {
    const score = scoreWineForDish(wine({ acidity: null, body: null, tannins: null }, "DRY"), dish("sushi"), false);
    expect(score.confidence).toBe("LOW");
    expect(getPairingExplanation(dish("sushi"), score)).toBeNull();
  });

  it("10. Near-tied realistic case (chicken, white-meat 50/50 lever) → deterministic, no oscillation", () => {
    // Σκόπιμα κατασκευασμένο ώστε adjusted(acidity) ≈ adjusted(body) (διαφορά <2):
    // acidityFit≈60.4 (relevance 0.45) vs bodyFit=90 (relevance 0.3) → 9.5 vs 9.45.
    const w = wine({ acidity: 12, body: 84, tannins: 84 }, "DRY");
    const score = scoreWineForDish(w, dish("chicken"), true);
    const first = getPairingExplanation(dish("chicken"), score);
    const second = getPairingExplanation(dish("chicken"), score);
    expect(first).toBe(second); // deterministic — δεν ταλαντεύεται μεταξύ κλήσεων
    // white-meat lever είναι ακριβώς 50/50 → σταθερό fallback = acidity
    expect(first).toBe("Η έντονη οξύτητα του κρασιού ισορροπεί την αλμύρα του πιάτου.");
  });
});

describe("getPairingExplanation — category-generic tie-break (no per-dish-slug hardcoding)", () => {
  it("spicy category (spiciness ≥ trigger) resolves a genuine tie to sweetness, driven by dish.spiciness — not a dish-slug check", () => {
    // Χτισμένο ScoreResult με ΙΣΑ adjusted acidity/body ώστε να ελεγχθεί
    // αποκλειστικά ο tie-break κλάδος, ανεξάρτητα από τυχαίες τιμές κρασιού.
    const spicyDish: FoodProfile = {
      slug: "test-spicy-tie",
      name: "[test]",
      categorySlug: "spicy",
      saltiness: 2,
      fattiness: 2,
      spiciness: 5,
      sweetness: 2,
      editorialSanityCheck: "test fixture",
    };
    const score: ScoreResult = {
      dishSlug: spicyDish.slug,
      wineId: "w",
      totalScore: 90,
      confidence: "HIGH",
      components: {
        acidityFit: { score: 90, weight: 35, requiredValue: 50, actualValue: 90, gap: 40 },
        bodyFit: { score: 90, weight: 35, requiredValue: 50, actualValue: 90, gap: 40 }, // ίδιο requiredValue → ίδιο relevance → ίδιο adjusted
        sweetnessFit: { score: 40, weight: 30, requiredValue: 2, actualValue: 1, gap: -1 },
      },
      penalty: null,
      hardIncompatibility: false,
      hardIncompatibilityReason: null,
      explicitCategoryMatch: true,
      dataQualityFlags: [],
    };
    const text = getPairingExplanation(spicyDish, score);
    expect(text).toBe("Η ισορροπημένη γλυκύτητα του κρασιού ταιριάζει με το πιάτο.");
  });

  it("category with acid-leaning lever (seafood) does NOT need the tie-break to prefer acidity — resolves directly", () => {
    const score = scoreWineForDish(wine(REAL.parosMonemvasia, "DRY"), dish("sashimi"), true);
    const text = getPairingExplanation(dish("sashimi"), score);
    expect(text).toContain("οξύτητα");
  });
});

describe("getPairingExplanation — edge cases", () => {
  it("wine with no variety data does not crash and returns null", () => {
    const noVarietyWine: WineInput = { id: "w", style: "DRY", varieties: [] };
    const score = scoreWineForDish(noVarietyWine, dish("moussaka"), false);
    expect(() => getPairingExplanation(dish("moussaka"), score)).not.toThrow();
    expect(getPairingExplanation(dish("moussaka"), score)).toBeNull();
  });

  it("never contains a digit (no fake precision, no exposed numbers)", () => {
    const score = scoreWineForDish(wine(REAL.robolaKefallinias, "DRY"), dish("carbonara"), true);
    const text = getPairingExplanation(dish("carbonara"), score);
    expect(text).not.toMatch(/\d/);
  });
});
