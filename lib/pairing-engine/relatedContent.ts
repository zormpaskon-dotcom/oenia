import { FOOD_PROFILES } from "./foodProfiles";
import type { DishRecommendation } from "./getRecommendations";
import type { FoodProfile } from "./types";

// Ίδιο top-15 SEO dataset με το ήδη εγκεκριμένο "SEO CANDIDATES — TOP 15"
// (Food-Side Model v1) — χρησιμοποιείται εδώ μόνο ως προτεραιότητα ταξινόμησης
// για related dishes, όχι για να αλλάξει κανένα SEO metadata.
const SEO_PRIORITY_SLUGS = new Set([
  "sushi",
  "pizza",
  "greek-salad",
  "moussaka",
  "steak",
  "feta",
  "baklava",
  "burger",
  "grilled-fish",
  "carbonara",
  "lamb-roast",
  "fried-calamari",
  "graviera",
  "curry",
  "cheesecake",
]);

// Πραγματικά άλλα canonical dishes της ίδιας κατηγορίας — ποτέ το ίδιο
// dish, ποτέ umbrella (structurally αδύνατο, τα umbrellas δεν υπάρχουν καν
// στο FOOD_PROFILES). Προτεραιότητα στα ήδη εγκεκριμένα SEO-priority dishes,
// αλλιώς σειρά δήλωσης. Αν η κατηγορία έχει <limit άλλα dishes, επιστρέφει
// όσα υπάρχουν πραγματικά — ποτέ fake/padding entries.
export function getRelatedDishes(dish: FoodProfile, limit = 4): FoodProfile[] {
  const sameCategory = FOOD_PROFILES.filter((d) => d.categorySlug === dish.categorySlug && d.slug !== dish.slug);
  const sorted = [...sameCategory].sort((a, b) => {
    const aPriority = SEO_PRIORITY_SLUGS.has(a.slug) ? 0 : 1;
    const bPriority = SEO_PRIORITY_SLUGS.has(b.slug) ? 0 : 1;
    return aPriority - bPriority;
  });
  return sorted.slice(0, limit);
}

// Ποικιλίες αποκλειστικά από τα ήδη εμφανιζόμενα (displayed) recommendations
// — ποτέ από ολόκληρη τη βάση. Deduplicated by slug, ταξινομημένες κατά
// συχνότητα εμφάνισης στα recommendations (πραγματικό σήμα, όχι τυχαία σειρά).
export function getRelatedVarieties(
  recommendations: DishRecommendation[],
  limit = 4
): { name: string; slug: string }[] {
  const countBySlug = new Map<string, { name: string; slug: string; count: number }>();
  for (const rec of recommendations) {
    for (const v of rec.wine.varieties) {
      const existing = countBySlug.get(v.slug);
      if (existing) existing.count += 1;
      else countBySlug.set(v.slug, { name: v.name, slug: v.slug, count: 1 });
    }
  }
  return Array.from(countBySlug.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ name, slug }) => ({ name, slug }));
}
