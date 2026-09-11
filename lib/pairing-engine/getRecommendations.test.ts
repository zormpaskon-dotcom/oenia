import { describe, expect, it } from "vitest";
import { rankWinesForDish, type WineForRecommendation } from "./getRecommendations";
import { FOOD_PROFILES, UMBRELLA_ONLY_SLUGS } from "./foodProfiles";
import type { FoodProfile } from "./types";

const dish = (slug: string): FoodProfile => {
  const found = FOOD_PROFILES.find((d) => d.slug === slug);
  if (!found) throw new Error(`unknown dish: ${slug}`);
  return found;
};

function wine(
  id: string,
  traits: { acidity: number | null; body: number | null; tannins: number | null },
  style: WineForRecommendation["style"] = "DRY",
  hasExplicitMatch = true
): WineForRecommendation {
  return {
    id,
    style,
    varieties: [{ percentage: 100, variety: traits }],
    hasExplicitMatch,
  };
}

describe("rankWinesForDish — canonical dish → recommendations", () => {
  it("returns one ScoreResult per input wine", () => {
    const wines = [wine("a", { acidity: 90, body: 40, tannins: 10 }), wine("b", { acidity: 60, body: 60, tannins: 60 })];
    const results = rankWinesForDish(wines, dish("sushi"));
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.wineId).sort()).toEqual(["a", "b"]);
  });

  it("ranking is strictly descending by totalScore", () => {
    const wines = [
      wine("high-acid", { acidity: 95, body: 40, tannins: 10 }),
      wine("mid", { acidity: 60, body: 50, tannins: 40 }),
      wine("low-acid", { acidity: 20, body: 30, tannins: 20 }),
    ];
    const results = rankWinesForDish(wines, dish("sushi"));
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].totalScore).toBeGreaterThanOrEqual(results[i].totalScore);
    }
  });
});

describe("rankWinesForDish — sushi (high-acid whites should dominate)", () => {
  it("high-acid DRY wine outranks a low-acid wine", () => {
    const results = rankWinesForDish(
      [wine("crisp", { acidity: 95, body: 40, tannins: 10 }), wine("flat", { acidity: 30, body: 40, tannins: 10 })],
      dish("sushi")
    );
    expect(results[0].wineId).toBe("crisp");
  });

  it("a DRY wine with genuinely better acid/body still beats a weaker OFF_DRY wine (locked fix)", () => {
    // Ίδιο σχήμα με το πραγματικό production tie (Paros Monemvasia DRY vs
    // Moschato Spinas OFF_DRY, 97=97): ένα DRY κρασί με acid/body κοντά στο
    // πραγματικό requirement του sushi δεν πρέπει να χάνει από ένα OFF_DRY
    // με αντικειμενικά χειρότερο acid/body, μόνο επειδή ταιριάζει ακριβώς
    // το μικρό sweetness requirement.
    const results = rankWinesForDish(
      [
        wine("dry-solid", { acidity: 60, body: 22, tannins: 22 }, "DRY"),
        wine("offdry-weak", { acidity: 45, body: 15, tannins: 15 }, "OFF_DRY"),
      ],
      dish("sushi")
    );
    const dry = results.find((r) => r.wineId === "dry-solid")!;
    const offDry = results.find((r) => r.wineId === "offdry-weak")!;
    expect(dry.totalScore).toBeGreaterThan(offDry.totalScore);
  });
});

describe("rankWinesForDish — steak (structured DRY reds should dominate)", () => {
  it("high-body/tannin DRY red outranks a light DRY white", () => {
    const results = rankWinesForDish(
      [wine("big-red", { acidity: 80, body: 95, tannins: 90 }), wine("light-white", { acidity: 88, body: 40, tannins: 10 })],
      dish("steak")
    );
    expect(results[0].wineId).toBe("big-red");
    expect(results[0].totalScore - results[1].totalScore).toBeGreaterThan(15);
  });
});

describe("rankWinesForDish — moussaka (DRY structured red beats SEMI_SWEET)", () => {
  it("DRY structured red ranks at or above a SEMI_SWEET red with identical structure", () => {
    const results = rankWinesForDish(
      [
        wine("dry-red", { acidity: 99.52, body: 98.7, tannins: 90 }, "DRY"),
        wine("semisweet-red", { acidity: 99.52, body: 98.7, tannins: 90 }, "SEMI_SWEET"),
      ],
      dish("moussaka")
    );
    const dry = results.find((r) => r.wineId === "dry-red")!;
    const semiSweet = results.find((r) => r.wineId === "semisweet-red")!;
    expect(dry.totalScore).toBeGreaterThanOrEqual(semiSweet.totalScore);
  });
});

