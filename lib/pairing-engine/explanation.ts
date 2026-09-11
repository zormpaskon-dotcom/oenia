import { CATEGORY_LEVERS, DEFAULT_LEVER, SPICE_PENALTY } from "./config";
import type { FoodProfile, ScoreResult } from "./types";

// Fixed-rule "Γιατί ταιριάζει" generator — ΟΧΙ AI-generated, ΟΧΙ αριθμοί,
// ΟΧΙ weights/penalties/technical terms. Read-only consumer του ήδη
// υπολογισμένου ScoreResult — δεν αγγίζει ποτέ totalScore ούτε καμία
// scoring formula/weight/lever/cap.
//
// Locked 2026-09-11 (explanation-selection fix): το "dominant component"
// δεν επιλέγεται πια μόνο από το raw score×weight contribution — αυτό
// αγνοούσε συστηματικά το sweetness σε desserts (weight 30 < 35, άρα ΠΟΤΕ
// δεν κέρδιζε ακόμα κι όταν ήταν ο μοναδικός λόγος που το κρασί ταιριάζει
// μέσω του hard cap), και μπορούσε να αναποδογυρίσει σε razor-thin ties
// (π.χ. steak #1 wine πήρε acidity-explanation με διαφορά 0.47 πόντων από
// το body, παρότι το πιάτο είναι σαφώς body-driven). Η διόρθωση προσθέτει
// ένα δεύτερο κριτήριο: πόσο *απαιτητικό* είναι το requirement του κάθε
// άξονα για ΑΥΤΟ το dish (relevance) — και μόνο τότε πολλαπλασιάζει με το
// raw contribution.

const RELEVANCE_FLOOR = 20; // = requiredBase σε Acidity/Body Fit
const RELEVANCE_RANGE = 80; // = 100 (max required) - 20 (floor)
const TIE_THRESHOLD = 2; // βλ. §B στο report — μικρό vs. το ~0-35 εύρος ενός adjusted score

type ComponentKey = "acidity" | "body" | "sweetness";

// Πόσο πραγματικά "απαιτεί" το dish κάτι σε αυτόν τον άξονα — ανεξάρτητο
// από το πόσο καλά το πέτυχε το συγκεκριμένο κρασί. Acidity/Body: πόσο πάνω
// από το floor (20) είναι το ήδη υπολογισμένο requiredValue του ScoreResult
// (καμία νέα τιμή, ήδη υπάρχει στο component). Sweetness: dish.sweetness/5,
// ακριβώς όπως ορίστηκε.
function relevanceFor(key: ComponentKey, dish: FoodProfile, components: ScoreResult["components"]): number {
  if (key === "sweetness") return dish.sweetness / 5;
  const requiredValue = key === "acidity" ? components.acidityFit.requiredValue : components.bodyFit.requiredValue;
  if (requiredValue === null) return 0;
  return Math.max(0, (requiredValue - RELEVANCE_FLOOR) / RELEVANCE_RANGE);
}

// Γενικός, όχι per-dish-slug κανόνας: ο "κύριος pairing driver" μιας
// κατηγορίας προκύπτει από το ήδη εγκεκριμένο CATEGORY_LEVERS (acid vs
// body βάρος) — εκτός αν το πιάτο ξεπερνά το ήδη εγκεκριμένο spice
// threshold, οπότε ο driver γίνεται sweetness (ίδια λογική με το spice
// sweetness floor bump του scorer — το πικάντικο θέλει γλύκα/χαμηλή
// τανίνη, όχι ακραία acid/body ερμηνεία).
function categoryPrimaryDriver(dish: FoodProfile): ComponentKey {
  if (dish.spiciness >= SPICE_PENALTY.triggerSpiciness) return "sweetness";
  const lever = CATEGORY_LEVERS[dish.categorySlug] ?? DEFAULT_LEVER;
  if (lever.acid > lever.body) return "acidity";
  if (lever.body > lever.acid) return "body";
  return "acidity"; // σταθερό, deterministic fallback όταν το lever είναι ακριβώς 50/50 (π.χ. white-meat)
}

function textFor(winner: ComponentKey, dish: FoodProfile): string {
  if (winner === "acidity") {
    const lever = CATEGORY_LEVERS[dish.categorySlug] ?? DEFAULT_LEVER;
    const saltPull = dish.saltiness;
    const fatPull = dish.fattiness * lever.acid;
    if (saltPull === 0 && fatPull === 0) {
      return "Η ζωντανή οξύτητα του κρασιού ταιριάζει με τη φρεσκάδα του πιάτου.";
    }
    return saltPull >= fatPull
      ? "Η έντονη οξύτητα του κρασιού ισορροπεί την αλμύρα του πιάτου."
      : "Η έντονη οξύτητα του κρασιού ισορροπεί τη λιπαρότητα του πιάτου.";
  }
  if (winner === "body") {
    return "Η δομή και οι τανίνες του κρασιού ταιριάζουν με το σώμα του πιάτου.";
  }
  return dish.categorySlug === "dessert"
    ? "Η γλυκύτητα του κρασιού ισορροπεί το γλυκό του επιδορπίου."
    : "Η ισορροπημένη γλυκύτητα του κρασιού ταιριάζει με το πιάτο.";
}

export function getPairingExplanation(dish: FoodProfile, score: ScoreResult): string | null {
  if (score.confidence === "LOW") return null;

  const { acidityFit, bodyFit, sweetnessFit } = score.components;
  const raw: Record<ComponentKey, number> = {
    acidity: acidityFit.score !== null ? (acidityFit.score * acidityFit.weight) / 100 : -1,
    body: bodyFit.score !== null ? (bodyFit.score * bodyFit.weight) / 100 : -1,
    sweetness: sweetnessFit.score !== null ? (sweetnessFit.score * sweetnessFit.weight) / 100 : -1,
  };

  const adjusted: [ComponentKey, number][] = (Object.keys(raw) as ComponentKey[])
    .filter((key) => raw[key] >= 0)
    .map((key) => [key, raw[key] * relevanceFor(key, dish, score.components)]);

  if (adjusted.length === 0) return null; // defensive — δεν πρέπει να συμβεί όταν confidence !== LOW

  adjusted.sort((a, b) => b[1] - a[1]);
  let winner = adjusted[0][0];

  // Tie rule: αν οι δύο κορυφαίοι είναι πολύ κοντά, μην αφήνεις την επιλογή
  // σε τυχαίο/floating-point περιθώριο — προτίμησε τον ήδη εγκεκριμένο
  // κύριο pairing driver της κατηγορίας (γενικός κανόνας, όχι per-dish).
  if (adjusted.length > 1 && adjusted[0][1] - adjusted[1][1] < TIE_THRESHOLD) {
    winner = categoryPrimaryDriver(dish);
  }

  return textFor(winner, dish);
}
