import { FOOD_PROFILES } from "./foodProfiles";
import { getPairingExplanation } from "./explanation";
import { scoreWineForDish } from "./scoreWineForDish";
import type { FoodProfile, ScoreResult, WineInput } from "./types";

export type WineDishMatch = { dish: FoodProfile; score: ScoreResult; explanation: string };

// Locked (Final Architecture Proposal, Phase 4): reverse-direction κριτήρια.
// Μια wine-page claim είναι απόλυτη ("αυτό το κρασί ταιριάζει με X"), όχι
// σχετική κατάταξη ανάμεσα σε πολλά όπως στο dish-page top-12 — γι' αυτό
// υψηλότερο απόλυτο κατώφλι score + αποκλεισμός LOW confidence.
const MIN_SCORE = 75;
const MAX_RESULTS = 5;
const MAX_PER_CATEGORY = 2;

// Reverse lookup: Wine → 45 FoodProfiles → score → filter → diversity → top 5.
// Χρησιμοποιεί ΑΠΟΚΛΕΙΣΤΙΚΑ τον ήδη υπάρχοντα scoreWineForDish/getPairingExplanation
// — καμία δεύτερη υλοποίηση ranking/explanation. Καθαρή function, καμία DB
// πρόσβαση (ο caller φέρνει ήδη το wine + το hasExplicitMatch mapping).
export function getWineDishMatches(
  wine: WineInput,
  hasExplicitMatch: (categorySlug: string) => boolean
): WineDishMatch[] {
  const scored = FOOD_PROFILES.map((dish) => ({
    dish,
    score: scoreWineForDish(wine, dish, hasExplicitMatch(dish.categorySlug)),
  }));

  const eligible = scored
    .filter(({ score }) => !score.hardIncompatibility && score.confidence !== "LOW" && score.totalScore >= MIN_SCORE)
    .sort((a, b) => b.score.totalScore - a.score.totalScore);

  const result: WineDishMatch[] = [];
  const categoryCounts = new Map<string, number>();

  // Πέρασμα 1: greedy επιλογή με diversity cap (το πολύ MAX_PER_CATEGORY ανά κατηγορία).
  for (const { dish, score } of eligible) {
    if (result.length >= MAX_RESULTS) break;
    if ((categoryCounts.get(dish.categorySlug) ?? 0) >= MAX_PER_CATEGORY) continue;
    const explanation = getPairingExplanation(dish, score);
    if (!explanation) continue; // defensive — confidence ήδη != LOW εδώ
    result.push({ dish, score, explanation });
    categoryCounts.set(dish.categorySlug, (categoryCounts.get(dish.categorySlug) ?? 0) + 1);
  }

  // Πέρασμα 2 (fallback): αν το diversity cap άφησε λιγότερα από MAX_RESULTS,
  // γέμισε τα υπόλοιπα από την ήδη ταξινομημένη-κατά-score λίστα, cap χαλαρό.
  if (result.length < MAX_RESULTS) {
    for (const { dish, score } of eligible) {
      if (result.length >= MAX_RESULTS) break;
      if (result.some((r) => r.dish.slug === dish.slug)) continue;
      const explanation = getPairingExplanation(dish, score);
      if (!explanation) continue;
      result.push({ dish, score, explanation });
    }
  }

  return result;
}
