// Συμπληρώνει τα κενά πεδία που άφησε το update-varieties.ts (τα αρχεία
// χρήστη δεν κάλυπταν aromaIntensity/ageingPotential καθόλου, ούτε 6
// ποικιλίες με κανένα πεδίο). Ερευνήθηκε online — βλ. πηγές παρακάτω.
//
// Πηγές (γενικά αναγνωρισμένα χαρακτηριστικά ποικιλιών, όχι συγκεκριμένη
// ετικέτα): Wine Folly, Wine-Searcher, MasterClass, Jancis Robinson, Decanter
// για τις 5 διεθνείς· cantinamag.gr/protothema για το Μαυροφίλερο.
//
// Μαυροφίλερο: διορθώθηκε από RED σε WHITE — είναι γκριζωπή/ροζέ ποικιλία
// της ίδιας οικογένειας με το Μοσχοφίλερο (ίδια σύμβαση type στη βάση μας),
// όχι κόκκινη όπως υποθέσαμε αρχικά από το πρόθεμα "Μαυρο-".

import { PrismaClient, VarietyType } from "@prisma/client";

const prisma = new PrismaClient();

const RESEARCHED: Record<string, Record<string, unknown>> = {
  "Cabernet Franc": {
    originRegion: "Μπορντό, Γαλλία",
    description:
      "Γονεϊκή ποικιλία του Cabernet Sauvignon (μαζί με το Sauvignon Blanc) — προέρχεται από τη νοτιοδυτική Γαλλία. Δίνει πιο ελαφριά, φρουτώδη κρασιά από το Cabernet Sauvignon, με χαρακτηριστικό άρωμα πιπεριάς και βοτάνων.",
    characteristics:
      "Μέτριο σώμα, μαλακές τανίνες σε σχέση με το Cabernet Sauvignon, ζωηρή οξύτητα. Αρώματα σμέουρου, κερασιού, βιολέτας, πράσινης πιπεριάς και φρέσκων βοτάνων.",
    acidity: 75,
    body: 55,
    tannins: 55,
    aromaIntensity: 65,
    ageingPotential: 60,
  },
  Gewürztraminer: {
    originRegion: "Άλσας, Γαλλία",
    description:
      "Αρωματική λευκή ποικιλία, μετάλλαξη του Traminer (Savagnin) με καταγωγή από το Alto Adige της Ιταλίας — σήμερα ταυτίζεται κυρίως με την Αλσατία.",
    characteristics:
      "Γεμάτο σώμα, χαμηλή έως μέτρια οξύτητα, συχνά υψηλό αλκοόλ. Έντονα αρώματα λίτσι, τριαντάφυλλου, λουκουμιού και εξωτικών μπαχαρικών.",
    acidity: 35,
    body: 70,
    tannins: 0,
    aromaIntensity: 95,
    ageingPotential: 35,
  },
  "Pinot Noir": {
    originRegion: "Βουργουνδία, Γαλλία",
    description:
      "Μία από τις παλαιότερες ποικιλίες κρασιού, με πνευματική πατρίδα τη Βουργουνδία. Λεπτόφλουδη και απαιτητική στην καλλιέργεια, ευδοκιμεί σε δροσερά κλίματα.",
    characteristics:
      "Ελαφρύ έως μέτριο σώμα, υψηλή οξύτητα, χαμηλές έως μέτριες αλλά μεταξένιες τανίνες. Νεαρό δίνει κεράσι, φράουλα και σμέουρο· με παλαίωση αναπτύσσει μανιτάρι και δασικό υπέδαφος.",
    acidity: 80,
    body: 40,
    tannins: 35,
    aromaIntensity: 60,
    ageingPotential: 55,
  },
  Semillon: {
    originRegion: "Μπορντό, Γαλλία",
    description:
      "Λευκή ποικιλία από το Μπορντό, από τις πιο διαδεδομένες στη Γαλλία. Λεπτόφλουδη, επιρρεπής στην ευγενή σήψη (botrytis) — βασικό συστατικό σε γλυκά κρασιά όπως το Sauternes.",
    characteristics:
      "Μέτριο έως γεμάτο σώμα, ελαιώδης υφή, χαμηλές τανίνες, μέτρια έως χαμηλή οξύτητα. Λεμόνι και πυρηνόκαρπα νεαρό· μέλι και ξηρούς καρπούς με παλαίωση. Εξαιρετικό δυναμικό παλαίωσης.",
    acidity: 40,
    body: 65,
    tannins: 0,
    aromaIntensity: 45,
    ageingPotential: 70,
  },
  Tannat: {
    originRegion: "Νοτιοδυτική Γαλλία (Madiran) / Ουρουγουάη",
    description:
      "Ερυθρή ποικιλία από τους πρόποδες των Πυρηναίων, γνωστή για τις πολύ υψηλές τανίνες που της έδωσαν το όνομα. Τον 19ο αιώνα Βάσκοι μετανάστες τη μετέφεραν στην Ουρουγουάη, όπου σήμερα θεωρείται η εθνική ποικιλία της χώρας.",
    characteristics:
      "Γεμάτο σώμα, πολύ υψηλές τανίνες, υψηλή οξύτητα, βαθύ χρώμα. Αρώματα κόκκινων και μαύρων φρούτων, μπαχαρικών και λουλουδιών. Μεγάλο δυναμικό παλαίωσης.",
    acidity: 75,
    body: 85,
    tannins: 95,
    aromaIntensity: 60,
    ageingPotential: 85,
  },
  Μαυροφίλερο: {
    type: VarietyType.WHITE,
    originRegion: "Υψίπεδο Μαντινείας, Πελοπόννησος",
    description:
      "Ελληνική ποικιλία της ίδιας οικογένειας με το Μοσχοφίλερο, με γκριζωπό-ροζέ φλοιό. Καλλιεργείται στο ορεινό υψίπεδο της Μαντινείας (650μ) στην κεντρική Πελοπόννησο.",
    characteristics:
      "Ελαφρύ σώμα, ζωηρή οξύτητα, χαμηλό αλκοόλ, λεπτά αρώματα. Νότες τριαντάφυλλου, εσπεριδοειδών και λουκουμιού — αρωματικό προφίλ κοντά στο Μοσχοφίλερο.",
    acidity: 75,
    body: 30,
    tannins: 0,
    aromaIntensity: 70,
    ageingPotential: 25,
  },
  // Ήδη είχαν description/characteristics/acidity/body/tannins από το αρχείο
  // χρήστη (update-varieties.ts) — έλειπαν μόνο τα δύο παρακάτω.
  "Cabernet Sauvignon": { aromaIntensity: 70, ageingPotential: 90 },
  Chardonnay: { aromaIntensity: 55, ageingPotential: 55 },
  Merlot: { aromaIntensity: 55, ageingPotential: 55 },
  "Sauvignon Blanc": { aromaIntensity: 85, ageingPotential: 30 },
  Syrah: { aromaIntensity: 75, ageingPotential: 75 },
  Viognier: { aromaIntensity: 85, ageingPotential: 35 },
  Λιάτικο: { aromaIntensity: 60, ageingPotential: 55 },
  Σαββατιανό: { aromaIntensity: 40, ageingPotential: 55 },
  // Προϋπήρχαν από το αρχικό seed.ts χωρίς characteristics.
  Αθήρι: {
    originRegion: "Νησιά Αιγαίου",
    characteristics:
      "Ελαφρύ σώμα, μέτρια οξύτητα, διακριτικά αρώματα λευκών λουλουδιών και εσπεριδοειδών. Σπάνια μονοποικιλιακό — συνήθως σε blend, π.χ. με Ασύρτικο στη Σαντορίνη.",
  },
  Αηδάνι: {
    characteristics:
      "Αρωματική, με νότες βερίκοκου και μελιού. Βασικό συστατικό στο Vinsanto της Σαντορίνης λόγω της τάσης του να ζαχαρώνει εύκολα όταν λιάζεται.",
  },
  Βηλάνα: {
    characteristics:
      "Ελαφριά, εύπιοτη, με μέτρια οξύτητα και διακριτικά αρώματα εσπεριδοειδών και λευκών ανθέων. Η πιο διαδεδομένη λευκή ποικιλία της Κρήτης.",
  },
  Νεγκόσκα: {
    characteristics:
      "Απαλή, χαμηλών τανινών, με νότες κόκκινων φρούτων. Χρησιμοποιείται σχεδόν αποκλειστικά σε blend με Ξινόμαυρο στη Γουμένισσα, όπου «στρογγυλεύει» τη σκληρότητά του.",
  },
};

async function main() {
  for (const [name, data] of Object.entries(RESEARCHED)) {
    await prisma.variety.update({ where: { name }, data });
  }
  console.log(`Ενημερώθηκαν ${Object.keys(RESEARCHED).length} ποικιλίες.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
