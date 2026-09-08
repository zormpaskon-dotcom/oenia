// Venetsanos Winery (Μεγαλοχώρι, Σαντορίνη) — πλήρης κατάλογος 10 κρασιών.
// Πηγή: venetsanoswinery.com/wines/ και οι επιμέρους σελίδες κάθε κρασιού
// (venetsanoswinery.com/product/<slug>/). Το site είναι μόνο στα αγγλικά —
// το κείμενο μεταφράστηκε στα ελληνικά. Vintage: όπου η σελίδα του κρασιού
// έχει ΕΝΑ διαθέσιμο vintage στο dropdown, χρησιμοποιείται αυτό ως τρέχουσα
// εσοδεία. Το Mandilaria είχε δύο επιλογές (2016, 2022) — κρατήθηκε η πιο
// πρόσφατη. Το Liastos δεν έχει vintage στο site (N.V.) αλλά η ίδια η
// φωτογραφία ετικέτας που χρησιμοποιείται (αναμνηστική έκδοση "Anniversary
// First Bottling") αναγράφει ρητά "VINTAGE 2008" — προτιμήθηκε ως πιο
// συγκεκριμένη πηγή. Επίσης προστέθηκε ελληνική μετάφραση κειμένου για την
// ιστορία του οινοποιείου, όπως το έστειλε ο χρήστης.

