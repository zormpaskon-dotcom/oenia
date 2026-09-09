// Μηχανική διόρθωση διατύπωσης στο tastingNotes ενός μόνο κρασιού
// (snob-white) — καμία νέα γευστική πληροφορία, ίδια στοιχεία, απλώς πιο
// σαφής διάκριση κύριων αρωμάτων vs δευτερευουσών νότων. Επαληθεύει το
// ΑΚΡΙΒΕΣ τρέχον string πριν γράψει.

import { prisma } from "../lib/prisma";

const FROM = "Νότες γιασεμιού, κρίνου και τριαντάφυλλου, με αχλάδι, lime, βερίκοκο και ανανά.";
const TO = "Αρώματα γιασεμιού, κρίνου και τριαντάφυλλου, με νότες αχλαδιού, lime, βερίκοκου και ανανά.";

async function main() {
  const wine = await prisma.wine.findUnique({ where: { slug: "snob-white" }, select: { id: true, tastingNotes: true } });
  if (!wine) throw new Error("Wine not found: snob-white");
  if (wine.tastingNotes !== FROM) {
    throw new Error(`tastingNotes δεν ταιριάζει με το αναμενόμενο — abort χωρίς αλλαγές.\nΤρέχον: ${JSON.stringify(wine.tastingNotes)}`);
  }
  await prisma.wine.update({ where: { id: wine.id }, data: { tastingNotes: TO } });
  console.log(`✓ Wine "snob-white" tastingNotes ενημερώθηκε.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
