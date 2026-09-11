import { describe, expect, it } from "vitest";
import { getFeaturedDishesForCategory, getPopularDishes, getRelatedDishes, getRelatedVarieties } from "./relatedContent";
import { FOOD_PROFILES, UMBRELLA_ONLY_SLUGS } from "./foodProfiles";
import type { DishRecommendation } from "./getRecommendations";
import type { FoodProfile, ScoreResult } from "./types";

const REAL_CATEGORY_SLUGS = ["seafood", "red-meat", "white-meat", "pasta", "cheese", "vegetarian", "spicy", "dessert"];

const dish = (slug: string): FoodProfile => FOOD_PROFILES.find((d) => d.slug === slug)!;

function fakeRecommendation(id: string, varieties: { name: string; slug: string }[]): DishRecommendation {
  const score: ScoreResult = {
    dishSlug: "x",
    wineId: id,
    totalScore: 90,
    confidence: "HIGH",
    components: {
      acidityFit: { score: 90, weight: 35, requiredValue: 50, actualValue: 90, gap: 40 },
      bodyFit: { score: 90, weight: 35, requiredValue: 50, actualValue: 90, gap: 40 },
      sweetnessFit: { score: 100, weight: 30, requiredValue: 0, actualValue: 0, gap: 0 },
    },
    penalty: null,
    hardIncompatibility: false,
    hardIncompatibilityReason: null,
    explicitCategoryMatch: true,
    dataQualityFlags: [],
  };
  return {
    wine: { id, slug: id, name: id, color: "WHITE", labelImage: null, wineryName: "W", varieties },
    score,
    explanation: null,
  };
}

describe("getRelatedDishes", () => {
  it("returns only dishes from the same category", () => {
    const related = getRelatedDishes(dish("sushi"));
    for (const d of related) expect(d.categorySlug).toBe("seafood");
  });

  it("excludes the current dish itself", () => {
    const related = getRelatedDishes(dish("sushi"));
    expect(related.some((d) => d.slug === "sushi")).toBe(false);
  });

  it("never includes an umbrella slug (structurally impossible, but verify)", () => {
    const related = getRelatedDishes(dish("steak"));
    for (const umbrella of UMBRELLA_ONLY_SLUGS) {
      expect(related.some((d) => d.slug === umbrella)).toBe(false);
    }
  });

  it("prefers SEO-priority dishes when available", () => {
    // steak's category (red-meat) has multiple SEO-priority siblings; moussaka is one.
    const related = getRelatedDishes(dish("steak"));
    expect(related.some((d) => d.slug === "moussaka")).toBe(true);
  });

  it("a category with fewer than `limit` other dishes returns only what really exists (no padding)", () => {
    // "spicy" has exactly 2 dishes total (spicy-asian, curry) → only 1 other dish exists.
    const related = getRelatedDishes(dish("curry"), 4);
    expect(related.length).toBe(1);
    expect(related[0].slug).toBe("spicy-asian");
  });
});

describe("getRelatedVarieties", () => {
  it("derives varieties only from the given recommendations, deduplicated", () => {
    const recs = [
      fakeRecommendation("a", [{ name: "Ασύρτικο", slug: "asyrtiko" }]),
      fakeRecommendation("b", [{ name: "Ασύρτικο", slug: "asyrtiko" }, { name: "Αθήρι", slug: "athiri" }]),
    ];
    const related = getRelatedVarieties(recs);
    expect(related.filter((v) => v.slug === "asyrtiko").length).toBe(1);
    expect(related.map((v) => v.slug).sort()).toEqual(["asyrtiko", "athiri"]);
  });

  it("orders by frequency across the displayed recommendations", () => {
    const recs = [
      fakeRecommendation("a", [{ name: "Ασύρτικο", slug: "asyrtiko" }]),
      fakeRecommendation("b", [{ name: "Ασύρτικο", slug: "asyrtiko" }]),
      fakeRecommendation("c", [{ name: "Αθήρι", slug: "athiri" }]),
    ];
    const related = getRelatedVarieties(recs);
    expect(related[0].slug).toBe("asyrtiko");
  });

  it("empty recommendations → empty varieties, no crash", () => {
    expect(getRelatedVarieties([])).toEqual([]);
  });

  it("a wine with no varieties contributes nothing (no crash)", () => {
    const recs = [fakeRecommendation("a", [])];
    expect(() => getRelatedVarieties(recs)).not.toThrow();
    expect(getRelatedVarieties(recs)).toEqual([]);
  });

  it("respects the limit", () => {
    const recs = [
      fakeRecommendation("a", [
        { name: "V1", slug: "v1" },
        { name: "V2", slug: "v2" },
        { name: "V3", slug: "v3" },
        { name: "V4", slug: "v4" },
        { name: "V5", slug: "v5" },
      ]),
    ];
    expect(getRelatedVarieties(recs, 4).length).toBe(4);
  });
});