import { Appellation, ContentStatus, MacroRegion, VarietyType, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "venetsanos-winery" } });
  const santorini = await prisma.region.findUniqueOrThrow({ where: { slug: "santorini" } });
  const kyklades = await prisma.region.upsert({
    where: { slug: "kyklades" },
    update: {},
    create: {
      slug: "kyklades",
      name: "Κυκλάδες",
      macroRegion: MacroRegion.AEGEAN_ISLANDS,
      appellation: Appellation.PGI,
      description:
        "Ευρεία ζώνη ΠΓΕ που καλύπτει το σύνολο του νησιωτικού συμπλέγματος των Κυκλάδων, για κρασιά από γηγενείς ποικιλίες που δεν εμπίπτουν σε πιο συγκεκριμένη τοπική ΠΟΠ/ΠΓΕ ζώνη.",
    },
  });

  await prisma.winery.update({
    where: { slug: "venetsanos-winery" },
    data: {
      story: [
        "Το οινοποιείο Venetsanos βρίσκεται ακριβώς πάνω από το λιμάνι του Αθηνιού, με θέα στην εντυπωσιακή καλντέρα της Σαντορίνης. Η οικογένεια Βενετσάνου έχει μακρόχρονη παράδοση στην παραγωγή κρασιού. Αρχικά το κρασί παραγόταν για το ίδιο το νησί και στη συνέχεια εξαγόταν σε μεγάλη έκταση, ιδιαίτερα σε χώρες όπως η Ρωσία.",
        "Το οινοποιείο χτίστηκε το 1947 από την οικογένεια Βενετσάνου και υπήρξε το πρώτο βιομηχανικό οινοποιείο του νησιού. Το πιο χαρακτηριστικό του γνώρισμα είναι ο δομικός σχεδιασμός, ο οποίος από την αρχή εκμεταλλευόταν τη βαρύτητα, εξασφαλίζοντας ενεργειακή αποδοτικότητα σε μια εποχή που η πρόσβαση σε ηλεκτρισμό και άλλες πηγές ενέργειας ήταν πολύ περιορισμένη.",
        "Το οινοποιείο χτίστηκε με έναν ασυνήθιστο τρόπο, κατασκευασμένο από πάνω προς τα κάτω.",
      ].join("\n\n"),
    },
  });

  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const aidani = await prisma.variety.findUniqueOrThrow({ where: { slug: "aidani" } });
  const athiri = await prisma.variety.findUniqueOrThrow({ where: { slug: "athiri" } });
  const mandilaria = await prisma.variety.findUniqueOrThrow({ where: { slug: "mandilaria" } });
  const platani = await prisma.variety.upsert({
    where: { slug: "platani" },
    update: {},
    create: {
      name: "Πλατάνι",
      slug: "platani",
      nameLatin: "Platani",
      type: VarietyType.WHITE,
      originRegion: "Κυκλάδες (Σαντορίνη)",
      description:
        "Σπάνια λευκή γηγενής ποικιλία των Κυκλάδων, καλλιεργούμενη κυρίως στη Σαντορίνη — συχνά σε συνδυασμό με το Αθήρι.",
    },
  });

  async function upsertWine(spec: {
    slug: string;
    name: string;
    regionId: string;
    vintage: number | null;
    abv: number | null;
    color: WineColor;
    style: WineStyle;
    appellation: Appellation | null;
    description: string;
    tastingNotes: string;
    vineyardNotes: string | null;
    winemakingNotes: string;
    servingTemp: string | null;
    foodPairings: string[];
    varieties: Array<{ varietyId: string; percentage: number | null }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        regionId: spec.regionId,
        vintage: spec.vintage,
        abv: spec.abv,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        vineyardNotes: spec.vineyardNotes,
        winemakingNotes: spec.winemakingNotes,
        servingTemp: spec.servingTemp,
        foodPairings: spec.foodPairings,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        slug: spec.slug,
        name: spec.name,
        wineryId: winery.id,
        regionId: spec.regionId,
        vintage: spec.vintage,
        abv: spec.abv,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        vineyardNotes: spec.vineyardNotes,
        winemakingNotes: spec.winemakingNotes,
        servingTemp: spec.servingTemp,
        foodPairings: spec.foodPairings,
        status: ContentStatus.PUBLISHED,
      },
    });
    await prisma.varietyOnWine.deleteMany({ where: { wineId: wine.id } });
    for (const v of spec.varieties) {
      await prisma.varietyOnWine.create({ data: { wineId: wine.id, varietyId: v.varietyId, percentage: v.percentage } });
    }
    console.log(`✓ ${spec.slug}`);
    return wine;
  }

  console.log("Venetsanos Winery — 10 κρασιά…");

  // Santorini (ενημέρωση υπάρχουσας εγγραφής venetsanos-assyrtiko)
  await upsertWine({
    slug: "venetsanos-assyrtiko",
    name: "Santorini",
    regionId: santorini.id,
    vintage: 2024,
    abv: 13,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description:
      "100% Ασύρτικο από τον αμπελώνα «Γιάννας». Μετά από σύντομη ψυχρή εξαγωγή πριν τη ζύμωση, ο μούστος μεταφέρεται σε ανοξείδωτες δεξαμενές όπου ζυμώνει σε χαμηλές θερμοκρασίες 12-13°C. Παραμονή στις οινολάσπες για 4 μήνες με ελαφριά ανάδευση (bâtonnage).",
    tastingNotes:
      "Λαμπερό κίτρινο χρώμα με πράσινες ανταύγειες. Λεπτά, έντονα αρώματα αχλαδιού, λευκών ανθέων και εσπεριδοειδών, με κυρίαρχη νότα πικρού πορτοκαλιού και ίχνη μαστίχας και μάραθου. Πλούσιο, ελαιώδες στόμα με ζωηρή, δροσιστική οξύτητα και τη χαρακτηριστική αλμύρα του νησιού. Μακρά, απολαυστική επίγευση.",
    vineyardNotes: "Αμπελώνας «Γιάννας» στη Σαντορίνη.",
    winemakingNotes: "Σύντομη ψυχρή εξαγωγή πριν τη ζύμωση, η οποία γίνεται σε ανοξείδωτες δεξαμενές σε χαμηλές θερμοκρασίες 12-13°C. Παραμονή στις οινολάσπες για 4 μήνες με ελαφριά ανάδευση.",
    servingTemp: "10-12 °C",
    foodPairings: ["Θαλασσινά", "Ψητά λαχανικά", "Σούπες λαχανικών", "Ψάρια σχάρας", "Φρέσκα αλμυρά τυριά"],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  // Theory
  await upsertWine({
    slug: "venetsanos-theory",
    name: "Theory",
    regionId: santorini.id,
    vintage: 2020,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description:
      "Ασύρτικο 90% και Αηδάνι 10% από αμπελώνες κοντά στον Πύργο. Μετά από παρατεταμένη επαφή με τα στέμφυλα ακολουθεί ήπια πίεση και ο μούστος της ελεύθερης ροής ζυμώνει σε ανοξείδωτες δεξαμενές σε ελεγχόμενη θερμοκρασία 14-15°C. Παλαιώνει σε γαλλικά δρύινα βαρέλια με τις οινολάσπες για περίπου 8 μήνες.",
    tastingNotes:
      "Βαθύ, κορεσμένο χρυσοκίτρινο χρώμα. Σύνθετος αρωματικός χαρακτήρας με ποικιλία φρούτων — βερίκοκο, ροδάκινο, γκρέιπφρουτ, λίτσι, μήλο και αχλάδι. Νόστιμο, πλούσιο στόμα με τραγανή αίσθηση και μέτρια επίγευση.",
    vineyardNotes: "Αμπελώνες κοντά στον Πύργο Σαντορίνης.",
    winemakingNotes: "Παρατεταμένη επαφή με τα στέμφυλα, ήπια πίεση, ζύμωση σε ανοξείδωτες δεξαμενές στους 14-15°C, παλαίωση σε γαλλικά δρύινα βαρέλια με τις οινολάσπες περίπου 8 μήνες.",
    servingTemp: "11-12 °C",
    foodPairings: ["Λιπαρά ψάρια", "Ριζότο με λευκές σάλτσες", "Πουλερικά", "Ώριμα τυριά"],
    varieties: [
      { varietyId: assyrtiko.id, percentage: 90 },
      { varietyId: aidani.id, percentage: 10 },
    ],
  });

  // Platani / Athiri
  await upsertWine({
    slug: "venetsanos-platani-athiri",
    name: "Platani / Athiri",
    regionId: kyklades.id,
    vintage: 2025,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description:
      "Πλατάνι 65% και Αθήρι 35% από αμπελώνες κοντά στο Μεγαλοχώρι. Μετά τη διαύγαση, ο μούστος της ελεύθερης ροής ζυμώνει σε ανοξείδωτες δεξαμενές σε χαμηλές θερμοκρασίες 12-13°C. Παραμονή στις οινολάσπες για 4 μήνες.",
    tastingNotes:
      "Ανοιχτό κιτρινοπράσινο χρώμα με λαμπερές ανταύγειες. Εντυπωσιακή μύτη με δέσμη αρωμάτων που αναδεικνύουν τον ποικιλιακό χαρακτήρα — έντονα αρώματα τροπικών φρούτων και ανανά, αχλαδιού και βερίκοκου, με νότες ανθέων λεμονιού. Πλούσια, ισορροπημένη γεύση με εξαιρετική δομή, δροσιστική οξύτητα και ωραία αρωματική επίγευση.",
    vineyardNotes: "Αμπελώνες κοντά στο Μεγαλοχώρι Σαντορίνης.",
    winemakingNotes: "Μετά τη διαύγαση, ζύμωση του μούστου ελεύθερης ροής σε ανοξείδωτες δεξαμενές σε χαμηλές θερμοκρασίες 12-13°C, παραμονή στις οινολάσπες για 4 μήνες.",
    servingTemp: "10 °C",
    foodPairings: ["Ψάρι σχάρας", "Πιάτα θαλασσινών", "Πράσινες σαλάτες", "Ορεκτικά", "Πιάτα λευκών τυριών"],
    varieties: [
      { varietyId: platani.id, percentage: 65 },
      { varietyId: athiri.id, percentage: 35 },
    ],
  });

  // Nykteri
  await upsertWine({
    slug: "venetsanos-nykteri",
    name: "Nykteri",
    regionId: santorini.id,
    vintage: 2022,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description:
      "Ασύρτικο 95%, Αηδάνι 3% και Αθήρι 2% από αμπελώνες κοντά στο Ακρωτήρι και το Μεγαλοχώρι. Μετά από σύντομη ψυχρή εξαγωγή πριν τη ζύμωση, ο μούστος μεταφέρεται σε γαλλικά δρύινα βαρέλια χωρητικότητας 225, 300 και 500 λίτρων, όπου γίνεται ολόκληρη η ζύμωση για καλύτερη ενσωμάτωση των αρωμάτων της δρυός. Παραμονή στις οινολάσπες με ανάδευση για 4 μήνες.",
    tastingNotes:
      "Λαμπερό κίτρινο χρώμα με χρυσαφένιες ανταύγειες. Κομψά αρώματα από κίτρο και άνθη μανόλιας. Αίσθηση μαρμελάδας εσπεριδοειδών και μαστίχας που συνυπάρχουν αρμονικά με βοτανικά αρώματα θυμαριού, φασκόμηλου και ορυκτές νότες. Στο στόμα, γεμάτο σώμα, ελαιώδης υφή και υψηλή οξύτητα που ισορροπεί το βάθος του φρούτου και την υψηλή περιεκτικότητα σε αλκοόλ. Μακρά επίγευση με επίμονα αρώματα ξύλου, καβουρδισμένου καφέ και βανίλιας. Δυναμικό παλαίωσης 8 ετών.",
    vineyardNotes: "Αμπελώνες κοντά στο Ακρωτήρι και το Μεγαλοχώρι Σαντορίνης.",
    winemakingNotes: "Σύντομη ψυχρή εξαγωγή πριν τη ζύμωση, η οποία γίνεται εξ ολοκλήρου σε γαλλικά δρύινα βαρέλια 225-500 λίτρων για καλύτερη ενσωμάτωση των αρωμάτων της δρυός. Παραμονή στις οινολάσπες με ανάδευση για 4 μήνες.",
    servingTemp: "12-13 °C",
    foodPairings: ["Λιπαρά ψάρια", "Ζυμαρικά με πλούσιες κρεμώδεις σάλτσες", "Ώριμα κίτρινα τυριά", "Μελιτζανοσαλάτα καπνιστή", "Ριζότο με μανιτάρια", "Πουλερικά"],
    varieties: [
      { varietyId: assyrtiko.id, percentage: 95 },
      { varietyId: aidani.id, percentage: 3 },
      { varietyId: athiri.id, percentage: 2 },
    ],
  });

  // Mandilaria
  await upsertWine({
    slug: "venetsanos-mandilaria",
    name: "Mandilaria",
    regionId: kyklades.id,
    vintage: 2022,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description:
      "100% Μανδηλαριά. Μετά από 4-5 ημέρες εκχύλισης, ο μούστος ελεύθερης ροής ζυμώνει σε ανοξείδωτες δεξαμενές. Η ζύμωση για το 60% του μούστου ολοκληρώνεται σε βαρέλια 225 λίτρων και για το υπόλοιπο 40% σε ανοξείδωτη δεξαμενή. Μετά από αρκετούς μήνες παλαίωσης, γίνεται το τελικό χαρμάνι και εμφιαλώνεται.",
    tastingNotes:
      "Βαθύ κόκκινο χρώμα με μοβ ανταύγειες. Αρώματα σύκου, ξινού κερασιού, άνθους γαρίφαλου, βανίλιας και μια αίσθηση μαρμελάδας φράουλας. Μέτριο σώμα με σταθερές τανίνες και γήινο χαρακτήρα που αποκαλύπτει το μοναδικό terroir της Σαντορίνης. Επίγευση με αρώματα καμένου ξύλου και καβουρδισμένων ξηρών καρπών. Συνιστάται ντεκάντζ. Δυναμικό παλαίωσης άνω των 8 ετών.",
    vineyardNotes: "Αμπελώνες Μανδηλαριάς στη Σαντορίνη.",
    winemakingNotes: "4-5 ημέρες εκχύλισης, ζύμωση του μούστου ελεύθερης ροής σε ανοξείδωτες δεξαμενές· το 60% ολοκληρώνει τη ζύμωση σε βαρέλια 225L και το 40% σε ανοξείδωτη δεξαμενή. Παλαίωση αρκετών μηνών πριν το τελικό χαρμάνι και την εμφιάλωση.",
    servingTemp: "14-16 °C",
    foodPairings: ["Χοιρινό με δαμάσκηνα", "Λιπαρά τυριά", "Προσούτο", "Ψητό μοσχάρι", "Ζυμαρικά με αστακό", "Τόνο"],
    varieties: [{ varietyId: mandilaria.id, percentage: 100 }],
  });

  // Roseate
  await upsertWine({
    slug: "venetsanos-roseate",
    name: "Roseate",
    regionId: kyklades.id,
    vintage: 2023,
    abv: null,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description:
      "Ασύρτικο 70%, Αηδάνι 25% και Μανδηλαριά 5% από αμπελώνες κοντά στον μονοαμπελώνα «Γιάννας». Σύντομη επαφή με τα στέμφυλα για το μέρος των λευκών ποικιλιών. Ζύμωση σε ανοξείδωτες δεξαμενές σε χαμηλές θερμοκρασίες 12-13°C, με παραμονή στις λεπτές οινολάσπες για 4 μήνες.",
    tastingNotes: "Απαλό ροζ-σομόν χρώμα. Αρώματα γκρέιπφρουτ και φράουλας. Καλοδομημένο, με υψηλή οξύτητα και έντονη αρωματική επίγευση.",
    vineyardNotes: "Αμπελώνες κοντά στον μονοαμπελώνα «Γιάννας».",
    winemakingNotes: "Σύντομη επαφή με τα στέμφυλα για το μέρος των λευκών ποικιλιών, ζύμωση σε ανοξείδωτες δεξαμενές στους 12-13°C, παραμονή στις λεπτές οινολάσπες 4 μήνες.",
    servingTemp: "10-12 °C",
    foodPairings: ["Ζυμαρικά με θαλασσινά", "Γαρίδες σαγανάκι", "Ζυμαρικά με κιμά", "Ασιατική και εξωτική κουζίνα"],
    varieties: [
      { varietyId: assyrtiko.id, percentage: 70 },
      { varietyId: aidani.id, percentage: 25 },
      { varietyId: mandilaria.id, percentage: 5 },
    ],
  });

  // Anagallis
  await upsertWine({
    slug: "venetsanos-anagallis",
    name: "Anagallis",
    regionId: kyklades.id,
    vintage: 2023,
    abv: null,
    color: WineColor.ROSE,
    style: WineStyle.OFF_DRY,
    appellation: Appellation.PGI,
    description:
      "Ασύρτικο 30%, Αηδάνι 50% και Μανδηλαριά 20%. Μετά την προκαταρκτική διαύγαση του μούστου, η ζύμωση ξεκινά σε ανοξείδωτες δεξαμενές σε ελεγχόμενη θερμοκρασία. Παραμονή στις λεπτές οινολάσπες για 4 μήνες.",
    tastingNotes:
      "Ζωηρό ροζ χρώμα. Μύτη γεμάτη γοητευτικά αρώματα ροδιού, με χαρακτηριστικές νότες τριαντάφυλλου, άγριας φράουλας και κερασιού. Γεμάτο σώμα με διακριτική γλυκύτητα που ισορροπεί άψογα με τη δροσιστική οξύτητα. Ελαφριά αίσθηση ανθρακικού που δίνει ζωντάνια. Απαλές τανίνες παρούσες με διακριτικό τρόπο. Φρουτώδης, μακρά επίγευση.",
    vineyardNotes: null,
    winemakingNotes: "Προκαταρκτική διαύγαση του μούστου, ζύμωση σε ανοξείδωτες δεξαμενές σε ελεγχόμενη θερμοκρασία, παραμονή στις λεπτές οινολάσπες για 4 μήνες.",
    servingTemp: "10-12 °C",
    foodPairings: ["Σολομό", "Ζυμαρικά με θαλασσινά", "Κατσικίσιο τυρί", "Σαλάτες με φρούτα", "Ασιατική κουζίνα"],
    varieties: [
      { varietyId: assyrtiko.id, percentage: 30 },
      { varietyId: aidani.id, percentage: 50 },
      { varietyId: mandilaria.id, percentage: 20 },
    ],
  });

  // Liastos — η φωτογραφία ετικέτας είναι η αναμνηστική έκδοση "Anniversary
  // First Bottling", η οποία αναγράφει ρητά "VINTAGE 2008" (το site δεν
  // δηλώνει vintage, μόνο "N.V.")
  await upsertWine({
    slug: "venetsanos-liastos",
    name: "Liastos",
    regionId: kyklades.id,
    vintage: 2008,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.SWEET,
    appellation: Appellation.PGI,
    description:
      "100% Μανδηλαριά από υπερώριμα σταφύλια που λιάζονται στον ήλιο για 7-15 ημέρες. Ακολουθεί αποβοστρύχωση και πίεση. Ο γλυκός κόκκινος μούστος ζυμώνει αργά για περισσότερο από 2 μήνες σε ανοξείδωτες δεξαμενές σε ελεγχόμενη θερμοκρασία. Μετά το τέλος της ζύμωσης, το φυσικά γλυκό κρασί μεταφέρεται σε δρύινα βαρέλια για παλαίωση πολλών ετών. Δυναμικό παλαίωσης απεριόριστο.",
    tastingNotes:
      "Καστανό (tawny) χρώμα με έντονη μύτη ξερού σύκου, δαμάσκηνου και μπαχαρικών. Παχύρρευστο κρασί με πλούσια υφή. Το ώριμο φρούτο ισορροπεί σε μια χαριτωμένη γραμμή οξύτητας. Ζεστό, σαρκώδες και σταθερό, με συμπυκνωμένα αρώματα σταφίδας, κανέλας και ζελεδωτών κόκκινων φρούτων.",
    vineyardNotes: null,
    winemakingNotes: "Υπερώριμα σταφύλια λιάζονται στον ήλιο 7-15 ημέρες, αποβοστρυχώνονται και πιέζονται. Αργή ζύμωση άνω των 2 μηνών σε ανοξείδωτες δεξαμενές σε ελεγχόμενη θερμοκρασία, ακολουθούμενη από παλαίωση πολλών ετών σε δρύινα βαρέλια.",
    servingTemp: "8-10 °C",
    foodPairings: ["Πάπια με κάστανα και πορτοκάλι", "Roquefort", "Κοπανιστή", "Αλμυρά τυριά", "Λευκές κρέμες επιδόρπια"],
    varieties: [{ varietyId: mandilaria.id, percentage: 100 }],
  });

  // Vinsanto (vintage 2003 — αναγράφεται στην ίδια την ετικέτα)
  await upsertWine({
    slug: "venetsanos-vinsanto",
    name: "Vinsanto",
    regionId: santorini.id,
    vintage: 2003,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.SWEET,
    appellation: Appellation.PDO,
    description:
      "Ασύρτικο 70%, Αηδάνι 25% και άλλες λευκές ποικιλίες 5%, από αμπελώνες κοντά στο Ακρωτήρι. Υπερώριμα λευκά σταφύλια λιάζονται στον ήλιο για 7-15 ημέρες, αποβοστρυχώνονται και πιέζονται. Ο γλυκός μούστος ζυμώνει αργά για περισσότερο από 2 μήνες σε ανοξείδωτες δεξαμενές σε ελεγχόμενη θερμοκρασία. Μετά τη ζύμωση, το φυσικά γλυκό κρασί μεταφέρεται σε δρύινα βαρέλια για παλαίωση τουλάχιστον 2 ετών. Δυναμικό παλαίωσης απεριόριστο.",
    tastingNotes:
      "Μελένιο, βελούδινο στόμα με νότες σύκου, σταφίδας, καραμέλας και βανίλιας. Επίμονα αρώματα αποξηραμένου βερίκοκου, μελιού, καβουρδισμένων ξηρών καρπών, πικρής σοκολάτας και μιας νότας πορτοκαλιού. Μακρά επίγευση που ισορροπεί ανάμεσα στη γλυκύτητα και μια κοφτερή οξύτητα.",
    vineyardNotes: "Αμπελώνες κοντά στο Ακρωτήρι Σαντορίνης.",
    winemakingNotes: "Υπερώριμα σταφύλια λιάζονται στον ήλιο 7-15 ημέρες, αποβοστρυχώνονται και πιέζονται. Αργή ζύμωση άνω των 2 μηνών σε ανοξείδωτες δεξαμενές, μετέπειτα παλαίωση τουλάχιστον 2 ετών σε δρύινα βαρέλια.",
    servingTemp: "8-10 °C",
    foodPairings: ["Μαύρη σοκολάτα", "Τάρτες φρούτων", "Επιδόρπια με ζαχαρωτά και ξηρούς καρπούς", "Φουά γκρα", "Έντονα τυριά"],
    varieties: [
      { varietyId: assyrtiko.id, percentage: 70 },
      { varietyId: aidani.id, percentage: 25 },
    ],
  });

  // Vinsanto 12 Years Aged
  await upsertWine({
    slug: "venetsanos-vinsanto-12-years",
    name: "Vinsanto 12 Years Aged",
    regionId: santorini.id,
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.SWEET,
    appellation: Appellation.PDO,
    description:
      "Ασύρτικο 70%, Αηδάνι 25% και άλλες λευκές ποικιλίες 5%. Μια ειδική, μακρόχρονα παλαιωμένη εκδοχή του Vinsanto, φτιαγμένη από σταφύλια που λιάζονται φυσικά στον ήλιο. Μετά την παρατεταμένη ζύμωση ακολουθεί παλαίωση σε γαλλικά δρύινα βαρέλια για τουλάχιστον 12 χρόνια πριν την εμφιάλωση. Δυναμικό παλαίωσης απεριόριστο.",
    tastingNotes:
      "Παχύρρευστο στόμα με νότες σύκου, σταφίδας, καραμέλας, ελαφριάς βανίλιας και ορυκτό χαρακτήρα. Επίμονα αρώματα αποξηραμένων φρούτων, μελιού, καβουρδισμένων ξηρών καρπών, καφέ και πικρής σοκολάτας. Ατελείωτη επίγευση.",
    vineyardNotes: null,
    winemakingNotes: "Παρατεταμένη ζύμωση, ακολουθούμενη από παλαίωση σε γαλλικά δρύινα βαρέλια για τουλάχιστον 12 χρόνια πριν την εμφιάλωση.",
    servingTemp: "8-10 °C",
    foodPairings: ["Επιδόρπια σοκολάτας γάλακτος με ζαχαρωτά και ξηρούς καρπούς", "Φουά γκρα", "Τάρτες", "Αμυγδαλωτά γλυκά", "Πικάντικα τυριά"],
    varieties: [
      { varietyId: assyrtiko.id, percentage: 70 },
      { varietyId: aidani.id, percentage: 25 },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
