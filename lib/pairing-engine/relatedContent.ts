import { FOOD_PROFILES } from "./foodProfiles";
import type { DishRecommendation } from "./getRecommendations";
import type { FoodProfile } from "./types";

// Ίδιο top-15 SEO dataset με το ήδη εγκεκριμένο "SEO CANDIDATES — TOP 15"
// (Food-Side Model v1), ΣΤΗΝ ΙΔΙΑ ΣΕΙΡΑ προτεραιότητας — single source of
// truth, χρησιμοποιείται και ως ταξινόμηση (related/featured dishes) και ως
// βάση για τα "Δημοφιλή ταιριάσματα" του index. Δεν αλλάζει κανένα SEO
// metadata — μόνο ποια ήδη-εγκεκριμένα dishes εμφανίζονται πρώτα σε λίστες.
const SEO_PRIORITY_ORDER = [
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
] as const;
const SEO_PRIORITY_SLUGS = new Set<string>(SEO_PRIORITY_ORDER);

// Κοινή, deterministic ταξινόμηση όλων των dishes μιας κατηγορίας: SEO-priority
// πρώτα (με τη σειρά του SEO_PRIORITY_ORDER), μετά η σειρά δήλωσης στο
// FOOD_PROFILES. Χρησιμοποιείται και από τα δύο callers παρακάτω ώστε να
// υπάρχει ΜΙΑ λογική επιλογής, όχι δύο ξεχωριστές.
function rankDishesInCategory(categorySlug: string, excludeSlug?: string): FoodProfile[] {
  const candidates = FOOD_PROFILES.filter((d) => d.categorySlug === categorySlug && d.slug !== excludeSlug);
  return [...candidates].sort((a, b) => {
    const aPriority = SEO_PRIORITY_SLUGS.has(a.slug) ? 0 : 1;
    const bPriority = SEO_PRIORITY_SLUGS.has(b.slug) ? 0 : 1;
    return aPriority - bPriority;
  });
}

// Πραγματικά άλλα canonical dishes της ίδιας κατηγορίας — ποτέ το ίδιο
// dish, ποτέ umbrella (structurally αδύνατο, τα umbrellas δεν υπάρχουν καν
// στο FOOD_PROFILES). Προτεραιότητα στα ήδη εγκεκριμένα SEO-priority dishes,
// αλλιώς σειρά δήλωσης. Αν η κατηγορία έχει <limit άλλα dishes, επιστρέφει
// όσα υπάρχουν πραγματικά — ποτέ fake/padding entries.
export function getRelatedDishes(dish: FoodProfile, limit = 4): FoodProfile[] {
  return rankDishesInCategory(dish.categorySlug, dish.slug).slice(0, limit);
}

// Index-page use: τα κορυφαία N dishes ΜΙΑΣ κατηγορίας (χωρίς exclusion —
// δεν υπάρχει "τρέχον dish" στο index). Ίδια ταξινόμηση με το getRelatedDishes.
export function getFeaturedDishesForCategory(categorySlug: string, limit = 3): FoodProfile[] {
  return rankDishesInCategory(categorySlug).slice(0, limit);
}

// "Δημοφιλή ταιριάσματα" του index — τα πρώτα `limit` από το ήδη εγκεκριμένο,
// ταξινομημένο SEO_PRIORITY_ORDER. Καμία επινόηση: μόνο πραγματικά, ήδη
// εγκεκριμένα canonical dishes· αν κάποιο slug λείψει ποτέ από το
// FOOD_PROFILES, παραλείπεται αντί να σπάσει η σελίδα.
export function getPopularDishes(limit = 10): FoodProfile[] {
  return SEO_PRIORITY_ORDER.slice(0, limit)
    .map((slug) => FOOD_PROFILES.find((d) => d.slug === slug))
    .filter((d): d is FoodProfile => d !== undefined);
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
