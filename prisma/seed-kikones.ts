// Κτήμα Κίκονες (Μαρώνεια, Θράκη) — πλήρης κατάλογος 7 ετικετών + εμπλουτισμός
// του winery profile. Το winery ήδη υπήρχε στη βάση με 1 μόνο κρασί (Μάρων
// Sangiovese). Πηγή: επίσημο site https://www.kikones.gr (σελίδες Ετικέτες
// ανά κρασί + «Οι σύγχρονοι/αρχαίοι Κίκονες»), με άδεια του χρήστη.

import { ContentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "domaine-kikones" } });
  const maroneia = await prisma.region.findUniqueOrThrow({ where: { slug: "maroneia" } });

  console.log("Winery profile — σύνοψη από το επίσημο site…");
  await prisma.winery.update({
    where: { id: winery.id },
    data: {
      description:
        "Το πρώτο οινοποιείο της Ροδόπης, ιδρύθηκε το 2004 από τη Μελίνα Τάσσου, Γεωπόνο-Οινολόγο D.N.O. Bordeaux, με στόχο να αναβιώσει την αρχαία αμπελουργική παράδοση της Θράκης. Το όνομα τιμά τους Κίκονες, το θρακικό φύλο που ο Όμηρος αναφέρει στην Ιλιάδα ως συμμάχους των Τρώων και προμηθευτές του φημισμένου οίνου τους· στην Οδύσσεια, ο βασιλιάς-ιερέας των Κικόνων Μάρωνας δίνει στον Οδυσσέα το κρασί που αργότερα μέθυσε τον Κύκλωπα Πολύφημο. Η σύγχρονη Μαρώνεια, όπου βρίσκεται το κτήμα, πήρε το όνομά της από τον ίδιο τον Μάρωνα.",
      story:
        "Η Μελίνα Τάσσου έχει εργαστεί σε Château Malescot St Exupéry και Château Smith Haut Lafitte (Bordeaux), Domaine Christophe Perrot-Minot (Βουργουνδία) και Brown Brothers (Αυστραλία) — εμπειρίες που συνδύασε σε αυτό που το κτήμα ονομάζει «Θρακιώτικη οινοποίηση»: επιστημονικός έλεγχος ποιότητας από τη Σχολή του Bordeaux, αμπελουργικό σύστημα εμπνευσμένο από την Αυστραλία, παραδοσιακή οινοποίηση από τη Βουργουνδία. Ο αδερφός της, Βασίλης Τάσσου (Γεωπόνος, MSc Food Economics & Marketing, Reading), επιμελείται τους 100 στρεμμάτων ιδιόκτητους βιολογικούς αμπελώνες στη Μαρώνεια και είναι Εμπορικός Διευθυντής. Η φιλοσοφία βασίζεται στην ελάχιστη παρέμβαση, την αντικατάσταση μηχανημάτων από το χέρι όπου γίνεται, και καθημερινή γευστική δοκιμή ακόμα και κατά τη ζύμωση. Το κτήμα απασχολεί 4 μόνιμους εργαζόμενους και 20 εποχιακούς κατά τον τρύγο.",
      vineyardHectares: 10,
    },
  });

  console.log("Εμπλουτισμός του ήδη υπαρκτού Μάρων Sangiovese…");
  await prisma.wine.update({
    where: { slug: "kikones-maron-sangiovese" },
    data: {
      vintage: 2021,
      servingTemp: "16-18°C",
      foodPairings: ["Κοτόπουλο", "Γαλοπούλα", "Ζυμαρικά με κρέας"],
      description:
        "100% Sangiovese από βιολογικούς αμπελώνες στη Μαρώνεια — σπάνιο παράδειγμα της κλασικής ποικιλίας του Chianti στην Ελλάδα. Βραβευμένο με χρυσό και χάλκινο μετάλλιο σε διεθνείς διαγωνισμούς.",
    },
  });

  console.log("Νέα κρασιά…");
  const wines: Array<{
    slug: string;
    name: string;
    color: "WHITE" | "RED" | "ROSE";
    vintage: number | null;
    abv: number;
    varieties: Array<{ name: string; percentage: number }>;
    description: string;
    tastingNotes: string;
    vineyardNotes: string;
    winemakingNotes: string;
    servingTemp: string;
    foodPairings: string[];
  }> = [
    {
      slug: "kikones-maron-lefkos",
      name: "Μάρων Λευκός",
      color: "WHITE",
      vintage: 2024,
      abv: 14,
      varieties: [{ name: "Μαλαγουζιά", percentage: 100 }],
      description:
        "Το Μάρων Κίκονες παίρνει το όνομά του από τον «Μάρωνα», βασιλιά και ιερέα των αρχαίων Κικόνων. 100% Μαλαγουζιά από τη Μαρώνεια. Πολυβραβευμένο (χρυσό, ασημένιο, δύο χάλκινα μετάλλια).",
      tastingNotes:
        "Λαμπερό λευκοκίτρινο με λευκόχρυσες ανταύγειες. Αρώματα λευκών λουλουδιών, μοσχολέμονου, ανανά, ροδάκινου, βερίκοκου, γλυκό του κουταλιού λεμόνι. Στο στόμα φρέσκο, καθαρό, κομψό, λιπαρό, στρογγυλό με ισορροπημένη αισθητή οξύτητα. Επίγευση τροπικών φρούτων.",
      vineyardNotes: "Αμπελώνας στη Μαρώνεια, ερυθρό αργιλοπηλώδες έδαφος, χειρωδιαλεγμένος τρύγος.",
      winemakingNotes: "Λευκή κλασική οινοποίηση με bâtonnage.",
      servingTemp: "8-10°C",
      foodPairings: ["Ψητά θαλασσινά", "Ωμά όστρακα", "Sushi"],
    },
    {
      slug: "kikones-chardonnay",
      name: "Chardonnay Κίκονες",
      color: "WHITE",
      vintage: 2022,
      abv: 14,
      varieties: [{ name: "Chardonnay", percentage: 100 }],
      description: "100% Chardonnay από τη Μαρώνεια — το 1/3 ζυμώνει σε καινούρια δρύινα βαρέλια, τα 2/3 με κλασική λευκή οινοποίηση σε χαμηλές θερμοκρασίες.",
      tastingNotes:
        "Λαμπερό, απαλό κίτρινο με χρυσές ανταύγειες. Άχυρο, λευκόσαρκο ροδάκινο, ανανάς, λεμόνι, βανίλια και φρυγανισμένο ψωμί στη μύτη. Στο στόμα φρέσκο, καθαρό, λιπαρό με φρουτώδη επίγευση.",
      vineyardNotes: "Αμπελώνας στη Μαρώνεια, ερυθρό αργιλοπηλώδες έδαφος, χειρωδιαλεγμένος τρύγος.",
      winemakingNotes: "Ζύμωση εν μέρει στο βαρέλι, πολύμηνη χειρωνακτική bâtonnage σε δεξαμενή και βαρέλι, παλαίωση 7 μήνες σε γαλλική δρυ.",
      servingTemp: "10-12°C",
      foodPairings: ["Θαλασσινά", "Όστρακα", "Λευκό κρέας"],
    },
    {
      slug: "kikones-roze",
      name: "Ροζέ Κίκονες",
      color: "ROSE",
      vintage: 2025,
      abv: 12.5,
      varieties: [{ name: "Λημνιό", percentage: 100 }],
      description:
        "Πρώτη σοδειά το 2025 — κομψό, ανοιχτόχρωμο ροζέ από 100% Λημνιό, την αρχαιότερη καταγεγραμμένη ελληνική ποικιλία (αναφέρεται ήδη από Αριστοτέλη, Ηρόδοτο και Ιπποκράτη). Κλασική μέθοδος ροζέ οινοποίησης· λόγω της λεπτής, φτωχής σε χρωστικές φλούδας του Λημνιού, το χρώμα θυμίζει φλούδα λευκού κρεμμυδιού.",
      tastingNotes:
        "Διαυγές, λαμπερό, ανοιχτό σομόν χρώμα με χάλκινες ανταύγειες. Άνθη πορτοκαλιάς, γιασεμί, λευκά ρόδα, βερίκοκο, πεπόνι, λευκόσαρκο ροδάκινο, βατόμουρο, κεράσι, ρόδι, φράουλα, με διακριτικές spicy νότες λευκού πιπεριού και γαρύφαλλου. Στο στόμα δροσερό, αέρινο, ισορροπημένη οξύτητα, spicy μακριά επίγευση.",
      vineyardNotes: "Αμπελώνας στη Μαρώνεια, ερυθρό αργιλοπηλώδες έδαφος, χειρωδιαλεγμένος τρύγος.",
      winemakingNotes: "Κλασική μέθοδος ροζέ οινοποίησης.",
      servingTemp: "8-10°C",
      foodPairings: ["Sushi", "Ceviche", "Ψητό καλαμάρι", "Ωμά όστρακα"],
    },
    {
      slug: "kikones-limnio",
      name: "Λημνιό Κίκονες",
      color: "RED",
      vintage: null,
      abv: 13,
      varieties: [{ name: "Λημνιό", percentage: 100 }],
      description:
        "100% Λημνιό — η αρχαιότερη καταγεγραμμένη ελληνική ποικιλία, με καταγωγή τη Λήμνο (εκεί ονομάζεται «Καλαμπάκι»). Ο Αριστοτέλης την περιγράφει ως ποικιλία με πολύ δυνατή γεύση· ο Ηρόδοτος και ο Ιπποκράτης έγραψαν επίσης για το κρασί της.",
      tastingNotes:
        "Ρουμπινί με πορφυρές ανταύγειες. Δαμάσκηνο, ώριμα κεράσια, κανέλα, γαρύφαλλο, καφές, κακάο και ξανθός καπνός στη μύτη. Γεμάτο σώμα με λιωμένες τανίνες, γλυκόριζα, νότα μέντας. Μακριά, κομψή επίγευση.",
      vineyardNotes: "Αμπελώνας στη Μαρώνεια, ερυθρό αργιλοπηλώδες έδαφος, χειρωδιαλεγμένος τρύγος.",
      winemakingNotes: "Ζύμωση με ολόκληρες ρώγες, τεχνική pigeage, παλαίωση 12 μήνες σε γαλλικά δρύινα βαρέλια. Εμφιάλωση ακολλάριστο και αφιλτράριστο.",
      servingTemp: "16-18°C",
      foodPairings: ["Κόκκινο κρέας", "Μαγειρευτά", "Ψάρι με κόκκινη σάλτσα"],
    },
    {
      slug: "kikones-ippeas",
      name: "Ιππέας Κίκονες",
      color: "RED",
      vintage: 2018,
      abv: 14,
      varieties: [
        { name: "Cabernet Sauvignon", percentage: 60 },
        { name: "Merlot", percentage: 40 },
      ],
      description: "Κλασικός συνδυασμός Bordeaux — Cabernet Sauvignon και Merlot από τη Μαρώνεια. Πολυβραβευμένο (2 ασημένια, 1 χάλκινο μετάλλιο).",
      tastingNotes:
        "Ώριμο κεράσι, δαμάσκηνο, κόκκινα φρούτα (βατόμουρα, φραγκοστάφυλλα) πάνω σε φόντο ελαφρά καπνιστής δρυός, με νότες βανίλιας και μέντας. Απαλό, λιπαρό, ογκώδες στο στόμα, βελούδινες τανίνες, μακριά επίγευση.",
      vineyardNotes: "Αμπελώνας στη Μαρώνεια, ερυθρό αργιλοπηλώδες έδαφος, χειρωδιαλεγμένος τρύγος.",
      winemakingNotes: "Ζύμωση με ολόκληρες ρώγες, τεχνική pigeage, παλαίωση 12 μήνες σε γαλλικά δρύινα βαρέλια. Εμφιάλωση ακολλάριστο και αφιλτράριστο.",
      servingTemp: "16-18°C",
      foodPairings: ["Παϊδάκια", "Φιλέτο", "Άγρια πουλερικά"],
    },
    {
      slug: "kikones-syrah",
      name: "Syrah Κίκονες",
      color: "RED",
      vintage: null,
      abv: 14,
      varieties: [{ name: "Syrah", percentage: 100 }],
      description: "100% Syrah από τη Μαρώνεια. Πολυβραβευμένο (χρυσό, δύο ασημένια, χάλκινο μετάλλιο).",
      tastingNotes:
        "Πυκνό, βελούδινο, λιπαρό, με μαλακές τανίνες. Μαυροκέρασα, καφές, κακάο, γλυκόριζα και ζεστή παρουσία δρυός στη μύτη. Πολύ μακριά επίγευση.",
      vineyardNotes: "Αμπελώνας στη Μαρώνεια, ερυθρό αργιλοπηλώδες έδαφος, χειρωδιαλεγμένος τρύγος.",
      winemakingNotes: "Ζύμωση με ολόκληρες ρώγες, τεχνική pigeage, παλαίωση 12 μήνες σε γαλλικά δρύινα βαρέλια. Εμφιάλωση ακολλάριστο και αφιλτράριστο.",
      servingTemp: "16-18°C",
      foodPairings: ["Αρνάκι", "Λουκάνικα", "Ψητά κρέατα", "Κυνήγι"],
    },
  ];

  for (const w of wines) {
    const existing = await prisma.wine.findUnique({ where: { slug: w.slug } });
    if (existing) {
      console.log(`  ήδη υπάρχει, παράλειψη: ${w.name}`);
      continue;
    }
    const varietyRecords = await Promise.all(
      w.varieties.map(async (v) => ({
        variety: await prisma.variety.findUniqueOrThrow({ where: { name: v.name } }),
        percentage: v.percentage,
      }))
    );
    await prisma.wine.create({
      data: {
        name: w.name,
        slug: w.slug,
        wineryId: winery.id,
        regionId: maroneia.id,
        color: w.color,
        style: "DRY",
        vintage: w.vintage,
        abv: w.abv,
        description: w.description,
        tastingNotes: w.tastingNotes,
        vineyardNotes: w.vineyardNotes,
        winemakingNotes: w.winemakingNotes,
        servingTemp: w.servingTemp,
        foodPairings: w.foodPairings,
        status: ContentStatus.PUBLISHED,
        varieties: {
          create: varietyRecords.map((v) => ({ varietyId: v.variety.id, percentage: v.percentage })),
        },
      },
    });
    console.log(`  δημιουργήθηκε: ${w.name}`);
  }

  console.log("Ολοκληρώθηκε.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
