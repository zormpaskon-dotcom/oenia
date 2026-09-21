// Κτήμα Μερκούρη ήταν λανθασμένα συνδεδεμένο με το Region "Πάτρα" — στην
// πραγματικότητα βρίσκεται στο Κορακοχώρι, κοντά στον Πύργο Ηλείας, και
// κανένα από τα 13 τεχνικά δελτία των κρασιών του δεν αναφέρει καν την
// Πάτρα· όλα δηλώνουν ΠΓΕ Ηλεία ή τις στενότερες ζώνες Λετρίνοι/Πισάτις
// (ήδη καταγεγραμμένες στο vineyardNotes κάθε κρασιού). Δημιουργούμε το
// Region "Ηλεία" (ίδιο μοτίβο με τα ήδη υπαρκτά ευρέα PGI regions
// "Πελοπόννησος"/"Αχαΐα"/"Αρκαδία") και μεταφέρουμε εκεί το οινοποιείο +
// όλα τα κρασιά του.
import { PrismaClient, MacroRegion, Appellation } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const region = await prisma.region.upsert({
    where: { slug: "ileia" },
    update: {},
    create: {
      slug: "ileia",
      name: "Ηλεία",
      macroRegion: MacroRegion.PELOPONNESE,
      appellation: Appellation.PGI,
      description:
        "Ευρεία ζώνη ΠΓΕ γύρω από τον Πύργο, στη Δυτική Πελοπόννησο — περιλαμβάνει και στενότερες τοπικές ζώνες όπως η ΠΓΕ Λετρίνοι και η ΠΓΕ Πισάτις.",
      latitude: 37.6706,
      longitude: 21.4443,
    },
  });
  console.log(`✓ Region «Ηλεία» (${region.slug})`);

  const winery = await prisma.winery.update({
    where: { slug: "ktima-merkouri" },
    data: { regionId: region.id, subRegion: "Πύργος" },
  });
  console.log(`✓ winery ktima-merkouri: region Πάτρα → Ηλεία, subRegion=Πύργος`);

  const { count } = await prisma.wine.updateMany({
    where: { wineryId: winery.id },
    data: { regionId: region.id },
  });
  console.log(`✓ ${count} wines: region Πάτρα → Ηλεία`);

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
