import { describe, expect, it } from "vitest";
import { scoreWineForDish } from "./scoreWineForDish";
import { FOOD_PROFILES, TAXONOMY_V2_DISH_SLUGS, UMBRELLA_ONLY_SLUGS } from "./foodProfiles";

// Εγκεκριμένη κατανομή ανά κατηγορία, Food Taxonomy Review v2
// "CATEGORY → DISH STRUCTURE (final)".
const EXPECTED_CATEGORY_COUNTS: Record<string, number> = {
  seafood: 9,
  "red-meat": 7,
  "white-meat": 4,
  pasta: 7,
  cheese: 4,
  vegetarian: 6,
  spicy: 2,
  dessert: 5,
};

describe("Taxonomy v2 integrity — the 44 approved dishes", () => {
  it("exactly 44 approved Taxonomy v2 dishes (excluding the separately-approved bakaliaros-skordalia addition)", () => {
    expect(TAXONOMY_V2_DISH_SLUGS.length).toBe(44);
  });

  it("total dataset is 45 = 44 taxonomy dishes + 1 approved addition (bakaliaros-skordalia)", () => {
    // Βλ. final report ενότητα C: ο χρήστης ζήτησε ρητά "count = 44" ΚΑΙ ρητά
    // ζήτησε να συμπεριληφθεί το bakaliaros-skordalia — τα δύο μαζί δίνουν
    // πραγματικά 45, όχι 44. Αυτό το test τεκμηριώνει τον πραγματικό αριθμό
    // αντί να τον κρύψει πίσω από ένα λάθος assertion.
    expect(FOOD_PROFILES.length).toBe(45);
    expect(FOOD_PROFILES.some((d) => d.slug === "bakaliaros-skordalia")).toBe(true);
  });

  it("every slug is unique — no duplicate dish profile", () => {
    const slugs = FOOD_PROFILES.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every profile has exactly the 4 numeric flavor dimensions, each an integer 0–5", () => {
    for (const dish of FOOD_PROFILES) {
      for (const dim of ["saltiness", "fattiness", "spiciness", "sweetness"] as const) {
        const value = dish[dim];
        expect(Number.isInteger(value), `${dish.slug}.${dim} must be an integer`).toBe(true);
        expect(value, `${dish.slug}.${dim} out of range`).toBeGreaterThanOrEqual(0);
        expect(value, `${dish.slug}.${dim} out of range`).toBeLessThanOrEqual(5);
      }
    }
  });

  it("every dish belongs to one of the 8 real FoodCategory slugs", () => {
    const validCategories = new Set(Object.keys(EXPECTED_CATEGORY_COUNTS));
    for (const dish of FOOD_PROFILES) {
      expect(validCategories.has(dish.categorySlug), `${dish.slug} has unknown category ${dish.categorySlug}`).toBe(
        true
      );
    }
  });

  it("category distribution matches the approved v2 structure exactly (taxonomy dishes only)", () => {
    const taxonomyOnly = FOOD_PROFILES.filter((d) => d.slug !== "bakaliaros-skordalia");
    const counts: Record<string, number> = {};
    for (const dish of taxonomyOnly) counts[dish.categorySlug] = (counts[dish.categorySlug] ?? 0) + 1;
    expect(counts).toEqual(EXPECTED_CATEGORY_COUNTS);
  });

  it("no umbrella-only concept (game-meat, cured-meats, mezedes-mix) leaked in as a scorer input", () => {
    const slugs = new Set(FOOD_PROFILES.map((d) => d.slug));
    for (const umbrella of UMBRELLA_ONLY_SLUGS) {
      expect(slugs.has(umbrella), `umbrella "${umbrella}" must never be a Level-2 scorer input`).toBe(false);
    }
  });

  it("editorialSanityCheck never affects the numeric score", () => {
    const dish = FOOD_PROFILES.find((d) => d.slug === "sushi")!;
    const wine = {
      id: "wine-check",
      style: "DRY" as const,
      varieties: [{ percentage: 100, variety: { acidity: 80, body: 40, tannins: 20 } }],
    };
    const a = scoreWineForDish(wine, dish, true);
    const b = scoreWineForDish(wine, { ...dish, editorialSanityCheck: "" }, true);
    const c = scoreWineForDish(wine, { ...dish, editorialSanityCheck: "εντελώς διαφορετικό κείμενο" }, true);
    expect(a.totalScore).toBe(b.totalScore);
    expect(a.totalScore).toBe(c.totalScore);
  });
});

describe("SEO metadata — public copy, separate from internal editorial notes", () => {
  it("all 45 profiles have a non-empty seoTitle", () => {
    for (const dish of FOOD_PROFILES) {
      expect(dish.seoTitle, `${dish.slug} missing seoTitle`).toBeTruthy();
      expect(dish.seoTitle?.trim().length, `${dish.slug} has empty/whitespace seoTitle`).toBeGreaterThan(0);
    }
    expect(FOOD_PROFILES.filter((d) => d.seoTitle).length).toBe(45);
  });

  it("all 45 profiles have a non-empty seoDescription", () => {
    for (const dish of FOOD_PROFILES) {
      expect(dish.seoDescription, `${dish.slug} missing seoDescription`).toBeTruthy();
      expect(dish.seoDescription?.trim().length, `${dish.slug} has empty/whitespace seoDescription`).toBeGreaterThan(0);
    }
    expect(FOOD_PROFILES.filter((d) => d.seoDescription).length).toBe(45);
  });

  it("seoTitle is never identical to editorialSanityCheck", () => {
    for (const dish of FOOD_PROFILES) {
      expect(dish.seoTitle, `${dish.slug}: seoTitle must not equal editorialSanityCheck`).not.toBe(
        dish.editorialSanityCheck
      );
    }
  });

  it("seoDescription is never identical to editorialSanityCheck", () => {
    for (const dish of FOOD_PROFILES) {
      expect(dish.seoDescription, `${dish.slug}: seoDescription must not equal editorialSanityCheck`).not.toBe(
        dish.editorialSanityCheck
      );
    }
  });

  it("seoTitle/seoDescription never claim an absolute 'best' or 'guaranteed' match", () => {
    const bannedPhrases = ["εγγυά", "γνωρίζ", "καλύτερ", "βέλτιστ"];
    for (const dish of FOOD_PROFILES) {
      const combined = `${dish.seoTitle ?? ""} ${dish.seoDescription ?? ""}`.toLowerCase();
      for (const phrase of bannedPhrases) {
        expect(combined.includes(phrase), `${dish.slug}: seo copy contains banned overclaim phrase "${phrase}"`).toBe(
          false
        );
      }
    }
  });
});