describe("rankWinesForDish — bakaliaros-skordalia (high-acid whites dominate)", () => {
  it("very-high-acid wine ranks first", () => {
    const results = rankWinesForDish(
      [wine("robola", { acidity: 100, body: 90, tannins: 5 }), wine("soft", { acidity: 40, body: 90, tannins: 5 })],
      dish("bakaliaros-skordalia")
    );
    expect(results[0].wineId).toBe("robola");
  });
});

describe("rankWinesForDish — dessert ranking + hard cap", () => {
  it("SWEET wine ranks above DRY wine for chocolate-dessert", () => {
    const results = rankWinesForDish(
      [wine("sweet", { acidity: 90, body: 90, tannins: 90 }, "SWEET"), wine("dry", { acidity: 90, body: 90, tannins: 90 }, "DRY")],
      dish("chocolate-dessert")
    );
    expect(results[0].wineId).toBe("sweet");
  });

  it("hard cap keeps a DRY wine at or below 20 for a very sweet dessert", () => {
    const [result] = rankWinesForDish([wine("dry", { acidity: 95, body: 95, tannins: 95 }, "DRY")], dish("chocolate-dessert"));
    expect(result.hardIncompatibility).toBe(true);
    expect(result.totalScore).toBeLessThanOrEqual(20);
  });
});

describe("rankWinesForDish — spicy dish (no high-tannin bias)", () => {
  it("low-tannin wine is not penalized; high-tannin wine takes a penalty", () => {
    const results = rankWinesForDish(
      [
        wine("low-tannin", { acidity: 90, body: 60, tannins: 15 }, "OFF_DRY"),
        wine("high-tannin", { acidity: 90, body: 60, tannins: 90 }, "OFF_DRY"),
      ],
      dish("curry") // real Taxonomy v2 dish, spiciness=4 → triggers spice penalty
    );
    const lowTannin = results.find((r) => r.wineId === "low-tannin")!;
    const highTannin = results.find((r) => r.wineId === "high-tannin")!;
    expect(lowTannin.penalty).toBeNull();
    expect(highTannin.penalty).not.toBeNull();
    expect(lowTannin.totalScore).toBeGreaterThan(highTannin.totalScore);
  });
});

describe("rankWinesForDish — LOW confidence behavior", () => {
  it("LOW-confidence wine is included in results (not excluded), score capped", () => {
    const results = rankWinesForDish(
      [wine("no-data", { acidity: null, body: null, tannins: null }, "DRY", false)],
      dish("sushi")
    );
    expect(results).toHaveLength(1);
    expect(results[0].confidence).toBe("LOW");
    expect(results[0].totalScore).toBeLessThanOrEqual(70);
  });

  it("LOW confidence does not artificially rank above a well-documented HIGH-confidence match", () => {
    const results = rankWinesForDish(
      [
        wine("no-data", { acidity: null, body: null, tannins: null }, "DRY", false),
        wine("excellent", { acidity: 95, body: 90, tannins: 10 }, "DRY", true),
      ],
      dish("sushi")
    );
    expect(results[0].wineId).toBe("excellent");
  });
});

describe("rankWinesForDish — missing data behavior", () => {
  it("wine with no variety data at all is scored (not thrown), fully null components", () => {
    const results = rankWinesForDish([{ id: "novariety", style: "DRY", varieties: [], hasExplicitMatch: false }], dish("sushi"));
    expect(results).toHaveLength(1);
    expect(results[0].components.acidityFit.score).toBeNull();
    expect(results[0].components.bodyFit.score).toBeNull();
    expect(results[0].dataQualityFlags).toContain("no-variety-data");
  });
});

describe("no umbrella can ever reach the scorer via this module", () => {
  it("every UMBRELLA_ONLY_SLUGS entry is absent from FOOD_PROFILES (the only dish source this module reads)", () => {
    for (const slug of UMBRELLA_ONLY_SLUGS) {
      expect(FOOD_PROFILES.some((d) => d.slug === slug)).toBe(false);
    }
  });
});
