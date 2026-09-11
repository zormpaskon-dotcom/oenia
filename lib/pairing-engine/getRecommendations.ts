import type { WineColor } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { scoreWineForDish } from "./scoreWineForDish";
import type { FoodProfile, ScoreResult, WineInput } from "./types";

export type WineForRecommendation = WineInput & { hasExplicitMatch: boolean };

// Pure — καμία DB πρόσβαση, εύκολα testable με synthetic δεδομένα. Καλεί τον
// αμετάβλητο, εγκεκριμένο scoreWineForDish για κάθε κρασί και ταξινομεί
// φθίνουσα κατά totalScore. Δεν αποκλείει LOW-confidence αποτελέσματα —
// ακολουθεί ακριβώς τον ήδη εγκεκριμένο μηχανισμό (confidence ceiling μέσα
// στο ίδιο το totalScore), όχι νέο exclusion rule.
export function rankWinesForDish(wines: WineForRecommendation[], dish: FoodProfile): ScoreResult[] {
  return wines
    .map((w) => scoreWineForDish(w, dish, w.hasExplicitMatch))
    .sort((a, b) => b.totalScore - a.totalScore);
}

export type WineDisplay = {
  id: string;
  slug: string;
  name: string;
  color: WineColor;
  labelImage: string | null;
  wineryName: string;
};

export type DishRecommendation = { wine: WineDisplay; score: ScoreResult };

// Batched: ένα query για τα κρασιά, ένα για το FoodCategory id — καμία N+1.
// Το scoring τρέχει καθαρά in-memory μετά το fetch.
export async function getDishRecommendations(dish: FoodProfile, limit = 12): Promise<DishRecommendation[]> {
  const [wines, category] = await Promise.all([
    prisma.wine.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        slug: true,
        name: true,
        color: true,
        style: true,
        labelImage: true,
        winery: { select: { name: true } },
        varieties: {
          select: { percentage: true, variety: { select: { acidity: true, body: true, tannins: true } } },
        },
        pairings: { select: { foodCategoryId: true } },
      },
    }),
    prisma.foodCategory.findUnique({ where: { slug: dish.categorySlug }, select: { id: true } }),
  ]);

  const wineInputs: WineForRecommendation[] = wines.map((w) => ({
    id: w.id,
    style: w.style,
    varieties: w.varieties.map((v) => ({
      percentage: v.percentage,
      variety: { acidity: v.variety.acidity, body: v.variety.body, tannins: v.variety.tannins },
    })),
    hasExplicitMatch: category ? w.pairings.some((p) => p.foodCategoryId === category.id) : false,
  }));

  const wineById = new Map(wines.map((w) => [w.id, w]));
  const ranked = rankWinesForDish(wineInputs, dish);

  return ranked.slice(0, limit).map((score) => {
    const w = wineById.get(score.wineId)!;
    return {
      wine: { id: w.id, slug: w.slug, name: w.name, color: w.color, labelImage: w.labelImage, wineryName: w.winery.name },
      score,
    };
  });
}
