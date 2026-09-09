// Ορίζει το featuredQuote για το σημερινό προτεινόμενο κρασί της αρχικής
// (Sigalas Santorini Assyrtiko) — βασισμένο αποκλειστικά στο ήδη υπαρκτό
// vineyardNotes του ίδιου κρασιού ("κλήματα ηλικίας άνω των 60 ετών σε
// ηφαιστειογενή εδάφη"). Καμία επινόηση.

import { prisma } from "../lib/prisma";

async function main() {
  const wine = await prisma.wine.update({
    where: { slug: "sigalas-santorini-assyrtiko" },
    data: { featuredQuote: "Πάνω από 60 χρόνια αμπέλι, σε ηφαιστειακό χώμα." },
  });
  console.log(`✓ ${wine.name}: featuredQuote = "${wine.featuredQuote}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
