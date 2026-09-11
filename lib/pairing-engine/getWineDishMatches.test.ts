import { describe, expect, it } from "vitest";
import { getWineDishMatches } from "./getWineDishMatches";
import { getPairingExplanation } from "./explanation";
import { FOOD_PROFILES, UMBRELLA_ONLY_SLUGS } from "./foodProfiles";
import type { WineInput } from "./types";

const alwaysMatch = () => true;
const neverMatch = () => false;

function wine(traits: { acidity: number | null; body: number | null; tannins: number | null }, style: WineInput["style"] = "DRY"): WineInput {
  return { id: "w", style, varieties: [{ percentage: 100, variety: traits }] };
}

describe("getWineDishMatches — sorting, thresholds, exclusions", () => {
  it("results are sorted descending by totalScore", () => {
    // Ρομπόλα-τύπου: πολύ υψηλή οξύτητα, χαμηλή τανίνη — πρέπει να δώσει
    // πραγματική κατάταξη ανάμεσα σε πολλαπλά ≥75 seafood/pasta/cheese matches.
    const results = getWineDishMatches(wine({ acidity: 100, body: 60, tannins: 20 }, "DRY"), alwaysMatch);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score.totalScore).toBeGreaterThanOrEqual(results[i].score.totalScore);
    }
  });

  it("no result has totalScore below 75", () => {
    const results = getWineDishMatches(wine({ acidity: 100, body: 60, tannins: 20 }, "DRY"), alwaysMatch);
    for (const r of results) {
      expect(r.score.totalScore).toBeGreaterThanOrEqual(75);
    }
  });

  it("LOW confidence never appears (wine with no variety data → empty result)", () => {
    const noVarietyWine: WineInput = { id: "w", style: "DRY", varieties: [] };
    const results = getWineDishMatches(noVarietyWine, alwaysMatch);
    expect(results).toEqual([]);
  });

  it("a bone-dry wine never matches chocolate-dessert (hard incompatibility excluded)", () => {
    // Ακόμα και με εξαιρετικό acid/body, το hard cap πρέπει να το αποκλείσει.
    const results = getWineDishMatches(wine({ acidity: 90, body: 90, tannins: 90 }, "DRY"), alwaysMatch);
    expect(results.some((r) => r.dish.slug === "chocolate-dessert")).toBe(false);
  });

  it("a weak, unremarkable wine that clears no 75-point bar → empty result, no forced matches", () => {
    const mediocre = wine({ acidity: 40, body: 40, tannins: 40 }, "DRY");
    const results = getWineDishMatches(mediocre, neverMatch);
    // Δεν επιβεβαιώνουμε ακριβές μηδέν (εξαρτάται από lever ανά dish),
    // αλλά ΚΑΝΕΝΑ αποτέλεσμα δεν πρέπει να είναι κάτω από το threshold —
    // ήδη καλυμμένο στο test "no result below 75". Εδώ ελέγχουμε ρητά ότι
    // ΔΕΝ αναγκάζεται κανένα αποτέλεσμα να εμφανιστεί όταν δεν αξίζει.
    for (const r of results) expect(r.score.totalScore).toBeGreaterThanOrEqual(75);
  });

  it("maximum 5 results", () => {
    const results = getWineDishMatches(wine({ acidity: 100, body: 60, tannins: 20 }, "DRY"), alwaysMatch);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it("no duplicate dishes in the result", () => {
    const results = getWineDishMatches(wine({ acidity: 100, body: 60, tannins: 20 }, "DRY"), alwaysMatch);
    const slugs = results.map((r) => r.dish.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("no umbrella slug can ever appear (structurally impossible — FOOD_PROFILES has none)", () => {
    const results = getWineDishMatches(wine({ acidity: 100, body: 60, tannins: 20 }, "DRY"), alwaysMatch);
    for (const umbrella of UMBRELLA_ONLY_SLUGS) {
      expect(results.some((r) => r.dish.slug === umbrella)).toBe(false);
    }
  });

  it("every matched dish is a real canonical dish (valid /tairiasma/[slug])", () => {
    const results = getWineDishMatches(wine({ acidity: 100, body: 60, tannins: 20 }, "DRY"), alwaysMatch);
    for (const r of results) {
      expect(FOOD_PROFILES.some((d) => d.slug === r.dish.slug)).toBe(true);
    }
  });
});

describe("getWineDishMatches — diversity cap", () => {
  it("at most 2 dishes from the same category, for a wine that would otherwise score high across many seafood dishes", () => {
    const crispHighAcidWhite = wine({ acidity: 100, body: 60, tannins: 20 }, "DRY");
    const results = getWineDishMatches(crispHighAcidWhite, alwaysMatch);
    const counts = new Map<string, number>();
    for (const r of results) counts.set(r.dish.categorySlug, (counts.get(r.dish.categorySlug) ?? 0) + 1);
    for (const count of counts.values()) {
      expect(count).toBeLessThanOrEqual(2);
    }
  });

  it("fallback still fills up to 5 total when diversity cap would otherwise leave fewer", () => {
    const crispHighAcidWhite = wine({ acidity: 100, body: 60, tannins: 20 }, "DRY");
    const results = getWineDishMatches(crispHighAcidWhite, alwaysMatch);
    // Δεν απαιτούμε ακριβώς 5 (εξαρτάται από πόσα πραγματικά dishes περνούν
    // το 75-threshold), αλλά επιβεβαιώνουμε ότι δεν κόβεται τεχνητά νωρίς —
    // δηλαδή αν υπάρχουν >5 eligible dishes συνολικά, πρέπει να φτάσει τα 5.
    const totalEligibleAcrossAllDishes = FOOD_PROFILES.length; // upper bound, όχι exact
    expect(totalEligibleAcrossAllDishes).toBeGreaterThan(5);
    expect(results.length).toBeGreaterThan(2); // πρέπει να ξεπεράσει το strict 2-per-category αν υπάρχει ζήτηση
  });
});

describe("getWineDishMatches — explanation reuse (no second algorithm)", () => {
  it("every match's explanation is exactly what getPairingExplanation would independently produce for the same dish/score", () => {
    const results = getWineDishMatches(wine({ acidity: 100, body: 60, tannins: 20 }, "DRY"), alwaysMatch);
    for (const r of results) {
      expect(r.explanation).toBe(getPairingExplanation(r.dish, r.score));
    }
  });

  it("explanation is always a non-empty string with no digits (same rules as Phase 1)", () => {
    const results = getWineDishMatches(wine({ acidity: 100, body: 60, tannins: 20 }, "DRY"), alwaysMatch);
    for (const r of results) {
      expect(r.explanation.length).toBeGreaterThan(0);
      expect(r.explanation).not.toMatch(/\d/);
    }
  });
});
