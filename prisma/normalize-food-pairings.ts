// Data-hygiene fix (όχι copywriting): κεφαλαιοποιεί το πρώτο γράμμα κάθε
// στοιχείου στο Wine.foodPairings, σε όλα τα κρασιά — τεχνικό υπόλειμμα από
// το πώς μπήκαν αρχικά τα δεδομένα (μία πρόταση με κόμματα, χωρισμένη σε
// array, χωρίς επανακεφαλαιοποίηση κάθε στοιχείου: πάντα το πρώτο στοιχείο
// είχε κεφαλαίο, τα υπόλοιπα πεζό). Δεν αλλάζει σημασία/περιεχόμενο, δεν
// προσθέτει/αφαιρεί pairings — μόνο το πρώτο γράμμα κάθε string.
// Εξαίρεση: το αγγλικό "aperitif" (case-insensitive, ως ΟΛΟΚΛΗΡΟ στοιχείο)
// γίνεται "Απεριτίφ".

import { prisma } from "../lib/prisma";

function normalizePairing(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.toLowerCase() === "aperitif") return "Απεριτίφ";
  if (trimmed.length === 0) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

async function main() {
  const wines = await prisma.wine.findMany({
    where: { foodPairings: { isEmpty: false } },
    select: { id: true, slug: true, foodPairings: true },
  });

  let changed = 0;
  for (const wine of wines) {
    const normalized = wine.foodPairings.map(normalizePairing);
    const isSame =
      normalized.length === wine.foodPairings.length &&
      normalized.every((v, i) => v === wine.foodPairings[i]);
    if (isSame) continue;

    await prisma.wine.update({ where: { id: wine.id }, data: { foodPairings: normalized } });
    console.log(`✓ ${wine.slug}`);
    console.log(`  πριν: ${JSON.stringify(wine.foodPairings)}`);
    console.log(`  μετά: ${JSON.stringify(normalized)}`);
    changed++;
  }

  console.log(`\nDone: ${changed}/${wines.length} κρασιά ενημερώθηκαν.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
