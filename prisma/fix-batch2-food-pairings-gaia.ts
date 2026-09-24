// PHASE 3B — BATCH 2 — Group 9 (Gaia Wines) — Food pairing enrichment.
// Γράφει ΜΟΝΟ το πεδίο `foodPairings` για 8 κρασιά του Gaia Wines, όπου η
// επίσημη σελίδα προϊόντος (gaiawines.gr) περιέχει σαφή, wine-specific
// αναφορά σε συγκεκριμένο φαγητό ή περίσταση κατανάλωσης — εξαιρουμένου του
// γενικού "#WinePairing" module που επαναλαμβάνεται πανομοιότυπο σε ΚΑΘΕ
// σελίδα προϊόντος του site (και συνεπώς απορρίφθηκε ως πηγή, μη-wine-
// specific). Όλες οι τιμές επαναχρησιμοποιούν ήδη υπάρχοντα pairing strings
// της βάσης (καμία νέα κατηγορία). Κανένα άλλο πεδίο αγγίζεται.
//
// 1. gaia-ammonite : ["Οστρακοειδή", "Ψάρια", "Κόκκινο κρέας", "Κρέατα με
//    πλούσιες σάλτσες"]
//    Πηγή: gaiawines.gr/ammonite/ — "...ιδανικά δίπλα σε αναρίθμητα πιάτα,
//    από οστρακοειδή, ψάρι, έως και κόκκινο κρέας και πλούσιες σάλτσες."
//
// 2. gaia-optimus : ["Κόκκινο κρέας", "Πικάντικα πιάτα"]
//    Πηγή: gaiawines.gr/optimus/ — "Σας συνιστούμε να το απολαύσετε με μια
//    σχετικά πλούσια κουζίνα που θα περιστρέφεται γύρω από το κόκκινο κρέας
//    και τα πικάντικα εδέσματα."
//
// 3. gaia-ritinitis-nobilis : ["Μεζέδες", "Καπνιστά ψάρια"]
//    Πηγή: gaiawines.gr/ritinitis-nobilis/ — "...εκεί που ο τσίρος συναντά
//    χωρίς ενοχές τον μπεκρή μεζέ!"
//
// 4. gaia-monograph-asyrtiko : ["Θαλασσινά"]
//    Πηγή: gaiawines.gr/monograph-asyrtiko/ — "...απολαμβάνεται τόσο με
//    όμορφα θαλασσινά γεύματα όσο και μόνο του."
//
// 5. gaia-4-6h : ["Απεριτίφ"]
//    Πηγή: DB tastingNotes (ήδη official-sourced) — "Απολαμβάνεται σαν
//    λευκό κρασί, μόνο του ή ως απεριτίφ."
//
// 6. gaia-monograph-agiorgitiko : ["Απεριτίφ"]
//    Πηγή: gaiawines.gr/monograph-agiorgitiko/ — "...αλλά «στέκεται» και
//    μόνο του ως απεριτίφ."
//
// 7. gaia-monograph-moschofilero : ["Απεριτίφ"]
//    Πηγή: gaiawines.gr/monograph-moschofilero/ — "Δοκιμάστε το...αλλά και
//    μόνο του ως aperitif."
//
// 8. gaia-monograph-multi : ["Απεριτίφ"]
//    Πηγή: gaiawines.gr/monograph-multi/ — "Δοκιμάστε το...αλλά και μόνο
//    του ως απεριτίφ."
//
// ΔΕΝ αγγίζονται (MEDIUM/inferred, παραμένουν χωρίς write): gaia-thalassitis,
// gaia-thalassitis-cellar-aged, gaia-monograph-agiorgitiko-syrah, gaia-s-red,
// gaia-asyrtiko-clay, gaia-asyrtiko-wild-ferment, gaia-ktima-gaias.
// ΔΕΝ αγγίζεται (unresolved): gaia-nychteri.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updates: { slug: string; foodPairings: string[] }[] = [
  { slug: "gaia-ammonite", foodPairings: ["Οστρακοειδή", "Ψάρια", "Κόκκινο κρέας", "Κρέατα με πλούσιες σάλτσες"] },
  { slug: "gaia-optimus", foodPairings: ["Κόκκινο κρέας", "Πικάντικα πιάτα"] },
  { slug: "gaia-ritinitis-nobilis", foodPairings: ["Μεζέδες", "Καπνιστά ψάρια"] },
  { slug: "gaia-monograph-asyrtiko", foodPairings: ["Θαλασσινά"] },
  { slug: "gaia-4-6h", foodPairings: ["Απεριτίφ"] },
  { slug: "gaia-monograph-agiorgitiko", foodPairings: ["Απεριτίφ"] },
  { slug: "gaia-monograph-moschofilero", foodPairings: ["Απεριτίφ"] },
  { slug: "gaia-monograph-multi", foodPairings: ["Απεριτίφ"] },
];

async function main() {
  for (const { slug, foodPairings } of updates) {
    const wine = await prisma.wine.findUniqueOrThrow({
      where: { slug },
      select: { id: true, slug: true, foodPairings: true },
    });

    if (wine.foodPairings && wine.foodPairings.length > 0) {
      console.log(`✗ SKIPPED ${slug}: foodPairings already has content — no overwrite`);
      continue;
    }

    await prisma.wine.update({
      where: { id: wine.id },
      data: { foodPairings },
    });
    console.log(`✓ ${slug}: foodPairings set to [${foodPairings.join(", ")}]`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