describe("getFeaturedDishesForCategory — index category cards", () => {
  it("every one of the 8 real categories returns at most 3 dishes", () => {
    for (const categorySlug of REAL_CATEGORY_SLUGS) {
      const featured = getFeaturedDishesForCategory(categorySlug, 3);
      expect(featured.length, `${categorySlug} returned more than 3`).toBeLessThanOrEqual(3);
      expect(featured.length, `${categorySlug} returned 0 featured dishes`).toBeGreaterThan(0);
    }
  });

  it("every featured dish is a real, valid canonical dish of that exact category", () => {
    for (const categorySlug of REAL_CATEGORY_SLUGS) {
      const featured = getFeaturedDishesForCategory(categorySlug, 3);
      for (const d of featured) {
        expect(FOOD_PROFILES.some((p) => p.slug === d.slug)).toBe(true);
        expect(d.categorySlug).toBe(categorySlug);
      }
    }
  });

  it("no umbrella slug ever appears as a featured dish", () => {
    for (const categorySlug of REAL_CATEGORY_SLUGS) {
      const featured = getFeaturedDishesForCategory(categorySlug, 3);
      for (const umbrella of UMBRELLA_ONLY_SLUGS) {
        expect(featured.some((d) => d.slug === umbrella)).toBe(false);
      }
    }
  });

  it("no duplicate dishes within one category's featured list", () => {
    for (const categorySlug of REAL_CATEGORY_SLUGS) {
      const featured = getFeaturedDishesForCategory(categorySlug, 3);
      const slugs = featured.map((d) => d.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("spicy category (only 2 dishes total) returns 2, not padded to 3", () => {
    const featured = getFeaturedDishesForCategory("spicy", 3);
    expect(featured.length).toBe(2);
  });

  it("prefers SEO-priority dishes when available (seafood → sushi first)", () => {
    const featured = getFeaturedDishesForCategory("seafood", 3);
    expect(featured[0].slug).toBe("sushi");
  });
});

describe("getPopularDishes — index popular-matches section", () => {
  it("returns valid canonical dishes only, no invented entries", () => {
    const popular = getPopularDishes(10);
    for (const d of popular) {
      expect(FOOD_PROFILES.some((p) => p.slug === d.slug)).toBe(true);
    }
  });

  it("no duplicates", () => {
    const popular = getPopularDishes(10);
    const slugs = popular.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("no umbrella entries", () => {
    const popular = getPopularDishes(10);
    for (const umbrella of UMBRELLA_ONLY_SLUGS) {
      expect(popular.some((d) => d.slug === umbrella)).toBe(false);
    }
  });

  it("respects the limit and includes sushi first (top of the approved SEO list)", () => {
    const popular = getPopularDishes(10);
    expect(popular.length).toBe(10);
    expect(popular[0].slug).toBe("sushi");
  });

  it("every returned dish resolves to a real /tairiasma/[slug] route (exists in FOOD_PROFILES)", () => {
    const popular = getPopularDishes(10);
    for (const d of popular) {
      expect(FOOD_PROFILES.find((p) => p.slug === d.slug)).toBeDefined();
    }
  });
});
